"""
DOPPEL Face AI Enrollment & Verification Pipeline
Orchestrates: Safe Decode -> Face Detection -> Face Quality Check -> Landmark Alignment -> Deep Embedding Generation
"""
from typing import Dict, Any, List, Optional, Tuple
import cv2
import numpy as np
import io
from PIL import Image
from apps.api.core.config import settings
from apps.api.core.errors import FaceQualityError
from packages.shared.constants import ErrorCode
from services.face_engine.face_detector import FaceDetector, FaceAligner
from services.face_engine.face_quality import FaceQualityEngine, QualityResult
from services.face_engine.embedding_engine import EmbeddingEngine

class PipelineResult:
    def __init__(
        self,
        success: bool,
        quality: QualityResult,
        embedding: Optional[List[float]] = None,
        aligned_face_bgr: Optional[np.ndarray] = None,
        error_code: Optional[ErrorCode] = None,
        error_message: Optional[str] = None
    ):
        self.success = success
        self.quality = quality
        self.embedding = embedding
        self.aligned_face_bgr = aligned_face_bgr
        self.error_code = error_code
        self.error_message = error_message


class FaceProcessingPipeline:
    def __init__(self):
        self.detector = FaceDetector()
        self.quality_engine = FaceQualityEngine()
        self.aligner = FaceAligner()
        self.embedding_engine = EmbeddingEngine()

    def decode_image_bytes(self, image_bytes: bytes) -> Optional[np.ndarray]:
        """Safely decode image bytes into BGR numpy array using PIL and OpenCV."""
        try:
            # Check maximum size
            if len(image_bytes) > settings.MAX_IMAGE_SIZE_BYTES:
                return None
            
            # Safe validation via Pillow
            pil_img = Image.open(io.BytesIO(image_bytes))
            pil_img.verify()
            
            # Reload for OpenCV conversion
            pil_img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
            img_rgb = np.array(pil_img)
            img_bgr = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2BGR)
            return img_bgr
        except Exception:
            return None

    def process_enrollment_image(self, image_bytes: bytes) -> PipelineResult:
        """
        Execute full enrollment validation and feature extraction pipeline.
        Enforces strict biometric quality standards and single-face verification.
        """
        img_bgr = self.decode_image_bytes(image_bytes)
        if img_bgr is None:
            empty_quality = QualityResult(
                acceptable=False,
                quality_score=0.0,
                blur_score=0.0,
                brightness_score=0.0,
                contrast_score=0.0,
                face_count=0,
                warnings=["Invalid or corrupted image format. Please upload a valid JPEG or PNG."]
            )
            return PipelineResult(
                success=False,
                quality=empty_quality,
                error_code=ErrorCode.INVALID_IMAGE_FORMAT,
                error_message="Could not decode image."
            )

        # 1. Face detection
        faces = self.detector.detect_faces(img_bgr)
        
        # 2. Quality & Single-face verification
        quality = self.quality_engine.evaluate_quality(img_bgr, faces)
        
        if quality.face_count == 0:
            return PipelineResult(
                success=False,
                quality=quality,
                error_code=ErrorCode.FACE_NOT_DETECTED,
                error_message="No face detected. Please ensure your face is well-lit and facing the camera directly."
            )

        if quality.face_count > 1:
            return PipelineResult(
                success=False,
                quality=quality,
                error_code=ErrorCode.MULTIPLE_FACES_DETECTED,
                error_message=f"Multiple faces detected ({quality.face_count}). Doppel enrollment requires a single-person portrait."
            )

        if not quality.acceptable:
            error_code = ErrorCode.IMAGE_TOO_BLURRY if "blurry" in " ".join(quality.warnings) else ErrorCode.IMAGE_TOO_DARK
            return PipelineResult(
                success=False,
                quality=quality,
                error_code=error_code,
                error_message=quality.warnings[0] if quality.warnings else "Image does not meet quality requirements."
            )

        # 3. Landmark detection & Face Alignment
        face_box = quality.face_box or faces[0]
        x, y, w, h = face_box
        face_roi = img_bgr[max(0, y):min(img_bgr.shape[0], y+h), max(0, x):min(img_bgr.shape[1], x+w)]
        eyes = self.detector.detect_eyes(face_roi)
        aligned_face = self.aligner.align_face(img_bgr, face_box, eyes)

        # 4. Generate 512-d L2-normalized embedding
        embedding = self.embedding_engine.generate_embedding(aligned_face)

        return PipelineResult(
            success=True,
            quality=quality,
            embedding=embedding,
            aligned_face_bgr=aligned_face
        )

# Global singleton
_pipeline_instance: Optional[FaceProcessingPipeline] = None

def get_face_pipeline() -> FaceProcessingPipeline:
    global _pipeline_instance
    if _pipeline_instance is None:
        _pipeline_instance = FaceProcessingPipeline()
    return _pipeline_instance
