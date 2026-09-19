# DOPPEL REST API Specification

Base Endpoint: `/api/v1`

## Authentication (`/auth`)
- `POST /auth/register` — Register user and capture initial consents.
- `POST /auth/login` — Authenticate user and issue JWT access/refresh tokens.
- `POST /auth/refresh` — Issue fresh access token using valid refresh token.
- `GET /auth/me` — Retrieve current authenticated user profile & settings.

## Biometric Consent (`/consent`)
- `GET /consent` — Retrieve active biometric & discovery consent flags.
- `POST /consent` — Update or revoke consent flags.

## Face AI Pipeline (`/face`)
- `POST /face/check-quality` — Test portrait sharpness, brightness & single face presence.
- `POST /face/enroll` — Process selfie, extract 512-d ArcFace vector & index into VectorStore.
- `GET /face/profile` — Retrieve biometric enrollment metadata.

## Matching & Discovery (`/matches`)
- `POST /matches/search` — Perform vector similarity search (parameters: `top_k`, `threshold`).
- `GET /matches/history` — Retrieve historical match sessions.
- `GET /matches/{id}` — Inspect detailed match metrics and profile information.

## Users & Settings (`/users`)
- `PUT /users/settings` — Update discovery status, city visibility, and bio.
- `POST /users/block` — Block a user from matching searches.
- `POST /users/report` — Submit a moderation report.
- `POST /users/connect` — Send a connection request.

## Account Deletion (`/account`)
- `DELETE /account/face-profile` — Purge biometric embedding vector from VectorStore.
- `DELETE /account` — Permanently delete user account and all data.

## System & Admin (`/admin`, `/ai`)
- `POST /ai/chat` — Doppel AI chat assistant for technical and privacy FAQs.
- `GET /admin/stats` — System telemetry (users, index size, search latency).
- `GET /admin/audit-logs` — Security audit logs.
- `GET /health` — Health check endpoint.
