"""
DOPPEL Application Configuration
"""
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )

    PROJECT_NAME: str = "DOPPEL"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "doppel-super-secure-production-secret-key-change-in-prod-128bits"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./doppel.db"
    SYNC_DATABASE_URL: str = "sqlite:///./doppel.db"

    # Vector Store
    VECTOR_BACKEND: str = "memory"  # options: 'postgres', 'qdrant', 'memory'
    QDRANT_URL: Optional[str] = None
    QDRANT_API_KEY: Optional[str] = None
    QDRANT_COLLECTION: str = "doppel_face_vectors"

    # Face AI Engine
    EMBEDDING_DIMENSION: int = 512
    MODEL_NAME: str = "ArcFace-MobileFaceNet-ONNX"
    MODEL_VERSION: str = "v1.2.0"
    DEFAULT_MATCH_THRESHOLD: float = 0.58  # Cosine similarity threshold for visually similar
    TOP_K_MATCHES: int = 10
    MAX_IMAGE_SIZE_BYTES: int = 10 * 1024 * 1024  # 10 MB

    # Quality Thresholds
    MIN_QUALITY_SCORE: float = 0.55
    MIN_BLUR_SCORE: float = 60.0  # Laplacian variance
    MIN_BRIGHTNESS: float = 35.0  # 0-255 scale
    MAX_BRIGHTNESS: float = 230.0
    MIN_FACE_PERCENTAGE: float = 0.08  # At least 8% of total area

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    SEARCH_RATE_LIMIT_PER_MINUTE: int = 15

    # Storage
    STORAGE_BACKEND: str = "local"
    LOCAL_STORAGE_DIR: str = "./uploads"

    # LLM (Optional / Local)
    LLM_PROVIDER: str = "mock"  # options: 'ollama', 'openai_compatible', 'mock'
    OLLAMA_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "qwen2.5:3b"

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "*"
    ]

settings = Settings()
