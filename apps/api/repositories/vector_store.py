"""
DOPPEL Vector Repository & Interface
Abstracts vector indexing and similarity search across Postgres pgvector, Qdrant, and Memory engines.
"""
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional, Tuple
import numpy as np
import logging
from apps.api.core.config import settings

logger = logging.getLogger("doppel.vector_store")

class VectorSearchResult:
    def __init__(self, user_id: str, similarity_score: float, distance: float, metadata: Optional[Dict[str, Any]] = None):
        self.user_id = user_id
        self.similarity_score = similarity_score  # Cosine similarity [0.0 - 1.0]
        self.distance = distance  # Cosine distance [0.0 - 2.0]
        self.metadata = metadata or {}

    def to_dict(self) -> Dict[str, Any]:
        return {
            "user_id": self.user_id,
            "similarity_score": self.similarity_score,
            "distance": self.distance,
            "metadata": self.metadata
        }


class VectorStore(ABC):
    """Abstract interface for Face Vector storage & ANN search."""

    @abstractmethod
    async def upsert_embedding(
        self,
        user_id: str,
        embedding: List[float],
        metadata: Optional[Dict[str, Any]] = None
    ) -> bool:
        """Insert or update a face embedding vector for a user."""
        pass

    @abstractmethod
    async def delete_embedding(self, user_id: str) -> bool:
        """Permanently remove a user's embedding vector."""
        pass

    @abstractmethod
    async def search_similar(
        self,
        query_embedding: List[float],
        top_k: int = 10,
        threshold: float = 0.5,
        exclude_user_ids: Optional[List[str]] = None
    ) -> List[VectorSearchResult]:
        """Search for visually similar embeddings with threshold and exclusion filters."""
        pass

    @abstractmethod
    async def get_embedding(self, user_id: str) -> Optional[List[float]]:
        """Retrieve raw embedding for a specific user."""
        pass

    @abstractmethod
    async def count(self) -> int:
        """Return total number of indexed face vectors."""
        pass

    @abstractmethod
    async def health_check(self) -> Dict[str, Any]:
        """Check status and connection health of the vector backend."""
        pass


class MemoryVectorRepository(VectorStore):
    """
    High-performance in-memory Vector Store using NumPy vectorization.
    Ideal for local development, zero-cost deployments, testing, and demo mode.
    """
    def __init__(self, dimension: int = 512):
        self.dimension = dimension
        # Dict of user_id -> normalized numpy array
        self._vectors: Dict[str, np.ndarray] = {}
        self._metadata: Dict[str, Dict[str, Any]] = {}

    def _normalize(self, vector: np.ndarray) -> np.ndarray:
        norm = np.linalg.norm(vector)
        if norm == 0:
            return vector
        return vector / norm

    async def upsert_embedding(
        self,
        user_id: str,
        embedding: List[float],
        metadata: Optional[Dict[str, Any]] = None
    ) -> bool:
        arr = np.array(embedding, dtype=np.float32)
        if arr.shape[0] != self.dimension:
            # Pad or truncate if dimensions mismatch gracefully
            if arr.shape[0] < self.dimension:
                arr = np.pad(arr, (0, self.dimension - arr.shape[0]), 'constant')
            else:
                arr = arr[:self.dimension]
        norm_arr = self._normalize(arr)
        self._vectors[user_id] = norm_arr
        self._metadata[user_id] = metadata or {}
        return True

    async def delete_embedding(self, user_id: str) -> bool:
        if user_id in self._vectors:
            del self._vectors[user_id]
            self._metadata.pop(user_id, None)
            return True
        return False

    async def search_similar(
        self,
        query_embedding: List[float],
        top_k: int = 10,
        threshold: float = 0.5,
        exclude_user_ids: Optional[List[str]] = None
    ) -> List[VectorSearchResult]:
        if not self._vectors:
            return []

        exclude_set = set(exclude_user_ids or [])
        query_vec = self._normalize(np.array(query_embedding, dtype=np.float32))

        candidate_ids = [uid for uid in self._vectors.keys() if uid not in exclude_set]
        if not candidate_ids:
            return []

        matrix = np.stack([self._vectors[uid] for uid in candidate_ids])
        
        # Cosine similarity for normalized vectors is simply dot product
        similarities = np.dot(matrix, query_vec)
        
        # Convert to results
        results = []
        for uid, sim in zip(candidate_ids, similarities):
            sim_score = float(sim)
            # Clip between -1 and 1
            sim_score = max(-1.0, min(1.0, sim_score))
            distance = float(1.0 - sim_score)
            
            if sim_score >= threshold:
                results.append(
                    VectorSearchResult(
                        user_id=uid,
                        similarity_score=sim_score,
                        distance=distance,
                        metadata=self._metadata.get(uid, {})
                    )
                )

        # Sort descending by similarity
        results.sort(key=lambda r: r.similarity_score, reverse=True)
        return results[:top_k]

    async def get_embedding(self, user_id: str) -> Optional[List[float]]:
        if user_id in self._vectors:
            return self._vectors[user_id].tolist()
        return None

    async def count(self) -> int:
        return len(self._vectors)

    async def health_check(self) -> Dict[str, Any]:
        return {
            "status": "healthy",
            "backend": "memory",
            "dimension": self.dimension,
            "indexed_count": len(self._vectors)
        }


