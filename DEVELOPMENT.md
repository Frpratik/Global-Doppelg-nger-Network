# DOPPEL Developer Guide

## Repository Structure
```
doppel/
├── apps/
│   ├── web/                     # Next.js 14 Web Frontend
│   └── api/                     # FastAPI Backend Application
├── services/
│   ├── face_engine/             # Face detection, quality engine, alignment, ArcFace embedding
│   ├── matching_engine/         # Vector similarity search, filtering, explainability
│   └── ai/                      # AI abstractions, LLM & RAG provider
├── packages/
│   └── shared/                  # Shared error codes and enum constants
├── scripts/                     # seed_demo_data.py, benchmark_matching.py
├── tests/                       # Pytest unit and integration test suite
├── infrastructure/              # Dockerfiles & compose configs
├── Makefile                     # Build & run automation commands
└── README.md
```

## Developer Commands
- `make install` — Install Python & Node packages.
- `make dev-api` — Launch FastAPI server.
- `make dev-web` — Launch Next.js dev server.
- `make seed` — Seed 60+ consenting demo personas into vector store and database.
- `make test` — Execute backend test suite.
- `make benchmark` — Benchmark vector search throughput and latency.
- `make build` — Build frontend and verify TypeScript contracts.
