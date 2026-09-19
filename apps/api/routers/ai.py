"""
DOPPEL AI Assistant & RAG Router
Provides conversational Q&A on privacy, matching math, data deletion, and explanation generation.
"""
from fastapi import APIRouter, Depends
from apps.api.dependencies import get_current_user
from apps.api.models.models import User
from apps.api.schemas.schemas import AIChatRequest, AIChatResponse
from services.ai.llm_provider import get_llm_provider

router = APIRouter(prefix="/ai", tags=["Doppel AI Assistant"])

@router.post("/chat", response_model=AIChatResponse)
async def chat_with_doppel_ai(
    payload: AIChatRequest,
    current_user: User = Depends(get_current_user)
):
    llm = get_llm_provider()
    reply = await llm.generate_response(payload.message, payload.context)

    suggested = [
        "How is visual similarity calculated?",
        "What happens when I delete my biometric profile?",
        "How does Doppel protect against web scraping?",
        "What facial landmarks are evaluated?"
    ]

    return AIChatResponse(
        reply=reply,
        suggested_questions=suggested,
        sources=["Doppel Biometric Privacy Architecture Spec v1.2", "ArcFace Feature Space Documentation"]
    )