class QdrantVectorRepository(VectorStore):
    """Qdrant client implementation for scalable ANN face vector matching."""
    def __init__(self, url: Optional[str] = None, api_key: Optional[str] = None, collection: str = "doppel_face_vectors"):
        self.collection = collection
        self.url = url or "http://localhost:6333"
        self.api_key = api_key
        self._fallback_memory = MemoryVectorRepository(dimension=settings.EMBEDDING_DIMENSION)
        self._client = None
        self._connected = False

    async def _init_client(self):
        if self._client is None:
            try:
                from qdrant_client import AsyncQdrantClient
                self._client = AsyncQdrantClient(url=self.url, api_key=self.api_key)
                # Check collection
                collections = await self._client.get_collections()
                exists = any(c.name == self.collection for c in collections.collections)
                if not exists:
                    from qdrant_client.http import models
                    await self._client.create_collection(
                        collection_name=self.collection,
                        vectors_config=models.VectorParams(
                            size=settings.EMBEDDING_DIMENSION,
                            distance=models.Distance.COSINE
                        )
                    )
                self._connected = True
            except Exception as e:
                logger.warning(f"Qdrant connection failed ({e}). Falling back gracefully to in-memory vector store.")
                self._connected = False

    async def upsert_embedding(self, user_id: str, embedding: List[float], metadata: Optional[Dict[str, Any]] = None) -> bool:
        await self._init_client()
        if self._connected and self._client:
            try:
                from qdrant_client.http import models
                await self._client.upsert(
                    collection_name=self.collection,
                    points=[
                        models.PointStruct(
                            id=user_id,
                            vector=embedding,
                            payload=metadata or {}
                        )
                    ]
                )
                return True
            except Exception as e:
                logger.error(f"Qdrant upsert error: {e}")
        return await self._fallback_memory.upsert_embedding(user_id, embedding, metadata)

    async def delete_embedding(self, user_id: str) -> bool:
        await self._init_client()
        if self._connected and self._client:
            try:
                from qdrant_client.http import models
                await self._client.delete(
                    collection_name=self.collection,
                    points_selector=models.PointIdsList(points=[user_id])
                )
                return True
            except Exception as e:
                logger.error(f"Qdrant delete error: {e}")
        return await self._fallback_memory.delete_embedding(user_id)

    async def search_similar(
        self,
        query_embedding: List[float],
        top_k: int = 10,
        threshold: float = 0.5,
        exclude_user_ids: Optional[List[str]] = None
    ) -> List[VectorSearchResult]:
        await self._init_client()
        if self._connected and self._client:
            try:
                search_results = await self._client.search(
                    collection_name=self.collection,
                    query_vector=query_embedding,
                    limit=top_k + len(exclude_user_ids or []),
                    score_threshold=threshold
                )
                exclude_set = set(exclude_user_ids or [])
                results = []
                for point in search_results:
                    if str(point.id) in exclude_set:
                        continue
                    sim = float(point.score)
                    results.append(
                        VectorSearchResult(
                            user_id=str(point.id),
                            similarity_score=sim,
                            distance=float(1.0 - sim),
                            metadata=point.payload or {}
                        )
                    )
                    if len(results) >= top_k:
                        break
                return results
            except Exception as e:
                logger.error(f"Qdrant search error: {e}")
        return await self._fallback_memory.search_similar(query_embedding, top_k, threshold, exclude_user_ids)

    async def get_embedding(self, user_id: str) -> Optional[List[float]]:
        await self._init_client()
        if self._connected and self._client:
            try:
                points = await self._client.retrieve(
                    collection_name=self.collection,
                    ids=[user_id],
                    with_vectors=True
                )
                if points and points[0].vector:
                    return points[0].vector
            except Exception as e:
                logger.error(f"Qdrant retrieve error: {e}")
        return await self._fallback_memory.get_embedding(user_id)

    async def count(self) -> int:
        await self._init_client()
        if self._connected and self._client:
            try:
                info = await self._client.get_collection(self.collection)
                return info.points_count or 0
            except Exception:
                pass
        return await self._fallback_memory.count()

    async def health_check(self) -> Dict[str, Any]:
        await self._init_client()
        return {
            "status": "healthy" if self._connected else "fallback_memory_active",
            "backend": "qdrant" if self._connected else "memory_fallback",
            "qdrant_connected": self._connected,
            "indexed_count": await self.count()
        }


# Global singleton instance
_global_vector_store: Optional[VectorStore] = None

def get_vector_store() -> VectorStore:
    """Factory dependency returning the active VectorStore repository."""
    global _global_vector_store
    if _global_vector_store is None:
        if settings.VECTOR_BACKEND == "qdrant" and settings.QDRANT_URL:
            _global_vector_store = QdrantVectorRepository(
                url=settings.QDRANT_URL,
                api_key=settings.QDRANT_API_KEY,
                collection=settings.QDRANT_COLLECTION
            )
        else:
            _global_vector_store = MemoryVectorRepository(dimension=settings.EMBEDDING_DIMENSION)
    return _global_vector_store
