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
from apps.api.models.models import (
    User, UserSettings, UserBlock, UserReport, ConnectionRequest, AuditLog, DirectMessage
)
from apps.api.schemas.schemas import (
    UserSettingsUpdateRequest, ConnectionRequestCreate, ConnectionResponse,
    ConnectionRespondRequest, ConnectionsListResponse, ConnectionItemResponse,
    ConnectionPeerInfo, ReportCreateRequest, BlockUserRequest
)
from apps.api.core.errors import NotFoundError, DoppelException
from packages.shared.constants import ConnectionStatus, ErrorCode
from services.matching_engine.matcher import get_matching_engine

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
@router.post("/{receiver_user_id}/connect", response_model=ConnectionResponse)
async def send_connection_request(
    payload: Optional[ConnectionRequestCreate] = None,
    receiver_user_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    target_id = receiver_user_id or (payload.receiver_id if payload else None)
    if not target_id:
        raise DoppelException(status_code=400, error_code=ErrorCode.VALIDATION_ERROR, message="Missing receiver_id.")

    if target_id == current_user.id:
        raise DoppelException(status_code=400, error_code=ErrorCode.VALIDATION_ERROR, message="Cannot connect with yourself.")

    # Check receiver settings
    sett_stmt = select(UserSettings).where(UserSettings.user_id == target_id)
    sett_res = await db.execute(sett_stmt)
    receiver_sett = sett_res.scalar_one_or_none()
    if receiver_sett and not receiver_sett.allow_contact_requests:
        raise DoppelException(status_code=403, error_code=ErrorCode.FORBIDDEN, message="This user has disabled connection requests.")

    msg_text = (payload.message or payload.note) if payload else None
    cleaned_msg = msg_text.strip() if msg_text else None

    # Check existing request
    req_stmt = select(ConnectionRequest).where(
        or_(
            and_(ConnectionRequest.sender_id == current_user.id, ConnectionRequest.receiver_id == target_id),
            and_(ConnectionRequest.sender_id == target_id, ConnectionRequest.receiver_id == current_user.id)
        )
    )
    req_res = await db.execute(req_stmt)
    existing = req_res.scalar_one_or_none()
    if existing:
        if cleaned_msg and not existing.message:
            existing.message = cleaned_msg
            # Also store direct message if missing
            dm_stmt = select(DirectMessage).where(
                DirectMessage.sender_id == current_user.id,
                DirectMessage.receiver_id == target_id,
                DirectMessage.content == cleaned_msg
            )
            dm_res = await db.execute(dm_stmt)
            if not dm_res.scalar_one_or_none():
                dm = DirectMessage(
                    sender_id=current_user.id,
                    receiver_id=target_id,
                    content=cleaned_msg,
                    is_read=False
                )
                db.add(dm)
            await db.commit()
            await db.refresh(existing)

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
        receiver_id=target_id,
        status=ConnectionStatus.PENDING.value,
        message=cleaned_msg
    )
    db.add(conn)

    # Immediately persist initial request message into DirectMessage stream
    if cleaned_msg:
        dm = DirectMessage(
            sender_id=current_user.id,
            receiver_id=target_id,
            content=cleaned_msg,
            is_read=False
        )
        db.add(dm)

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

