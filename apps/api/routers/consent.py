"""
DOPPEL Consent Router
Manages Biometric Processing Agreement, Discovery Searchability Consent, and Revocation Trails.
"""
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from apps.api.db.session import get_db
from apps.api.dependencies import get_current_user
from apps.api.models.models import User, Consent, UserSettings, AuditLog
from apps.api.schemas.schemas import ConsentUpdateRequest, ConsentResponse
from apps.api.repositories.vector_store import get_vector_store

router = APIRouter(prefix="/consent", tags=["Biometric Consent"])

@router.get("", response_model=ConsentResponse)
async def get_consent_status(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Consent).where(Consent.user_id == current_user.id)
    res = await db.execute(stmt)
    consent = res.scalar_one_or_none()
    
    if not consent:
        # Generate default unconsented record
        consent = Consent(
            user_id=current_user.id,
            biometric_processing_consent=False,
            discovery_consent=False,
            consent_version="v1.0.0"
        )
        db.add(consent)
        await db.commit()
        await db.refresh(consent)

    return ConsentResponse(
        user_id=current_user.id,
        biometric_processing_consent=consent.biometric_processing_consent,
        discovery_consent=consent.discovery_consent,
        consent_version=consent.consent_version,
        accepted_at=consent.accepted_at,
        revoked_at=consent.revoked_at
    )

@router.post("", response_model=ConsentResponse)
async def update_consent_status(
    payload: ConsentUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Consent).where(Consent.user_id == current_user.id)
    res = await db.execute(stmt)
    consent = res.scalar_one_or_none()

    now = datetime.now(timezone.utc)
    if not consent:
        consent = Consent(user_id=current_user.id, consent_version="v1.0.0")
        db.add(consent)

    prev_biometric = consent.biometric_processing_consent
    prev_discovery = consent.discovery_consent

    consent.biometric_processing_consent = payload.biometric_processing_consent
    consent.discovery_consent = payload.discovery_consent

    if payload.biometric_processing_consent and not prev_biometric:
        consent.accepted_at = now
        consent.revoked_at = None
    elif not payload.biometric_processing_consent and prev_biometric:
        consent.revoked_at = now

    # Synchronize UserSettings discovery_enabled
    sett_stmt = select(UserSettings).where(UserSettings.user_id == current_user.id)
    sett_res = await db.execute(sett_stmt)
    user_settings = sett_res.scalar_one_or_none()
    if user_settings:
        user_settings.discovery_enabled = payload.discovery_consent

    # Audit log
    audit = AuditLog(
        user_id=current_user.id,
        action="CONSENT_UPDATED",
        metadata_json={
            "biometric_processing_consent": payload.biometric_processing_consent,
            "discovery_consent": payload.discovery_consent
        }
    )
    db.add(audit)
    await db.commit()
    await db.refresh(consent)

    return ConsentResponse(
        user_id=current_user.id,
        biometric_processing_consent=consent.biometric_processing_consent,
        discovery_consent=consent.discovery_consent,
        consent_version=consent.consent_version,
        accepted_at=consent.accepted_at,
        revoked_at=consent.revoked_at
    )
