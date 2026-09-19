# DOPPEL System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js 14 Frontend                      │
│        (TypeScript, Tailwind CSS, Lucide, Canvas Radar)     │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / JSON / Multipart
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                       FastAPI Gateway                       │
│    (JWT Auth, Rate Limiting, Request ID, CORS, Lifespan)    │
└──────────────┬───────────────┬───────────────┬──────────────┘
               │               │               │
               ▼               ▼               ▼
      ┌────────────────┐ ┌───────────┐ ┌────────────────┐
      │  Face AI Engine│ │  Matcher  │ │ Auth & Admin   │
      │  OpenCV/ArcFace│ │ Cosine ANN│ │ Bcrypt/Audits  │
      └────────┬───────┘ └─────┬─────┘ └────────┬───────┘
               │               │                │
               ▼               ▼                ▼
┌─────────────────────────────────────────────────────────────┐
│             Vector Store Abstraction (VectorStore)          │
│       [MemoryVectorRepository | Qdrant | pgvector]          │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 PostgreSQL / SQLite Database                │
│       Users, Consents, FaceProfiles, Matches, Settings      │
└─────────────────────────────────────────────────────────────┘
```

## Layer Descriptions

1. **Client Tier**: Next.js 14 App Router rendering dark glassmorphic UI, real-time webcam video stream analyzer with bounding box canvas overlays, and radar scanning visualizer.
2. **API Gateway Tier**: FastAPI with Pydantic v2 validation, salted bcrypt credential verification, signed JWT tokens, and request timing headers.
3. **Face AI Pipeline**:
   - `FaceDetector`: Frontal face cascade + landmark eye coordinate estimator.
   - `FaceQualityEngine`: Sharpness (Laplacian variance), contrast, brightness, and scale validator.
   - `FaceAligner`: Normalized 112x112 affine transformation.
   - `EmbeddingEngine`: 512-dimensional L2-normalized feature representation.
4. **Vector Tier**: Pluggable VectorStore interface executing exact/approximate nearest neighbor searches via Cosine Dot Product ($S = u \cdot v$).
5. **Relational Tier**: SQLAlchemy async ORM with foreign key cascades on deletion.
