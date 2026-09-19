"""
DOPPEL Pydantic Request/Response Schemas
"""
from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field
from packages.shared.constants import ProfileVisibility, ConnectionStatus, AccountStatus

# ----------------- Auth & User Schemas -----------------
class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, description="Password at least 8 chars")
    display_name: str = Field(..., min_length=2, max_length=100)
    username: str = Field(..., min_length=3, max_length=30)
    biometric_consent: bool = Field(default=False, description="Explicit biometric consent")
    discovery_consent: bool = Field(default=False, description="Explicit discovery consent")

class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class UserProfileResponse(BaseModel):
    id: str
    email: str
    display_name: str
    username: str
    avatar: Optional[str] = None
    is_admin: bool = False
    account_status: str
    created_at: datetime
    has_biometric_consent: bool = False
    has_discovery_consent: bool = False
    is_enrolled: bool = False
    settings: Optional[Dict[str, Any]] = None

class UserSettingsUpdateRequest(BaseModel):
    profile_visibility: Optional[ProfileVisibility] = None
    discovery_enabled: Optional[bool] = None
    allow_contact_requests: Optional[bool] = None
    show_city: Optional[bool] = None
    city_name: Optional[str] = None
    bio: Optional[str] = None

# ----------------- Consent Schemas -----------------
class ConsentUpdateRequest(BaseModel):
    biometric_processing_consent: bool
    discovery_consent: bool

class ConsentResponse(BaseModel):
    user_id: str
    biometric_processing_consent: bool
    discovery_consent: bool
    consent_version: str
    accepted_at: Optional[datetime] = None
    revoked_at: Optional[datetime] = None

# ----------------- Face AI & Quality Schemas -----------------
class QualityCheckResponse(BaseModel):
    quality_score: float
    acceptable: bool
    blur_score: float
    brightness_score: float
    face_count: int
    face_box: Optional[List[int]] = None
    warnings: List[str] = []

class FaceEnrollmentResponse(BaseModel):
    status: str
    quality_score: float
    model_name: str
    model_version: str
    message: str
    face_box: Optional[List[int]] = None

class FaceProfileSummary(BaseModel):
    model_name: str
    model_version: str
    quality_score: float
    enrollment_status: str
    created_at: datetime

# ----------------- Matching & Discovery Schemas -----------------
class DoppelMatchItem(BaseModel):
    match_id: str
    matched_user_id: str
    display_name: str
    username: str
    avatar: Optional[str] = None
    city_name: Optional[str] = None
    bio: Optional[str] = None
    similarity_score: float  # Percentage-normalized scale e.g. 94.2
    raw_distance: float
    ranking: int
    allow_contact: bool = True
    match_explanation: Optional[str] = None

class MatchSearchResponse(BaseModel):
    session_id: str
    total_searched: int
    matches_found: int
    execution_time_ms: float
    matches: List[DoppelMatchItem]

class MatchHistoryResponse(BaseModel):
    matches: List[DoppelMatchItem]

# ----------------- Social & Moderation Schemas -----------------
class ConnectionRequestCreate(BaseModel):
    receiver_id: str
    message: Optional[str] = None

class ConnectionResponse(BaseModel):
    id: str
    sender_id: str
    receiver_id: str
    status: str
    message: Optional[str]
    created_at: datetime

class ReportCreateRequest(BaseModel):
    reported_user_id: str
    reason: str
    details: Optional[str] = None

class BlockUserRequest(BaseModel):
    blocked_user_id: str

# ----------------- AI Assistant & RAG Schemas -----------------
class AIChatRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None

class AIChatResponse(BaseModel):
    reply: str
    suggested_questions: List[str] = []
    sources: List[str] = []

# ----------------- Admin Schemas -----------------
class AdminStatsResponse(BaseModel):
    total_users: int
    enrolled_users: int
    active_discovery_profiles: int
    total_matches_run: int
    avg_search_latency_ms: float
    vector_index_size: int
    vector_backend: str
    model_name: str
    model_version: str
