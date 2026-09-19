"""
Unit Tests for DOPPEL Vector Store (Memory & Cosine Similarity)
"""
import pytest
import numpy as np
from apps.api.repositories.vector_store import MemoryVectorRepository

@pytest.mark.asyncio
async def test_vector_upsert_and_retrieve():
    store = MemoryVectorRepository(dimension=512)
    
    vec = [0.1] * 512
    await store.upsert_embedding(user_id="u1", embedding=vec, metadata={"name": "Alice"})
    
    retrieved = await store.get_embedding("u1")
    assert retrieved is not None
    assert len(retrieved) == 512
    assert await store.count() == 1

@pytest.mark.asyncio
async def test_cosine_similarity_ranking():
    store = MemoryVectorRepository(dimension=4)
    
    # Target base vector
    base = [1.0, 0.0, 0.0, 0.0]
    
    # Near identical vector
    near = [0.99, 0.01, 0.0, 0.0]
    
    # Orthogonal vector
    ortho = [0.0, 1.0, 0.0, 0.0]
    
    # Moderate vector
    moderate = [0.707, 0.707, 0.0, 0.0]

    await store.upsert_embedding("u_near", near)
    await store.upsert_embedding("u_ortho", ortho)
    await store.upsert_embedding("u_mod", moderate)

    results = await store.search_similar(query_embedding=base, top_k=5, threshold=0.1)
    
    assert len(results) >= 2
    # Top rank must be u_near
    assert results[0].user_id == "u_near"
    assert results[0].similarity_score > 0.95
    # Second rank must be u_mod
    assert results[1].user_id == "u_mod"
    assert 0.65 < results[1].similarity_score < 0.80

@pytest.mark.asyncio
async def test_vector_exclusion_filtering():
    store = MemoryVectorRepository(dimension=4)
    vec = [1.0, 0.0, 0.0, 0.0]
    
    await store.upsert_embedding("self_user", vec)
    await store.upsert_embedding("other_user", vec)

    # Search excluding self_user
    results = await store.search_similar(
        query_embedding=vec,
        top_k=5,
        threshold=0.5,
        exclude_user_ids=["self_user"]
    )
    
    assert len(results) == 1
    assert results[0].user_id == "other_user"

@pytest.mark.asyncio
async def test_vector_deletion():
    store = MemoryVectorRepository(dimension=4)
    vec = [1.0, 0.0, 0.0, 0.0]
    
    await store.upsert_embedding("u_del", vec)
    assert await store.count() == 1
    
    deleted = await store.delete_embedding("u_del")
    assert deleted is True
    assert await store.count() == 0
    assert await store.get_embedding("u_del") is None
