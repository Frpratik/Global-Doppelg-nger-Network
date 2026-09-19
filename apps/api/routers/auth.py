"""
DOPPEL Auth Router
Handles User Registration, Login, Token Refresh, and Profile retrieval.
"""
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from apps.api.db.session import get_db
from apps.api.core.security import get_password_hash, verify_password, create_access_token, create_refresh_token, decode_token
from apps.api.core.errors import AuthenticationError, DoppelException
from apps.api.models.models import User, Consent, UserSettings, FaceProfile, AuditLog
from apps.api.schemas.schemas import (
    UserRegisterRequest, UserLoginRequest, TokenResponse, RefreshTokenRequest, UserProfileResponse
)
from apps.api.dependencies import get_current_user
from packages.shared.constants import ErrorCode, AccountStatus, ProfileVisibility

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register_user(payload: UserRegisterRequest, db: AsyncSession = Depends(get_db)):
    # Check existing user
    stmt = select(User).where(or_(User.email == payload.email, User.username == payload.username))
    res = await db.execute(stmt)
    existing = res.scalar_one_or_none()
    if existing:
        raise DoppelException(
            status_code=status.HTTP_409_CONFLICT,
            error_code=ErrorCode.AUTH_USER_EXISTS,
            message="A user with this email or username already exists."
        )

    # Create User
    new_user = User(
        email=payload.email,
        username=payload.username.lower(),
        display_name=payload.display_name,
        password_hash=get_password_hash(payload.password),
        avatar=f"https://api.dicebear.com/7.x/bottts/svg?seed={payload.username}",
        account_status=AccountStatus.ACTIVE.value
    )
    db.add(new_user)
    await db.flush()

    # Create Consent record
    now = datetime.now(timezone.utc)
    new_consent = Consent(
        user_id=new_user.id,
        biometric_processing_consent=payload.biometric_consent,
        discovery_consent=payload.discovery_consent,
        consent_version="v1.0.0",
        accepted_at=now if payload.biometric_consent else None
    )
    db.add(new_consent)

    # Create User Settings
    new_settings = UserSettings(
        user_id=new_user.id,
        profile_visibility=ProfileVisibility.DISCOVERY_ONLY.value,
        discovery_enabled=payload.discovery_consent,
        allow_contact_requests=True,
        show_city=False,
        city_name="",
        bio="Hello! Looking for my Doppelgänger on the network."
    )
    db.add(new_settings)

    # Log Audit event
    audit = AuditLog(
        user_id=new_user.id,
        action="USER_REGISTERED",
        metadata_json={"email": payload.email, "biometric_consent": payload.biometric_consent}
    )
    db.add(audit)

    await db.commit()
    await db.refresh(new_user)

    access_token = create_access_token(subject=new_user.id)
    refresh_token = create_refresh_token(subject=new_user.id)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user={
            "id": new_user.id,
            "email": new_user.email,
            "display_name": new_user.display_name,
            "username": new_user.username,
            "avatar": new_user.avatar,
            "is_admin": new_user.is_admin,
            "has_biometric_consent": payload.biometric_consent,
            "has_discovery_consent": payload.discovery_consent,
            "is_enrolled": False
        }
    )

@router.post("/login", response_model=TokenResponse)
async def login_user(payload: UserLoginRequest, db: AsyncSession = Depends(get_db)):
    stmt = select(User).where(User.email == payload.email)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()
    
    if not user or not verify_password(payload.password, user.password_hash):
        raise AuthenticationError("Invalid email or password.")

    if user.account_status != AccountStatus.ACTIVE.value:
        raise DoppelException(
            status_code=status.HTTP_403_FORBIDDEN,
            error_code=ErrorCode.AUTH_ACCOUNT_SUSPENDED,
            message="Your account is not active or has been suspended."
        )

    # Check consent & enrollment status
    consent_stmt = select(Consent).where(Consent.user_id == user.id)
    c_res = await db.execute(consent_stmt)
    consent = c_res.scalar_one_or_none()

    face_stmt = select(FaceProfile).where(FaceProfile.user_id == user.id)
    f_res = await db.execute(face_stmt)
    face_profile = f_res.scalar_one_or_none()

    # Log Audit
    audit = AuditLog(user_id=user.id, action="USER_LOGIN")
    db.add(audit)
    await db.commit()

    access_token = create_access_token(subject=user.id)
    refresh_token = create_refresh_token(subject=user.id)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user={
            "id": user.id,
            "email": user.email,
            "display_name": user.display_name,
            "username": user.username,
            "avatar": user.avatar,
            "is_admin": user.is_admin,
            "has_biometric_consent": consent.biometric_processing_consent if consent else False,
            "has_discovery_consent": consent.discovery_consent if consent else False,
            "is_enrolled": face_profile is not None
        }
    )

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token_endpoint(payload: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    decoded = decode_token(payload.refresh_token)
    if not decoded or decoded.get("type") != "refresh":
        raise AuthenticationError("Invalid or expired refresh token.")
    
    user_id = decoded.get("sub")
    user = await db.get(User, user_id)
    if not user or user.account_status != AccountStatus.ACTIVE.value:
        raise AuthenticationError("User not found or inactive.")

    new_access = create_access_token(subject=user.id)
    new_refresh = create_refresh_token(subject=user.id)

    return TokenResponse(
        access_token=new_access,
        refresh_token=new_refresh,
        user={
            "id": user.id,
            "email": user.email,
            "display_name": user.display_name,
            "username": user.username,
            "avatar": user.avatar,
            "is_admin": user.is_admin
        }
    )

@router.get("/me", response_model=UserProfileResponse)
async def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    consent_stmt = select(Consent).where(Consent.user_id == current_user.id)
    c_res = await db.execute(consent_stmt)
    consent = c_res.scalar_one_or_none()

    face_stmt = select(FaceProfile).where(FaceProfile.user_id == current_user.id)
    f_res = await db.execute(face_stmt)
    face_profile = f_res.scalar_one_or_none()

    settings_stmt = select(UserSettings).where(UserSettings.user_id == current_user.id)
    s_res = await db.execute(settings_stmt)
    user_settings = s_res.scalar_one_or_none()

    return UserProfileResponse(
        id=current_user.id,
        email=current_user.email,
        display_name=current_user.display_name,
        username=current_user.username,
        avatar=current_user.avatar,
        is_admin=current_user.is_admin,
        account_status=current_user.account_status,
        created_at=current_user.created_at,
        has_biometric_consent=consent.biometric_processing_consent if consent else False,
        has_discovery_consent=consent.discovery_consent if consent else False,
        is_enrolled=face_profile is not None,
        settings={
            "profile_visibility": user_settings.profile_visibility if user_settings else ProfileVisibility.DISCOVERY_ONLY.value,
            "discovery_enabled": user_settings.discovery_enabled if user_settings else False,
            "allow_contact_requests": user_settings.allow_contact_requests if user_settings else True,
            "show_city": user_settings.show_city if user_settings else False,
            "city_name": user_settings.city_name if user_settings else "",
            "bio": user_settings.bio if user_settings else ""
        } if user_settings else None
    )
