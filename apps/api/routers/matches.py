"""
DOPPEL Matches & Discovery Router
Executes Vector Similarity Search, Retrieves Discovery History, and Formats Ranked Results.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, or_, and_
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
    """Retrieve single match details with fallback to candidate profile."""
    matching_engine = get_matching_engine()

    # 1. Try finding by Match.id or Match.matched_user_id for this requester
    stmt = (
        select(Match, User, UserSettings)
        .join(User, Match.matched_user_id == User.id)
        .outerjoin(UserSettings, User.id == UserSettings.user_id)
        .where(
            or_(
                Match.id == match_id,
                Match.matched_user_id == match_id,
                and_(Match.matched_user_id == match_id, Match.requester_id == current_user.id)
            )
        )
        .order_by(desc(Match.created_at))
    )
    res = await db.execute(stmt)
    row = res.first()

    if not row:
        # 2. Check if match_id was formatted like "match-reqid-candid" or is user_id / username directly
        candidate_id = match_id
        if match_id.startswith("match-"):
            parts = match_id.split("-")
            if len(parts) >= 3:
                cand_prefix = parts[2]
                cand_stmt = select(User.id).where(User.id.startswith(cand_prefix))
                cand_res = await db.execute(cand_stmt)
                found_id = cand_res.scalar_one_or_none()
                if found_id:
                    candidate_id = found_id

        user_stmt = (
            select(User, UserSettings)
            .outerjoin(UserSettings, User.id == UserSettings.user_id)
            .where(or_(User.id == candidate_id, User.username == candidate_id))
        )
        u_res = await db.execute(user_stmt)
        u_row = u_res.first()
        if not u_row:
            raise NotFoundError("Match record not found.")

        user_row, settings_row = u_row

        # Compute live cosine similarity
        sim_score = 75.0
        try:
            req_emb = await matching_engine.vector_store.get_embedding(current_user.id)
            cand_emb = await matching_engine.vector_store.get_embedding(user_row.id)
            if req_emb and cand_emb:
                dot = sum(a * b for a, b in zip(req_emb, cand_emb))
                sim_score = round(max(0.0, min(1.0, dot)) * 100, 1)
        except Exception:
            pass

        show_city = settings_row.show_city if settings_row else False
        city_name = settings_row.city_name if (show_city and settings_row) else None
        bio = settings_row.bio if settings_row else None
        allow_contact = settings_row.allow_contact_requests if settings_row else True

        return DoppelMatchItem(
            match_id=match_id,
            matched_user_id=user_row.id,
            display_name=user_row.display_name,
            username=user_row.username,
            avatar=user_row.avatar,
            city_name=city_name,
            bio=bio,
            similarity_score=sim_score,
            raw_distance=round(1.0 - (sim_score / 100.0), 4),
            ranking=1,
            allow_contact=allow_contact,
            match_explanation=matching_engine.generate_explanation(sim_score, 1)
        )

    match_row, user_row, settings_row = row
    show_city = settings_row.show_city if settings_row else False
    city_name = settings_row.city_name if (show_city and settings_row) else None
    bio = settings_row.bio if settings_row else None
    allow_contact = settings_row.allow_contact_requests if settings_row else True

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
