"""
DOPPEL Matches & Discovery Router
Executes Vector Similarity Search, Retrieves Discovery History, and Formats Ranked Results.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from apps.api.db.session import get_db
from apps.api.dependencies import get_current_user
from apps.api.models.models import User, Match, DiscoverySession, UserSettings
from apps.api.schemas.schemas import MatchSearchResponse, MatchHistoryResponse, DoppelMatchItem
from services.matching_engine.matcher import get_matching_engine
from apps.api.core.errors import NotFoundError
from apps.api.core.config import settings

router = APIRouter(prefix="/matches", tags=["Matches & Discovery"])

@router.post("/search", response_model=MatchSearchResponse)
async def search_doppels(
    top_k: int = Query(default=10, ge=1, le=50),
    threshold: float = Query(default=settings.DEFAULT_MATCH_THRESHOLD, ge=0.1, le=1.0),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Search the Doppel network for visual twins.
    - Excludes self.
    - Excludes non-consenting users and opted-out users.
    - Excludes blocked connections.
    - Ranks by Cosine Similarity.
    """
    matching_engine = get_matching_engine()
    return await matching_engine.find_matches(
        requester_id=current_user.id,
        db=db,
        top_k=top_k,
        threshold=threshold
    )

@router.get("/history", response_model=MatchHistoryResponse)
async def get_match_history(
    limit: int = Query(default=20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve history of discovered matches for the current user."""
    stmt = (
        select(Match, User, UserSettings)
        .join(User, Match.matched_user_id == User.id)
        .outerjoin(UserSettings, User.id == UserSettings.user_id)
        .where(Match.requester_id == current_user.id)
        .order_by(desc(Match.created_at))
        .limit(limit)
    )
    res = await db.execute(stmt)
    rows = res.all()

    items: List[DoppelMatchItem] = []
    matching_engine = get_matching_engine()

    for match_row, user_row, settings_row in rows:
        show_city = settings_row.show_city if settings_row else False
        city_name = settings_row.city_name if (show_city and settings_row) else None
        bio = settings_row.bio if settings_row else None
        allow_contact = settings_row.allow_contact_requests if settings_row else True

        items.append(
            DoppelMatchItem(
                match_id=match_row.id,
                matched_user_id=user_row.id,
                display_name=user_row.display_name,
                username=user_row.username,
                avatar=user_row.avatar,
                city_name=city_name,
                bio=bio,
                similarity_score=match_row.similarity_score,
                raw_distance=round(1.0 - (match_row.similarity_score / 100.0), 4),
                ranking=match_row.ranking,
                allow_contact=allow_contact,
                match_explanation=matching_engine.generate_explanation(match_row.similarity_score, match_row.ranking)
            )
        )

    return MatchHistoryResponse(matches=items)

@router.get("/{match_id}", response_model=DoppelMatchItem)
async def get_match_detail(
    match_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve single match details."""
    stmt = (
        select(Match, User, UserSettings)
        .join(User, Match.matched_user_id == User.id)
        .outerjoin(UserSettings, User.id == UserSettings.user_id)
        .where(Match.id == match_id, Match.requester_id == current_user.id)
    )
    res = await db.execute(stmt)
    row = res.first()
    if not row:
        raise NotFoundError("Match record not found.")

    match_row, user_row, settings_row = row
    show_city = settings_row.show_city if settings_row else False
    city_name = settings_row.city_name if (show_city and settings_row) else None
    bio = settings_row.bio if settings_row else None
    allow_contact = settings_row.allow_contact_requests if settings_row else True

    matching_engine = get_matching_engine()

    return DoppelMatchItem(
        match_id=match_row.id,
        matched_user_id=user_row.id,
        display_name=user_row.display_name,
        username=user_row.username,
        avatar=user_row.avatar,
        city_name=city_name,
        bio=bio,
        similarity_score=match_row.similarity_score,
        raw_distance=round(1.0 - (match_row.similarity_score / 100.0), 4),
        ranking=match_row.ranking,
        allow_contact=allow_contact,
        match_explanation=matching_engine.generate_explanation(match_row.similarity_score, match_row.ranking)
    )
