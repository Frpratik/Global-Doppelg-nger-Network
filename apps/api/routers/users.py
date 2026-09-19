"""
DOPPEL Users & Privacy Router
Handles User Settings, Privacy Controls, Block, Report, and Connection Requests.
"""
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_
from apps.api.db.session import get_db
from apps.api.dependencies import get_current_user
from apps.api.models.models import User, UserSettings, UserBlock, UserReport, ConnectionRequest, AuditLog
from apps.api.schemas.schemas import (
    UserSettingsUpdateRequest, ConnectionRequestCreate, ConnectionResponse,
    ReportCreateRequest, BlockUserRequest
)
from apps.api.core.errors import NotFoundError, DoppelException
from packages.shared.constants import ConnectionStatus, ErrorCode

router = APIRouter(prefix="/users", tags=["Users & Privacy Controls"])

@router.put("/settings")
async def update_user_settings(
    payload: UserSettingsUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(UserSettings).where(UserSettings.user_id == current_user.id)
    res = await db.execute(stmt)
    settings = res.scalar_one_or_none()
    
    now = datetime.now(timezone.utc)
    if not settings:
        settings = UserSettings(user_id=current_user.id)
        db.add(settings)

    if payload.profile_visibility is not None:
        settings.profile_visibility = payload.profile_visibility.value
    if payload.discovery_enabled is not None:
        settings.discovery_enabled = payload.discovery_enabled
    if payload.allow_contact_requests is not None:
        settings.allow_contact_requests = payload.allow_contact_requests
    if payload.show_city is not None:
        settings.show_city = payload.show_city
    if payload.city_name is not None:
        settings.city_name = payload.city_name
    if payload.bio is not None:
        settings.bio = payload.bio

    settings.updated_at = now
    
    # Audit log
    audit = AuditLog(
        user_id=current_user.id,
        action="SETTINGS_UPDATED",
        metadata_json=payload.model_dump(exclude_unset=True)
    )
    db.add(audit)
    await db.commit()

    return {
        "success": True,
        "message": "User privacy settings updated successfully.",
        "settings": {
            "profile_visibility": settings.profile_visibility,
            "discovery_enabled": settings.discovery_enabled,
            "allow_contact_requests": settings.allow_contact_requests,
            "show_city": settings.show_city,
            "city_name": settings.city_name,
            "bio": settings.bio
        }
    }

@router.post("/block")
async def block_user(
    payload: BlockUserRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if payload.blocked_user_id == current_user.id:
        raise DoppelException(status_code=400, error_code=ErrorCode.VALIDATION_ERROR, message="Cannot block yourself.")

    stmt = select(UserBlock).where(
        UserBlock.blocker_id == current_user.id,
        UserBlock.blocked_user_id == payload.blocked_user_id
    )
    res = await db.execute(stmt)
    existing = res.scalar_one_or_none()
    if not existing:
        block = UserBlock(blocker_id=current_user.id, blocked_user_id=payload.blocked_user_id)
        db.add(block)
        
        audit = AuditLog(
            user_id=current_user.id,
            action="USER_BLOCKED",
            metadata_json={"blocked_user_id": payload.blocked_user_id}
        )
        db.add(audit)
        await db.commit()

    return {"success": True, "message": "User blocked successfully. They will no longer appear in your searches."}

@router.post("/report")
async def report_user(
    payload: ReportCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if payload.reported_user_id == current_user.id:
        raise DoppelException(status_code=400, error_code=ErrorCode.VALIDATION_ERROR, message="Cannot report yourself.")

    report = UserReport(
        reporter_id=current_user.id,
        reported_user_id=payload.reported_user_id,
        reason=payload.reason,
        details=payload.details,
        status="pending"
    )
    db.add(report)

    audit = AuditLog(
        user_id=current_user.id,
        action="USER_REPORTED",
        metadata_json={"reported_user_id": payload.reported_user_id, "reason": payload.reason}
    )
    db.add(audit)
    await db.commit()

    return {"success": True, "message": "Report submitted to Doppel Trust & Safety for review."}

@router.post("/connect", response_model=ConnectionResponse)
async def send_connection_request(
    payload: ConnectionRequestCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if payload.receiver_id == current_user.id:
        raise DoppelException(status_code=400, error_code=ErrorCode.VALIDATION_ERROR, message="Cannot connect with yourself.")

    # Check receiver settings
    sett_stmt = select(UserSettings).where(UserSettings.user_id == payload.receiver_id)
    sett_res = await db.execute(sett_stmt)
    receiver_sett = sett_res.scalar_one_or_none()
    if receiver_sett and not receiver_sett.allow_contact_requests:
        raise DoppelException(status_code=403, error_code=ErrorCode.FORBIDDEN, message="This user has disabled connection requests.")

    # Check existing request
    req_stmt = select(ConnectionRequest).where(
        or_(
            and_(ConnectionRequest.sender_id == current_user.id, ConnectionRequest.receiver_id == payload.receiver_id),
            and_(ConnectionRequest.sender_id == payload.receiver_id, ConnectionRequest.receiver_id == current_user.id)
        )
    )
    req_res = await db.execute(req_stmt)
    existing = req_res.scalar_one_or_none()
    if existing:
        return ConnectionResponse(
            id=existing.id,
            sender_id=existing.sender_id,
            receiver_id=existing.receiver_id,
            status=existing.status,
            message=existing.message,
            created_at=existing.created_at
        )

    conn = ConnectionRequest(
        sender_id=current_user.id,
        receiver_id=payload.receiver_id,
        status=ConnectionStatus.PENDING.value,
        message=payload.message
    )
    db.add(conn)
    await db.commit()
    await db.refresh(conn)

    return ConnectionResponse(
        id=conn.id,
        sender_id=conn.sender_id,
        receiver_id=conn.receiver_id,
        status=conn.status,
        message=conn.message,
        created_at=conn.created_at
    )
