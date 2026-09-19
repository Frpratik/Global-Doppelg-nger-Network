"""
DOPPEL Face Enrollment & AI Router
Handles Image Quality Validation, 512-d ArcFace Feature Extraction, Vector Indexing, and Profile State.
"""
from datetime import datetime, timezone
import base64
import cv2
from typing import Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from apps.api.db.session import get_db
from apps.api.dependencies import get_current_user
from apps.api.core.config import settings
from apps.api.core.errors import (
    ConsentRequiredError, FaceQualityError, DoppelException
)
from apps.api.models.models import User, Consent, FaceProfile, AuditLog
from apps.api.schemas.schemas import (
    QualityCheckResponse, FaceEnrollmentResponse, FaceProfileSummary
)
from apps.api.repositories.vector_store import get_vector_store
from services.face_engine.pipeline import get_face_pipeline
from packages.shared.constants import ErrorCode

router = APIRouter(prefix="/face", tags=["Face AI Pipeline"])

@router.post("/check-quality", response_model=QualityCheckResponse)
async def check_image_quality(
    file: Optional[UploadFile] = File(None),
    image_base64: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user)
):
    """
    Real-time quality validation endpoint for frontend camera/upload preview.
    Does NOT store embeddings or index into the vector database.
    """
    pipeline = get_face_pipeline()
    
    image_bytes = None
    if file:
        image_bytes = await file.read()
    elif image_base64:
        # Strip data uri header if present
        if "base64," in image_base64:
            image_base64 = image_base64.split("base64,")[1]
        try:
            image_bytes = base64.b64decode(image_base64)
        except Exception:
            raise DoppelException(
                status_code=status.HTTP_400_BAD_REQUEST,
                error_code=ErrorCode.INVALID_IMAGE_FORMAT,
                message="Invalid Base64 image encoding."
            )

    if not image_bytes:
        raise DoppelException(
            status_code=status.HTTP_400_BAD_REQUEST,
            error_code=ErrorCode.INVALID_IMAGE_FORMAT,
            message="No image provided for quality assessment."
        )

    img_bgr = pipeline.decode_image_bytes(image_bytes)
    if img_bgr is None:
        raise DoppelException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            error_code=ErrorCode.INVALID_IMAGE_FORMAT,
            message="Could not decode image format."
        )

    faces = pipeline.detector.detect_faces(img_bgr)
    quality = pipeline.quality_engine.evaluate_quality(img_bgr, faces)

    return QualityCheckResponse(
        quality_score=quality.quality_score,
        acceptable=quality.acceptable,
        blur_score=quality.blur_score,
        brightness_score=quality.brightness_score,
        face_count=quality.face_count,
        face_box=quality.face_box,
        warnings=quality.warnings
    )

