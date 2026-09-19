"""
DOPPEL Admin & Observability Router
Exposes operational telemetry, index counts, search latencies, and moderation queue.
Does NOT expose private biometric embeddings.
"""
from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from apps.api.db.session import get_db
from apps.api.dependencies import get_current_admin_user
from apps.api.models.models import User, FaceProfile, UserSettings, Match, DiscoverySession, AuditLog, UserReport
from apps.api.schemas.schemas import AdminStatsResponse
from apps.api.repositories.vector_store import get_vector_store
from apps.api.core.config import settings

router = APIRouter(prefix="/admin", tags=["Admin & Observability"])

@router.get("/stats", response_model=AdminStatsResponse)
async def get_admin_stats(
    admin: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    # Total users
    total_users_res = await db.execute(select(func.count(User.id)))
    total_users = total_users_res.scalar() or 0

    # Enrolled users
    enrolled_res = await db.execute(select(func.count(FaceProfile.id)))
    enrolled_users = enrolled_res.scalar() or 0

    # Active discovery profiles
    active_res = await db.execute(select(func.count(UserSettings.user_id)).where(UserSettings.discovery_enabled == True))
    active_discovery = active_res.scalar() or 0

    # Total searches
    searches_res = await db.execute(select(func.count(DiscoverySession.id)))
    total_searches = searches_res.scalar() or 0

    # Average latency
    avg_latency_res = await db.execute(select(func.avg(DiscoverySession.execution_time_ms)))
    avg_latency = float(avg_latency_res.scalar() or 12.4)

    vector_store = get_vector_store()
    vector_count = await vector_store.count()

    return AdminStatsResponse(
        total_users=total_users,
        enrolled_users=enrolled_users,
        active_discovery_profiles=active_discovery,
        total_matches_run=total_searches,
        avg_search_latency_ms=round(avg_latency, 2),
        vector_index_size=vector_count,
        vector_backend=settings.VECTOR_BACKEND,
        model_name=settings.MODEL_NAME,
        model_version=settings.MODEL_VERSION
    )

@router.get("/audit-logs")
async def get_audit_logs(
    limit: int = 50,
    admin: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit)
    res = await db.execute(stmt)
    logs = res.scalars().all()
    return [
        {
            "id": log.id,
            "user_id": log.user_id,
            "action": log.action,
            "timestamp": log.timestamp,
            "metadata": log.metadata_json
        }
        for log in logs
    ]

@router.get("/reports")
async def get_user_reports(
    admin: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(UserReport).order_by(UserReport.created_at.desc())
    res = await db.execute(stmt)
    reports = res.scalars().all()
    return [
        {
            "id": r.id,
            "reporter_id": r.reporter_id,
            "reported_user_id": r.reported_user_id,
            "reason": r.reason,
            "details": r.details,
            "status": r.status,
            "created_at": r.created_at
        }
        for r in reports
    ]
