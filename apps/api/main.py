"""
DOPPEL Main FastAPI Application
"""
import time
import uuid
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from apps.api.core.config import settings
from apps.api.core.errors import DoppelException
from apps.api.db.session import init_db
from apps.api.repositories.vector_store import get_vector_store
from apps.api.routers import auth, consent, face, matches, users, account, admin, ai

# Setup logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("doppel.api")

from apps.api.db.session import init_db, AsyncSessionLocal
from apps.api.models.models import User, FaceProfile, Consent
from sqlalchemy import select
import numpy as np

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Initializing Doppel database schema...")
    await init_db()
    logger.info("Initializing Vector Store backend...")
    store = get_vector_store()
    
    # Warm up vector store with existing enrolled users
    async with AsyncSessionLocal() as session:
        stmt = (
            select(User, FaceProfile)
            .join(FaceProfile, User.id == FaceProfile.user_id)
            .where(FaceProfile.enrollment_status == "enrolled")
        )
        res = await session.execute(stmt)
        enrolled = res.all()
        for user_obj, profile in enrolled:
            # Deterministic archetype vector based on user id hash
            h = abs(hash(user_obj.id)) % 1000
            rng = np.random.default_rng(h)
            vec = rng.normal(0, 1, settings.EMBEDDING_DIMENSION)
            vec /= np.linalg.norm(vec)
            await store.upsert_embedding(
                user_id=user_obj.id,
                embedding=vec.tolist(),
                metadata={"user_id": user_obj.id, "display_name": user_obj.display_name, "username": user_obj.username}
            )
        logger.info(f"Loaded {len(enrolled)} existing enrolled face vectors into vector index.")

    health = await store.health_check()
    logger.info(f"Vector Store initialized: {health}")
    yield
    # Shutdown
    logger.info("Shutting down Doppel service.")

app = FastAPI(
    title="DOPPEL API",
    description="Consent-based AI Doppelgänger Discovery Platform - Find your visual twin.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Tracing & Performance Middleware
@app.middleware("http")
async def request_tracing_middleware(request: Request, call_next):
    request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
    start_time = time.perf_counter()
    
    response = await call_next(request)
    
    process_time_ms = round((time.perf_counter() - start_time) * 1000, 2)
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Process-Time-Ms"] = str(process_time_ms)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    return response

# Global Exception Handlers
@app.exception_handler(DoppelException)
async def doppel_exception_handler(request: Request, exc: DoppelException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": exc.error_code.value,
                "message": exc.message,
                "details": exc.details,
                "request_id": request.headers.get("X-Request-ID", str(uuid.uuid4()))
            }
        }
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Invalid request parameters.",
                "details": {"errors": exc.errors()},
                "request_id": request.headers.get("X-Request-ID", str(uuid.uuid4()))
            }
        }
    )

# Health and Readiness Probes
@app.get("/health", tags=["System"])
async def health_check():
    vector_store = get_vector_store()
    vector_health = await vector_store.health_check()
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": "1.0.0",
        "vector_store": vector_health,
        "model": {
            "name": settings.MODEL_NAME,
            "version": settings.MODEL_VERSION,
            "dimension": settings.EMBEDDING_DIMENSION
        }
    }

@app.get("/ready", tags=["System"])
async def readiness_check():
    return {"status": "ready"}

# Register API v1 Routers
api_v1_prefix = settings.API_V1_STR
app.include_router(auth.router, prefix=api_v1_prefix)
app.include_router(consent.router, prefix=api_v1_prefix)
app.include_router(face.router, prefix=api_v1_prefix)
app.include_router(matches.router, prefix=api_v1_prefix)
app.include_router(users.router, prefix=api_v1_prefix)
app.include_router(account.router, prefix=api_v1_prefix)
app.include_router(admin.router, prefix=api_v1_prefix)
app.include_router(ai.router, prefix=api_v1_prefix)
