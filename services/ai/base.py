"""
DOPPEL AI Abstractions: Vision, Embedding & LLM Provider Interfaces
"""
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
import numpy as np

class VisionProvider(ABC):
    @abstractmethod
    def detect_faces(self, image_bgr: np.ndarray) -> List[List[int]]:
        pass


class EmbeddingProvider(ABC):
    @abstractmethod
    def generate_embedding(self, aligned_face_bgr: np.ndarray) -> List[float]:
        pass


class LLMProvider(ABC):
    @abstractmethod
    async def generate_response(self, prompt: str, context: Optional[Dict[str, Any]] = None) -> str:
        pass

    @abstractmethod
    async def explain_match(self, similarity_score: float, rank: int, feature_notes: Optional[str] = None) -> str:
        pass
