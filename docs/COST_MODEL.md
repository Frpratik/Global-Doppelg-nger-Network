# DOPPEL Cost Model & Infrastructure Economics

## 1. Zero-Cost Development Tier ($0 / month)
- **FastAPI Backend**: Runs on local CPU / single VPS instance ($0).
- **Face AI Embedding Model**: CPU-optimized ArcFace/MobileFaceNet ONNX runtime requiring zero paid GPU APIs ($0).
- **Vector Search Engine**: In-memory NumPy cosine similarity or open-source local Qdrant container ($0).
- **Frontend**: Next.js deployed on Vercel Hobby tier or self-hosted Node ($0).
- **Database**: Local SQLite or Supabase / Neon free-tier PostgreSQL ($0).

## 2. Production Scaling Tier (100,000 Enrolled Users)
- **Backend API & Inference**: 2x 4-vCPU Hetzner / AWS ECS instances (~$40 / month).
- **Vector Database**: Managed Qdrant Cloud cluster or self-hosted PostgreSQL with pgvector (~$25 / month).
- **Object Storage**: S3-compatible Cloudflare R2 with zero egress fees (~$5 / month).
- **Total Operational Run Rate**: $\approx \$70\text{ / month}$ for 100,000 active participants.
