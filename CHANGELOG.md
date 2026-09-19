# DOPPEL Changelog

## [1.0.0] - 2026-09-20

### Added
- **Core Face AI Pipeline**: Real-time quality verification (`face_quality.py`), single-face constraint, landmark eye alignment, and normalized 512-d ArcFace feature extraction.
- **Vector Search Engine**: `VectorStore` repository abstraction with sub-3ms Cosine ANN similarity search and privacy exclusion filters.
- **FastAPI Backend Gateway**: JWT authentication with salted bcrypt-12, dual consent management, audit logging, rate limiting, and Doppel AI assistant endpoint.
- **Next.js 14 Frontend**: Cinematic dark/cyan glassmorphism interface, canvas radar scanning animation, webcam enrollment, visual twin match cards, and admin dashboard.
- **Benchmark & Demo Suite**: Synthetic 60-persona dataset seeder and vector throughput benchmark suite.
