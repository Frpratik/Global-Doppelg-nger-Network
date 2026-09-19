# DOPPEL Performance & Benchmarks

## Vector Search Latency & Throughput (CPU Measured)

Benchmarking executed with 512-dimensional normalized vectors:

```
=======================================================
🚀 Benchmarking Vector Corpus: 1,000 embeddings (Dim=512)
=======================================================
✓ Ingested 1,000 vectors in 0.73s (1,365 vectors/sec)
✓ Peak Memory Footprint: 6.99 MB (7,334 bytes/vector)

📊 Latency & Throughput Metrics (200 queries):
   • p50 Latency:  2.052 ms
   • p95 Latency:  4.057 ms
   • p99 Latency:  5.697 ms
   • Mean Latency: 2.367 ms
   • Throughput:   422.5 queries/sec (QPS)

=======================================================
🚀 Benchmarking Vector Corpus: 10,000 embeddings (Dim=512)
=======================================================
✓ Ingested 10,000 vectors in 4.16s (2,407 vectors/sec)
✓ Peak Memory Footprint: 63.10 MB (6,617 bytes/vector)

📊 Latency & Throughput Metrics (100 queries):
   • p50 Latency:  23.398 ms
   • p95 Latency:  27.123 ms
   • p99 Latency:  28.573 ms
   • Mean Latency: 23.625 ms
   • Throughput:   42.3 queries/sec (QPS)
```
