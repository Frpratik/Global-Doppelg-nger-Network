"""
DOPPEL SQLAlchemy ORM Models
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Boolean, Float, Integer, DateTime, ForeignKey, Text, JSON, Index
)
from sqlalchemy.orm import relationship
from apps.api.db.session import Base
from packages.shared.constants import AccountStatus, ProfileVisibility, ConnectionStatus

def generate_uuid() -> str:
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    display_name = Column(String(100), nullable=False)
    username = Column(String(50), unique=True, nullable=False, index=True)
    avatar = Column(String(500), nullable=True)
    is_admin = Column(Boolean, default=False)
    email_verified = Column(Boolean, default=False)
    account_status = Column(String(30), default=AccountStatus.ACTIVE.value, index=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    consent = relationship("Consent", back_populates="user", uselist=False, cascade="all, delete-orphan")
    face_profile = relationship("FaceProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    settings = relationship("UserSettings", back_populates="user", uselist=False, cascade="all, delete-orphan")
    image_assets = relationship("ImageAsset", back_populates="user", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="user", cascade="all, delete-orphan")


class Consent(Base):
    __tablename__ = "consents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    biometric_processing_consent = Column(Boolean, default=False, nullable=False)
    discovery_consent = Column(Boolean, default=False, nullable=False)
    consent_version = Column(String(20), default="v1.0.0", nullable=False)
    accepted_at = Column(DateTime(timezone=True), nullable=True)
    revoked_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="consent")


class FaceProfile(Base):
    __tablename__ = "face_profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    model_name = Column(String(100), nullable=False)
    model_version = Column(String(50), nullable=False)
    embedding_dimension = Column(Integer, default=512, nullable=False)
    quality_score = Column(Float, nullable=False)
    blur_score = Column(Float, nullable=True)
    brightness_score = Column(Float, nullable=True)
    face_box = Column(JSON, nullable=True)  # [x, y, w, h]
    enrollment_status = Column(String(30), default="enrolled", nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="face_profile")


class UserSettings(Base):
    __tablename__ = "user_settings"

    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True, index=True)
    profile_visibility = Column(String(30), default=ProfileVisibility.DISCOVERY_ONLY.value)
    discovery_enabled = Column(Boolean, default=True, index=True)
    allow_contact_requests = Column(Boolean, default=True)
    show_city = Column(Boolean, default=False)
    city_name = Column(String(100), nullable=True)
    bio = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="settings")


class Match(Base):
    __tablename__ = "matches"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    requester_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    matched_user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    similarity_score = Column(Float, nullable=False)
    ranking = Column(Integer, nullable=False)
    session_id = Column(String(36), nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        Index("idx_requester_created", "requester_id", "created_at"),
    )


class DiscoverySession(Base):
    __tablename__ = "discovery_sessions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    model_version = Column(String(50), nullable=False)
    search_parameters = Column(JSON, nullable=True)
    result_count = Column(Integer, default=0)
    execution_time_ms = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class ImageAsset(Base):
    __tablename__ = "image_assets"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    storage_key = Column(String(500), nullable=False)
    purpose = Column(String(50), default="avatar")  # 'avatar', 'enrollment_temp'
    mime_type = Column(String(50), nullable=False)
    size_bytes = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="image_assets")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    action = Column(String(100), nullable=False, index=True)
    ip_address = Column(String(50), nullable=True)
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)
    metadata_json = Column(JSON, nullable=True)

    user = relationship("User", back_populates="audit_logs")


class ConnectionRequest(Base):
    __tablename__ = "connection_requests"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    sender_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    receiver_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(30), default=ConnectionStatus.PENDING.value)
    message = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class UserReport(Base):
    __tablename__ = "user_reports"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    reporter_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    reported_user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    reason = Column(String(100), nullable=False)
    details = Column(Text, nullable=True)
    status = Column(String(30), default="pending")  # pending, reviewed, dismissed
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class UserBlock(Base):
    __tablename__ = "user_blocks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    blocker_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    blocked_user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        Index("idx_blocker_blocked", "blocker_id", "blocked_user_id", unique=True),
    )