@router.get("/connections", response_model=ConnectionsListResponse)
async def get_connections(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all Twin connections grouped by incoming, outgoing, and accepted."""
    stmt = (
        select(ConnectionRequest)
        .where(
            or_(
                ConnectionRequest.sender_id == current_user.id,
                ConnectionRequest.receiver_id == current_user.id
            )
        )
        .order_by(ConnectionRequest.created_at.desc())
    )
    res = await db.execute(stmt)
    connections = res.scalars().all()

    # Collect peer IDs
    peer_ids = set()
    for c in connections:
        peer_id = c.receiver_id if c.sender_id == current_user.id else c.sender_id
        peer_ids.add(peer_id)

    if not peer_ids:
        return ConnectionsListResponse()

    # Fetch peers with settings
    users_stmt = (
        select(User, UserSettings)
        .outerjoin(UserSettings, User.id == UserSettings.user_id)
        .where(User.id.in_(list(peer_ids)))
    )
    users_res = await db.execute(users_stmt)
    peers_map = {}
    for user_row, sett_row in users_res.all():
        show_city = sett_row.show_city if sett_row else False
        city_name = sett_row.city_name if (show_city and sett_row) else None
        bio = sett_row.bio if sett_row else None
        peers_map[user_row.id] = ConnectionPeerInfo(
            user_id=user_row.id,
            display_name=user_row.display_name,
            username=user_row.username,
            avatar=user_row.avatar,
            city_name=city_name,
            bio=bio
        )

    pending_in = []
    pending_out = []
    accepted = []

    for c in connections:
        is_sender = (c.sender_id == current_user.id)
        peer_id = c.receiver_id if is_sender else c.sender_id
        peer_info = peers_map.get(peer_id)
        if not peer_info:
            continue

        item = ConnectionItemResponse(
            id=c.id,
            status=c.status,
            message=c.message,
            created_at=c.created_at,
            is_sender=is_sender,
            peer=peer_info
        )

        if c.status == ConnectionStatus.ACCEPTED.value:
            accepted.append(item)
        elif c.status == ConnectionStatus.PENDING.value:
            if is_sender:
                pending_out.append(item)
            else:
                pending_in.append(item)

    return ConnectionsListResponse(
        pending_incoming=pending_in,
        pending_outgoing=pending_out,
        accepted_twins=accepted
    )

@router.put("/connections/{connection_id}/respond")
async def respond_to_connection(
    connection_id: str,
    payload: ConnectionRespondRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Accept or decline an incoming Twin connection request."""
    stmt = select(ConnectionRequest).where(ConnectionRequest.id == connection_id)
    res = await db.execute(stmt)
    conn = res.scalar_one_or_none()
    if not conn:
        raise NotFoundError("Connection request not found.")

    if conn.receiver_id != current_user.id:
        raise DoppelException(status_code=403, error_code=ErrorCode.FORBIDDEN, message="Only the recipient can respond to this request.")

    if payload.action.lower() == "accept":
        conn.status = ConnectionStatus.ACCEPTED.value
        msg = "Twin request accepted! You can now chat."

        # Ensure initial connection request message is recorded in chat messages
        if conn.message and conn.message.strip():
            dm_stmt = select(DirectMessage).where(
                DirectMessage.sender_id == conn.sender_id,
                DirectMessage.receiver_id == conn.receiver_id,
                DirectMessage.content == conn.message.strip()
            )
            dm_res = await db.execute(dm_stmt)
            if not dm_res.scalar_one_or_none():
                init_dm = DirectMessage(
                    sender_id=conn.sender_id,
                    receiver_id=conn.receiver_id,
                    content=conn.message.strip(),
                    is_read=False,
                    created_at=conn.created_at
                )
                db.add(init_dm)
    else:
        conn.status = "declined"
        msg = "Twin request declined."

    conn.updated_at = datetime.now(timezone.utc)
    await db.commit()

    return {"success": True, "message": msg, "status": conn.status}

@router.delete("/connections/{connection_id}")
async def delete_connection(
    connection_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Cancel or remove a Twin connection."""
    stmt = select(ConnectionRequest).where(
        ConnectionRequest.id == connection_id,
        or_(
            ConnectionRequest.sender_id == current_user.id,
            ConnectionRequest.receiver_id == current_user.id
        )
    )
    res = await db.execute(stmt)
    conn = res.scalar_one_or_none()
    if not conn:
        raise NotFoundError("Connection not found.")

    await db.delete(conn)
    await db.commit()

    return {"success": True, "message": "Connection removed."}
