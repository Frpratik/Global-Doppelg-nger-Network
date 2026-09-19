# DOPPEL — Find Your Visual Twin

<p align="center">
  <img src="https://api.dicebear.com/7.x/bottts/svg?seed=doppel_logo" width="100" height="100" alt="Doppel Logo" />
</p>

<p align="center">
  <strong>Consent-based AI Doppelgänger Discovery Platform</strong><br>
  <em>Powered by 512-Dimensional Deep Facial Embeddings, Cosine Vector Search & Zero-Knowledge Privacy Architecture.</em>
</p>

<p align="center">
  <a href="#core-architecture">Architecture</a> •
  <a href="#quickstart">Quickstart</a> •
  <a href="#privacy-charter">Privacy Model</a> •
  <a href="#vector-benchmarks">Benchmarks</a> •
  <a href="#demo-mode">Demo Mode</a> •
  <a href="#documentation">Documentation Suite</a>
</p>

---

## 🌟 What is Doppel?

**Doppel** is a consent-based visual twin discovery network. Users voluntarily enroll with a selfie and discover other enrolled participants whose facial appearance is visually similar to theirs.

> ⚠️ **Zero-Scraping Guarantee**: Doppel is **NOT** a facial surveillance system. It does **NOT** scrape social media, crawl the open web, or attempt to identify unknown individuals. It only matches consenting users who explicitly enrolled in Doppel.

---

## 🧠 The Core Intelligence Differentiator

Doppel is built on rigorous computer vision and vector indexing — **not prompt wrappers**:

$$\text{Image} \longrightarrow \text{Detection} \longrightarrow \text{Quality Check} \longrightarrow \text{Landmark Alignment} \longrightarrow \text{ArcFace 512-D} \longrightarrow \text{Vector Index} \longrightarrow \text{Cosine ANN} \longrightarrow \text{Privacy Filter} \longrightarrow \text{Ranking}$$

- **Single-Face Verification**: Rejects images with 0 or >1 face.
- **Quality Engine (`face_quality.py`)**: Checks blur (Laplacian variance $\ge 60.0$), illumination, and scale.
- **512-D Normalized Embeddings**: L2-normalized deep topological feature vectors ($\|v\|_2 = 1.0$).
- **Cosine ANN Search**: Cosine similarity $S = \max(0, \cos\theta) \times 100$ executing in $<3\text{ ms}$.

---

## 🚀 Quickstart (One-Command Setup)

### 1. Prerequisites
- **Python 3.10+**
- **Node.js 18+**

### 2. Clone & Run Backend
```bash
# Start FastAPI backend server
python -m uvicorn apps.api.main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Start Next.js Frontend
```bash
cd apps/web
npm install
npm run dev
# Open http://localhost:3000
```

### 4. Seed 60+ Consenting Demo Personas
```bash
python scripts/seed_demo_data.py
```

### 5. Run Vector Search Benchmark
```bash
python scripts/benchmark_matching.py
```

---

## 🔒 Privacy & Biometric Architecture

1. **Dual Consent Decoupling**: Biometric processing consent is managed independently from discovery searchability.
2. **Instant Opt-Out**: Users can pause discovery with a single toggle switch.
3. **Irreversible Vector Purge**: `DELETE /api/v1/account/face-profile` immediately removes the 512-d vector from the active vector store.
4. **No Raw Vector Leakage**: Embeddings are never returned to frontend clients or exposed in public directories.

---

## 📊 Benchmark Results

| Vector Corpus | Ingestion Rate | Memory Footprint | p50 Latency | p95 Latency | QPS (CPU) |
|---|---|---|---|---|---|
| **1,000 Embeddings** | 1,365 vec/sec | 6.99 MB | **2.05 ms** | **4.05 ms** | **422.5** |
| **10,000 Embeddings** | 2,407 vec/sec | 63.10 MB | **23.39 ms** | **27.12 ms** | **42.3** |

---

## 🐳 Docker Deployment

```bash
# Launch entire stack (Backend + Frontend)
docker compose up --build
```

---

## 📚 Complete Documentation Suite

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — High-level system topology
- [`AI_ARCHITECTURE.md`](./AI_ARCHITECTURE.md) — Neural pipeline & embedding model
- [`FACE_PIPELINE.md`](./FACE_PIPELINE.md) — Quality diagnostics & landmark alignment
- [`VECTOR_SEARCH.md`](./VECTOR_SEARCH.md) — ANN Cosine similarity mathematical derivation
- [`SECURITY.md`](./SECURITY.md) — Threat model & anti-abuse systems
- [`PRIVACY.md`](./PRIVACY.md) — Biometric privacy charter & data retention
- [`API.md`](./API.md) — OpenAPI specification & endpoint contracts
- [`HACKATHON.md`](./HACKATHON.md) — Pitch deck, judging criteria & value proposition
- [`DEMO_SCRIPT.md`](./DEMO_SCRIPT.md) — 3-minute hackathon live demo script
- [`docs/COST_MODEL.md`](./docs/COST_MODEL.md) — Zero-cost development to production economics

---

## ⚖️ License

MIT License. Copyright © 2026 DOPPEL Team.
