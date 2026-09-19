# DOPPEL Deployment Guide

## 1. Zero-Cost Local Development
```bash
# Backend
python -m uvicorn apps.api.main:app --host 0.0.0.0 --port 8000 --reload

# Frontend
cd apps/web && npm run dev
```

## 2. Docker Deployment
```bash
# Build and run backend + frontend containers
docker compose up --build -d

# Check health
curl http://localhost:8000/health
```

## 3. Production Scaling with PostgreSQL + pgvector
Update `.env`:
```ini
DATABASE_URL="postgresql+asyncpg://user:pass@db:5432/doppel_db"
VECTOR_BACKEND="qdrant" # or postgres pgvector
QDRANT_URL="http://qdrant:6333"
```
