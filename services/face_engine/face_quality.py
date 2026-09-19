"""
DOPPEL Face Quality Engine
Evaluates image clarity, blur (Laplacian variance), brightness, contrast, face size, and pose.
"""
from typing import Dict, Any, List, Tuple, Optional
import numpy as np
import cv2
from apps.api.core.config import settings

class QualityResult:
    def __init__(
        self,
        acceptable: bool,
        quality_score: float,
        blur_score: float,
        brightness_score: float,
        contrast_score: float,
        face_count: int,
        face_box: Optional[List[int]] = None,
        warnings: Optional[List[str]] = None
    ):
        self.acceptable = acceptable
        self.quality_score = float(round(quality_score, 4))
        self.blur_score = float(round(blur_score, 2))
        self.brightness_score = float(round(brightness_score, 2))
        self.contrast_score = float(round(contrast_score, 2))
        self.face_count = face_count
        self.face_box = face_box
        self.warnings = warnings or []

    def to_dict(self) -> Dict[str, Any]:
        return {
            "acceptable": self.acceptable,
            "quality_score": self.quality_score,
            "blur_score": self.blur_score,
            "brightness_score": self.brightness_score,
            "contrast_score": self.contrast_score,
            "face_count": self.face_count,
            "face_box": self.face_box,
            "warnings": self.warnings
        }


class FaceQualityEngine:
    def __init__(
        self,
        min_blur: float = settings.MIN_BLUR_SCORE,
        min_brightness: float = settings.MIN_BRIGHTNESS,
        max_brightness: float = settings.MAX_BRIGHTNESS,
        min_face_pct: float = settings.MIN_FACE_PERCENTAGE
    ):
        self.min_blur = min_blur
        self.min_brightness = min_brightness
        self.max_brightness = max_brightness
        self.min_face_pct = min_face_pct

    def compute_blur(self, gray_image: np.ndarray) -> float:
        """Compute image sharpness using Laplacian variance."""
        laplacian = cv2.Laplacian(gray_image, cv2.CV_64F)
        variance = laplacian.var()
        return float(variance)

    def compute_brightness_and_contrast(self, gray_image: np.ndarray) -> Tuple[float, float]:
        """Compute mean brightness (0-255) and standard deviation for contrast."""
        mean_val = float(np.mean(gray_image))
        std_val = float(np.std(gray_image))
        return mean_val, std_val

    def evaluate_quality(
        self,
        image_bgr: np.ndarray,
        detected_faces: List[List[int]]
    ) -> QualityResult:
        """
        Evaluate full quality of image and detected face.
        detected_faces: List of [x, y, w, h]
        """
        warnings: List[str] = []
        face_count = len(detected_faces)
        
        if face_count == 0:
            return QualityResult(
                acceptable=False,
                quality_score=0.0,
                blur_score=0.0,
                brightness_score=0.0,
                contrast_score=0.0,
                face_count=0,
                warnings=["No face detected in the image."]
            )

        if face_count > 1:
            return QualityResult(
                acceptable=False,
                quality_score=0.0,
                blur_score=0.0,
                brightness_score=0.0,
                contrast_score=0.0,
                face_count=face_count,
                warnings=[f"Multiple faces detected ({face_count}). Only individual portraits are accepted for enrollment."]
            )

        # Exactly 1 face
        face_box = detected_faces[0]
        x, y, w, h = face_box
        img_h, img_w = image_bgr.shape[:2]
        
        # Crop face ROI
        x1, y1 = max(0, x), max(0, y)
        x2, y2 = min(img_w, x + w), min(img_h, y + h)
        face_roi = image_bgr[y1:y2, x1:x2]

        if face_roi.size == 0:
            return QualityResult(
                acceptable=False,
                quality_score=0.0,
                blur_score=0.0,
                brightness_score=0.0,
                contrast_score=0.0,
                face_count=1,
                warnings=["Invalid face region boundaries."]
            )

        gray_roi = cv2.cvtColor(face_roi, cv2.COLOR_BGR2GRAY)
        
        # 1. Blur evaluation
        blur_score = self.compute_blur(gray_roi)
        blur_norm = min(1.0, blur_score / 250.0)
        if blur_score < self.min_blur:
            warnings.append(f"Image is too blurry (sharpness score {blur_score:.1f}, minimum required: {self.min_blur:.1f}).")

        # 2. Brightness & Contrast
        brightness, contrast = self.compute_brightness_and_contrast(gray_roi)
        
        if brightness < self.min_brightness:
            warnings.append(f"Image is too dark (brightness {brightness:.1f}, recommended > {self.min_brightness}).")
        elif brightness > self.max_brightness:
            warnings.append(f"Image is overexposed (brightness {brightness:.1f}, recommended < {self.max_brightness}).")
        
        if contrast < 20.0:
            warnings.append("Low image contrast. Face features may not be distinct.")

        brightness_norm = 1.0 - (abs(brightness - 128.0) / 128.0)
        contrast_norm = min(1.0, contrast / 60.0)

        # 3. Face size relative to frame
        img_area = img_h * img_w
        face_area = w * h
        face_ratio = face_area / float(img_area) if img_area > 0 else 0
        if face_ratio < self.min_face_pct:
            warnings.append("Face is too small in the frame. Please move closer to the camera.")

        size_norm = min(1.0, face_ratio / 0.25)

        # Composite Quality Score (Weighted average)
        composite_score = (
            0.35 * blur_norm +
            0.25 * brightness_norm +
            0.20 * contrast_norm +
            0.20 * size_norm
        )
        composite_score = max(0.0, min(1.0, composite_score))

        acceptable = (
            len(warnings) == 0 and
            composite_score >= settings.MIN_QUALITY_SCORE and
            face_count == 1
        )

        return QualityResult(
            acceptable=acceptable,
            quality_score=composite_score,
            blur_score=blur_score,
            brightness_score=brightness,
            contrast_score=contrast,
            face_count=face_count,
            face_box=face_box,
            warnings=warnings
        )
