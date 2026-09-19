"""
DOPPEL Account & Biometric Deletion Router
Provides irreversible deletion of facial embeddings, biometric profiles, and complete accounts.
"""
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from apps.api.db.session import get_db
from apps.api.dependencies import get_current_user
from apps.api.models.models import User, FaceProfile, Consent, UserSettings, ImageAsset, AuditLog
from apps.api.repositories.vector_store import get_vector_store
from packages.shared.constants import AccountStatus

router = APIRouter(prefix="/account", tags=["Account & Biometric Deletion"])

@router.delete("/face-profile")
async def delete_biometric_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Purges biometric vector from VectorStore, removes FaceProfile record, and sets consent revoked.
    """
    vector_store = get_vector_store()
    await vector_store.delete_embedding(current_user.id)

    # Delete FaceProfile
    stmt = delete(FaceProfile).where(FaceProfile.user_id == current_user.id)
    await db.execute(stmt)

    # Mark consent as revoked
    consent_stmt = select(Consent).where(Consent.user_id == current_user.id)
    c_res = await db.execute(consent_stmt)
    consent = c_res.scalar_one_or_none()
    if consent:
        consent.biometric_processing_consent = False
        consent.discovery_consent = False

    # Mark discovery off
    sett_stmt = select(UserSettings).where(UserSettings.user_id == current_user.id)
    s_res = await db.execute(sett_stmt)
    settings = s_res.scalar_one_or_none()
    if settings:
        settings.discovery_enabled = False

    audit = AuditLog(
        user_id=current_user.id,
        action="BIOMETRIC_PROFILE_DELETED",
        metadata_json={"purged_from_vector_store": True}
    )
    db.add(audit)
    await db.commit()

    return {
        "success": True,
        "message": "Your biometric embedding and face profile have been permanently deleted."
    }

@router.delete("")
async def delete_account(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Permanently deletes user account, purging all biometric embeddings, consent records,
    and profile information.
    """
    vector_store = get_vector_store()
    await vector_store.delete_embedding(current_user.id)

    # Delete user (foreign key cascade deletes all related models)
    await db.delete(current_user)
    
    # Add minimal anonymized audit record
    audit = AuditLog(
        user_id=None,
        action="ACCOUNT_DELETED_PERMANENTLY",
        metadata_json={"user_id_prefix": current_user.id[:8]}
    )
    db.add(audit)
    await db.commit()

    return {
        "success": True,
        "message": "Account and all associated biometric data permanently purged."
    }