@router.post("/enroll", response_model=FaceEnrollmentResponse)
async def enroll_face(
    file: Optional[UploadFile] = File(None),
    image_base64: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Full Face Enrollment Pipeline:
    1. Authenticate user.
    2. Verify biometric processing consent.
    3. Detect single face.
    4. Validate blur, lighting & geometry.
    5. Align landmarks to 112x112.
    6. Generate 512-d normalized ArcFace embedding.
    7. Index into VectorStore.
    8. Update FaceProfile.
    """
    # 1. Verify consent
    consent_stmt = select(Consent).where(Consent.user_id == current_user.id)
    consent_res = await db.execute(consent_stmt)
    consent = consent_res.scalar_one_or_none()

    if not consent or not consent.biometric_processing_consent:
        raise ConsentRequiredError(
            "Explicit biometric processing consent is required before enrolling a facial profile."
        )

    # 2. Extract image bytes
    image_bytes = None
    if file:
        image_bytes = await file.read()
    elif image_base64:
        if "base64," in image_base64:
            image_base64 = image_base64.split("base64,")[1]
        try:
            image_bytes = base64.b64decode(image_base64)
        except Exception:
            raise DoppelException(
                status_code=status.HTTP_400_BAD_REQUEST,
                error_code=ErrorCode.INVALID_IMAGE_FORMAT,
                message="Invalid Base64 image encoding."
            )

    if not image_bytes:
        raise DoppelException(
            status_code=status.HTTP_400_BAD_REQUEST,
            error_code=ErrorCode.INVALID_IMAGE_FORMAT,
            message="No image provided for enrollment."
        )

    # 3. Process via AI Pipeline
    pipeline = get_face_pipeline()
    result = pipeline.process_enrollment_image(image_bytes)

    if not result.success:
        raise FaceQualityError(
            message=result.error_message or "Face enrollment failed quality verification.",
            error_code=result.error_code or ErrorCode.FACE_NOT_DETECTED,
            details=result.quality.to_dict()
        )

    # 4. Upsert into VectorStore
    vector_store = get_vector_store()
    await vector_store.upsert_embedding(
        user_id=current_user.id,
        embedding=result.embedding,
        metadata={
            "user_id": current_user.id,
            "display_name": current_user.display_name,
            "username": current_user.username,
            "quality_score": result.quality.quality_score,
            "model_version": settings.MODEL_VERSION
        }
    )

    # 5. Extract and save actual profile photo thumbnail as user avatar
    try:
        img_bgr = pipeline.decode_image_bytes(image_bytes)
        if img_bgr is not None:
            h, w = img_bgr.shape[:2]
            if result.quality.face_box and len(result.quality.face_box) == 4:
                fx, fy, fw, fh = result.quality.face_box
                cx, cy = fx + fw // 2, fy + fh // 2
                box_size = max(fw, fh) * 1.5
                x1 = max(0, int(cx - box_size // 2))
                y1 = max(0, int(cy - box_size // 2))
                x2 = min(w, int(cx + box_size // 2))
                y2 = min(h, int(cy + box_size // 2))
                crop = img_bgr[y1:y2, x1:x2]
            else:
                min_dim = min(h, w)
                x1 = (w - min_dim) // 2
                y1 = (h - min_dim) // 2
                crop = img_bgr[y1:y1+min_dim, x1:x1+min_dim]

            if crop.size > 0:
                resized = cv2.resize(crop, (256, 256), interpolation=cv2.INTER_AREA)
                success, enc = cv2.imencode('.jpg', resized, [int(cv2.IMWRITE_JPEG_QUALITY), 88])
                if success:
                    b64_thumb = base64.b64encode(enc.tobytes()).decode('utf-8')
                    current_user.avatar = f"data:image/jpeg;base64,{b64_thumb}"
                    db.add(current_user)
    except Exception:
        pass

    # 6. Save or update FaceProfile record in DB
    profile_stmt = select(FaceProfile).where(FaceProfile.user_id == current_user.id)
    profile_res = await db.execute(profile_stmt)
    face_profile = profile_res.scalar_one_or_none()

    now = datetime.now(timezone.utc)
    if face_profile:
        face_profile.quality_score = result.quality.quality_score
        face_profile.blur_score = result.quality.blur_score
        face_profile.brightness_score = result.quality.brightness_score
        face_profile.face_box = result.quality.face_box
        face_profile.enrollment_status = "enrolled"
        face_profile.updated_at = now
    else:
        face_profile = FaceProfile(
            user_id=current_user.id,
            model_name=settings.MODEL_NAME,
            model_version=settings.MODEL_VERSION,
            embedding_dimension=settings.EMBEDDING_DIMENSION,
            quality_score=result.quality.quality_score,
            blur_score=result.quality.blur_score,
            brightness_score=result.quality.brightness_score,
            face_box=result.quality.face_box,
            enrollment_status="enrolled",
            created_at=now
        )
        db.add(face_profile)

    # Audit log
    audit = AuditLog(
        user_id=current_user.id,
        action="FACE_ENROLLED",
        metadata_json={
            "quality_score": result.quality.quality_score,
            "model_version": settings.MODEL_VERSION
        }
    )
    db.add(audit)
    await db.commit()

    return FaceEnrollmentResponse(
        status="enrolled",
        quality_score=result.quality.quality_score,
        model_name=settings.MODEL_NAME,
        model_version=settings.MODEL_VERSION,
        message="Your Doppel facial profile has been securely generated and indexed.",
        face_box=result.quality.face_box
    )

@router.get("/profile", response_model=Optional[FaceProfileSummary])
async def get_face_profile_status(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(FaceProfile).where(FaceProfile.user_id == current_user.id)
    res = await db.execute(stmt)
    profile = res.scalar_one_or_none()
    if not profile:
        return None

    return FaceProfileSummary(
        model_name=profile.model_name,
        model_version=profile.model_version,
        quality_score=profile.quality_score,
        enrollment_status=profile.enrollment_status,
        created_at=profile.created_at
    )
