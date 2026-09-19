"""
DOPPEL Twin Direct Messaging & Chat Router
Permits secure peer-to-peer messaging exclusively between mutually accepted Doppel twins.
"""
from typing import List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_, desc, update, func
from apps.api.db.session import get_db
from apps.api.dependencies import get_current_user
from apps.api.models.models import User, ConnectionRequest, DirectMessage, UserSettings, UserBlock
from apps.api.schemas.schemas import (
    ChatMessageCreate, ChatMessageResponse, ChatConversationSummary
)
from apps.api.core.errors import NotFoundError, DoppelException
from packages.shared.constants import ConnectionStatus, ErrorCode
from services.matching_engine.matcher import get_matching_engine

router = APIRouter(prefix="/chat", tags=["Twin Direct Messaging"])

async def verify_accepted_twin_connection(user_a_id: str, user_b_id: str, db: AsyncSession) -> bool:
    """Verify that both users are mutually accepted twins and not blocked."""
    # Check blocks
    block_stmt = select(UserBlock).where(
        or_(
            and_(UserBlock.blocker_id == user_a_id, UserBlock.blocked_user_id == user_b_id),
            and_(UserBlock.blocker_id == user_b_id, UserBlock.blocked_user_id == user_a_id)
        )
    )
    b_res = await db.execute(block_stmt)
    if b_res.scalar_one_or_none():
        return False

    conn_stmt = select(ConnectionRequest).where(
        or_(
            and_(ConnectionRequest.sender_id == user_a_id, ConnectionRequest.receiver_id == user_b_id),
            and_(ConnectionRequest.sender_id == user_b_id, ConnectionRequest.receiver_id == user_a_id)
        ),
        ConnectionRequest.status == ConnectionStatus.ACCEPTED.value
    )
    c_res = await db.execute(conn_stmt)
    return c_res.scalar_one_or_none() is not None

@router.get("/conversations", response_model=List[ChatConversationSummary])
async def get_twin_conversations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve all active twin chat conversations with latest messages and unread counts."""
    # 1. Fetch accepted twin connections
    conn_stmt = select(ConnectionRequest).where(
        or_(
            ConnectionRequest.sender_id == current_user.id,
            ConnectionRequest.receiver_id == current_user.id
        ),
        ConnectionRequest.status == ConnectionStatus.ACCEPTED.value
    ).order_by(ConnectionRequest.updated_at.desc())
    conn_res = await db.execute(conn_stmt)
    connections = conn_res.scalars().all()

    if not connections:
        return []

    twin_ids = [c.receiver_id if c.sender_id == current_user.id else c.sender_id for c in connections]

    # 2. Fetch twin users
    users_stmt = select(User).where(User.id.in_(twin_ids))
    users_res = await db.execute(users_stmt)
    users_map = {u.id: u for u in users_res.scalars().all()}

    # 3. Compute or fetch similarity & last message for each twin
    matching_engine = get_matching_engine()
    req_emb = await matching_engine.vector_store.get_embedding(current_user.id)

    conversations = []
    for twin_id in twin_ids:
        twin_user = users_map.get(twin_id)
        if not twin_user:
            continue

        # Get last message
        last_msg_stmt = select(DirectMessage).where(
            or_(
                and_(DirectMessage.sender_id == current_user.id, DirectMessage.receiver_id == twin_id),
                and_(DirectMessage.sender_id == twin_id, DirectMessage.receiver_id == current_user.id)
            )
        ).order_by(DirectMessage.created_at.desc()).limit(1)
        last_msg_res = await db.execute(last_msg_stmt)
        last_msg = last_msg_res.scalar_one_or_none()

        # Get unread count
        unread_stmt = select(func.count(DirectMessage.id)).where(
            DirectMessage.sender_id == twin_id,
            DirectMessage.receiver_id == current_user.id,
            DirectMessage.is_read == False
        )
        unread_res = await db.execute(unread_stmt)
        unread_count = unread_res.scalar() or 0

        # Calculate likeness score
        sim_score = 80.0
        try:
            cand_emb = await matching_engine.vector_store.get_embedding(twin_id)
            if req_emb and cand_emb:
                dot = sum(a * b for a, b in zip(req_emb, cand_emb))
                sim_score = round(max(0.0, min(1.0, dot)) * 100, 1)
        except Exception:
            pass

        conversations.append(
            ChatConversationSummary(
                twin_id=twin_user.id,
                display_name=twin_user.display_name,
                username=twin_user.username,
                avatar=twin_user.avatar,
                similarity_score=sim_score,
                last_message=last_msg.content if last_msg else None,
                last_message_at=last_msg.created_at if last_msg else None,
                unread_count=unread_count
            )
        )

    # Sort conversations by latest message timestamp or username
    conversations.sort(
        key=lambda x: x.last_message_at.timestamp() if x.last_message_at else 0,
        reverse=True
    )
    return conversations

@router.get("/conversations/{twin_id}/messages", response_model=List[ChatMessageResponse])
async def get_twin_messages(
    twin_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve message history with an accepted twin."""
    is_twin = await verify_accepted_twin_connection(current_user.id, twin_id, db)
    if not is_twin:
        raise DoppelException(
            status_code=status.HTTP_403_FORBIDDEN,
            error_code=ErrorCode.FORBIDDEN,
            message="You must both accept a Twin Connection request before chatting."
        )

    # Fetch messages
    msg_stmt = select(DirectMessage).where(
        or_(
            and_(DirectMessage.sender_id == current_user.id, DirectMessage.receiver_id == twin_id),
            and_(DirectMessage.sender_id == twin_id, DirectMessage.receiver_id == current_user.id)
        )
    ).order_by(DirectMessage.created_at.asc())
    msg_res = await db.execute(msg_stmt)
    messages = msg_res.scalars().all()

    # Mark unread incoming messages as read
    await db.execute(
        update(DirectMessage)
        .where(DirectMessage.sender_id == twin_id, DirectMessage.receiver_id == current_user.id, DirectMessage.is_read == False)
        .values(is_read=True)
    )
    await db.commit()

    return [
        ChatMessageResponse(
            id=m.id,
            sender_id=m.sender_id,
            receiver_id=m.receiver_id,
            content=m.content,
            is_read=m.is_read,
            created_at=m.created_at,
            is_mine=(m.sender_id == current_user.id)
        )
        for m in messages
    ]

@router.post("/conversations/{twin_id}/messages", response_model=ChatMessageResponse, status_code=status.HTTP_201_CREATED)
async def send_twin_message(
    twin_id: str,
    payload: ChatMessageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Send a direct message to an accepted Doppel twin."""
    if twin_id == current_user.id:
        raise DoppelException(status_code=400, error_code=ErrorCode.VALIDATION_ERROR, message="Cannot message yourself.")

    is_twin = await verify_accepted_twin_connection(current_user.id, twin_id, db)
    if not is_twin:
        raise DoppelException(
            status_code=status.HTTP_403_FORBIDDEN,
            error_code=ErrorCode.FORBIDDEN,
            message="You must both accept a Twin Connection request before chatting."
        )

    msg = DirectMessage(
        sender_id=current_user.id,
        receiver_id=twin_id,
        content=payload.content.strip(),
        is_read=False
    )
    db.add(msg)
    await db.commit()
    await db.refresh(msg)

    return ChatMessageResponse(
        id=msg.id,
        sender_id=msg.sender_id,
        receiver_id=msg.receiver_id,
        content=msg.content,
        is_read=msg.is_read,
        created_at=msg.created_at,
        is_mine=True
    )
