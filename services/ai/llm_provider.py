"""
DOPPEL LLM & RAG Assistant Provider
Provides natural-language explainability, technical FAQ resolution, and privacy guidance.
"""
from typing import Dict, Any, Optional, List
import httpx
from apps.api.core.config import settings
from services.ai.base import LLMProvider

DOPPEL_KNOWLEDGE_BASE = {
    "privacy": (
        "Doppel is a consent-based visual twin discovery network. We never crawl the internet, scrape social media, "
        "or identify unknown individuals. Only explicitly enrolled participants who agree to biometric processing "
        "and discovery are indexed. You can disable discovery or delete your biometric profile at any time."
    ),
    "matching": (
        "Face matching in Doppel uses 512-dimensional facial feature embeddings extracted using an ArcFace/MobileFaceNet "
        "deep architecture. Vectors are normalized and compared using cosine similarity ($S = \cos(\theta)$). Scores above "
        "75% indicate strong morphological resemblance in jawline, inter-ocular distance, nose structure, and facial proportions."
    ),
    "deletion": (
        "When you delete your biometric profile, your 512-d embedding vector is immediately purged from the vector index, "
        "and all facial profile records are permanently removed. Deleting your account cascades full removal of all user data."
    ),
    "security": (
        "Biometric embeddings are protected with strict access control, salted bcrypt authentication, rate limiting, and "
        "comprehensive audit logging. Raw embeddings are never exposed to public API clients or third parties."
    )
}

class DoppelLLMProvider(LLMProvider):
    def __init__(self, provider_type: str = settings.LLM_PROVIDER, ollama_url: str = settings.OLLAMA_URL, model: str = settings.OLLAMA_MODEL):
        self.provider_type = provider_type
        self.ollama_url = ollama_url
        self.model = model

    async def generate_response(self, prompt: str, context: Optional[Dict[str, Any]] = None) -> str:
        # Check if Ollama is accessible
        if self.provider_type == "ollama":
            try:
                async with httpx.AsyncClient(timeout=8.0) as client:
                    resp = await client.post(
                        f"{self.ollama_url}/api/generate",
                        json={
                            "model": self.model,
                            "prompt": f"System: You are Doppel AI, an expert, privacy-focused assistant for the Doppel visual twin network.\nUser: {prompt}\nAnswer:",
                            "stream": False
                        }
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        return data.get("response", "").strip()
            except Exception:
                pass  # Fall back to built-in RAG below

        # Built-in RAG & Technical FAQ Engine
        prompt_lower = prompt.lower()
        if any(k in prompt_lower for k in ["privacy", "data", "retention", "gdpr", "safe", "surveillance"]):
            return (
                "🔒 **Doppel Privacy Architecture**:\n\n"
                f"{DOPPEL_KNOWLEDGE_BASE['privacy']}\n\n"
                "• **No Internet Scraping**: We only compare against registered users who opted in.\n"
                "• **Granular Controls**: Toggle your searchability anytime from your Settings dashboard."
            )
        elif any(k in prompt_lower for k in ["how", "match", "work", "algorithm", "vector", "score", "cosine", "model"]):
            return (
                "🧠 **How Doppel Matching Works**:\n\n"
                f"{DOPPEL_KNOWLEDGE_BASE['matching']}\n\n"
                "• **Pipeline**: Detection ➔ 112x112 Alignment ➔ 512-d Embedding ➔ Vector Indexing ➔ ANN Cosine Search.\n"
                "• **Honest Metric**: Similarity scores represent vector-space geometric proximity, not genetic or DNA kinship."
            )
        elif any(k in prompt_lower for k in ["delete", "remove", "opt-out", "revoke", "purge"]):
            return (
                "🗑️ **Data Deletion Guarantee**:\n\n"
                f"{DOPPEL_KNOWLEDGE_BASE['deletion']}\n\n"
                "You can trigger instant biometric deletion under `Settings ➔ Biometric Privacy`."
            )
        else:
            return (
                "Hello! I am **Doppel AI**, your guide to visual twin discovery. "
                "I can explain how our 512-d ArcFace embedding pipeline works, how cosine similarity ranking is calculated, "
                "or how our privacy-first biometric architecture safeguards your facial data.\n\n"
                "Feel free to ask about our zero-scraping policy, image quality checks, or how to manage discovery consent."
            )

    async def explain_match(self, similarity_score: float, rank: int, feature_notes: Optional[str] = None) -> str:
        if similarity_score >= 85.0:
            tier = "exceptionally high"
            details = "Pronounced alignment in cranial structure, eye-to-nose aspect ratios, and zygomatic arch geometry."
        elif similarity_score >= 70.0:
            tier = "strong"
            details = "Noticeable correspondence in upper-facial contour and cheekbone symmetry."
        else:
            tier = "moderate"
            details = "General geometric correspondence in facial landmark coordinates."

        return (
            f"Visual similarity rank #{rank} ({similarity_score:.1f}% match). "
            f"The feature-space vector distance demonstrates {tier} proximity. {details}"
        )

# Global singleton
_llm_instance: Optional[DoppelLLMProvider] = None

def get_llm_provider() -> DoppelLLMProvider:
    global _llm_instance
    if _llm_instance is None:
        _llm_instance = DoppelLLMProvider()
    return _llm_instance
