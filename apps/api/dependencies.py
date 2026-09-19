"""
DOPPEL FastAPI Dependencies
Handles JWT authentication, User extraction, DB session injection, and Admin verification.
"""
from typing import Optional
from fastapi import Depends, Header, status
from sqlalchemy.ext.asyncio import AsyncSession
from apps.api.db.session import get_db
from apps.api.core.security import decode_token
from apps.api.core.errors import AuthenticationError, PermissionDeniedError
from apps.api.models.models import User
from packages.shared.constants import AccountStatus

async def get_current_user(
    authorization: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db)
) -> User:
    """Extract and validate the currently authenticated user from Bearer JWT."""
    if not authorization or not authorization.startswith("Bearer "):
        raise AuthenticationError("Authorization header missing or invalid format.")
    
    token = authorization.split(" ")[1]
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise AuthenticationError("Invalid, expired, or malformed access token.")
    
    user_id = payload.get("sub")
    if not user_id:
        raise AuthenticationError("Token payload missing user identifier.")
    
    user = await db.get(User, user_id)
    if not user or user.account_status != AccountStatus.ACTIVE.value:
        raise AuthenticationError("User account not found, suspended, or deleted.")
    
    return user

async def get_current_admin_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Ensure the user possesses administrative privileges."""
    if not current_user.is_admin:
        raise PermissionDeniedError("Administrative privileges required for this resource.")
    return current_user
