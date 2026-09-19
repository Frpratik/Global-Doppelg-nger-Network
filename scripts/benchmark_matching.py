"""
DOPPEL Vector Matching Benchmark Suite
Benchmarks vector search latency (p50, p95, p99), memory usage, and throughput at 1k, 10k, and 100k embeddings.
"""
import asyncio
import time
import os
import sys
from pathlib import Path

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import tracemalloc
import numpy as np
from apps.api.repositories.vector_store import MemoryVectorRepository

async def run_benchmark(corpus_size: int, query_count: int = 100, dimension: int = 512):
    print(f"\n=======================================================")
    print(f"🚀 Benchmarking Vector Corpus: {corpus_size:,} embeddings (Dim={dimension})")
    print(f"=======================================================")

    tracemalloc.start()
    store = MemoryVectorRepository(dimension=dimension)
    
    # 1. Ingestion Phase
    t0 = time.perf_counter()
    rng = np.random.default_rng(42)
    embeddings = rng.normal(0, 1, size=(corpus_size, dimension)).astype(np.float32)
    norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
    normalized_embeddings = embeddings / norms

    for i in range(corpus_size):
        await store.upsert_embedding(
            user_id=f"user_{i}",
            embedding=normalized_embeddings[i].tolist(),
            metadata={"user_id": f"user_{i}", "index": i}
        )
    
    t_ingest = time.perf_counter() - t0
    current_mem, peak_mem = tracemalloc.get_traced_memory()
    tracemalloc.stop()

    print(f"✓ Ingested {corpus_size:,} vectors in {t_ingest:.2f}s ({corpus_size/t_ingest:.0f} vectors/sec)")
    print(f"✓ Peak Memory Footprint: {peak_mem / (1024 * 1024):.2f} MB ({peak_mem / corpus_size:.1f} bytes/vector)")

    # 2. Query Phase
    query_vectors = rng.normal(0, 1, size=(query_count, dimension)).astype(np.float32)
    query_norms = np.linalg.norm(query_vectors, axis=1, keepdims=True)
    normalized_queries = query_vectors / query_norms

    latencies = []
    for q_idx in range(query_count):
        q_start = time.perf_counter()
        results = await store.search_similar(
            query_embedding=normalized_queries[q_idx].tolist(),
            top_k=10,
            threshold=0.5
        )
        q_dur = (time.perf_counter() - q_start) * 1000.0 # ms
        latencies.append(q_dur)

    latencies.sort()
    p50 = np.percentile(latencies, 50)
    p95 = np.percentile(latencies, 95)
    p99 = np.percentile(latencies, 99)
    qps = query_count / (sum(latencies) / 1000.0)

    print(f"\n📊 Latency & Throughput Metrics ({query_count} queries):")
    print(f"   • p50 Latency:  {p50:.3f} ms")
    print(f"   • p95 Latency:  {p95:.3f} ms")
    print(f"   • p99 Latency:  {p99:.3f} ms")
    print(f"   • Mean Latency: {np.mean(latencies):.3f} ms")
    print(f"   • Throughput:   {qps:.1f} queries/sec (QPS)")

async def main():
    print("DOPPEL Vector Matching Benchmark Running...")
    await run_benchmark(corpus_size=1_000, query_count=200)
    await run_benchmark(corpus_size=10_000, query_count=100)
    if len(sys.argv) > 1 and sys.argv[1] == "--full":
        await run_benchmark(corpus_size=100_000, query_count=50)

if __name__ == "__main__":
    asyncio.run(main())
