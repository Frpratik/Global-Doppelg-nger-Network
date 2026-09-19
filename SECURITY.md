# DOPPEL Security Specification

## 1. Authentication & Session Management
- **Password Hashing**: Salted `bcrypt` with 12 computation rounds.
- **Tokens**: Signed HS256/RS256 JSON Web Tokens with separate short-lived access tokens (24 hours) and long-lived refresh tokens (7 days).
- **Audit Logging**: Every authentication, consent change, biometric enrollment, and moderation event is appended to `AuditLog`.

## 2. API Gateway & Defense-in-Depth
- **CORS Policies**: Explicit origin white-listing.
- **Security Headers**: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`.
- **Rate Limiting**: Throttling to 15 search queries per minute to prevent mass automated scraping.

## 3. Vector Embedding Isolation
- Raw 512-dimensional floating point embeddings are never returned to clients.
- Clients only receive match scores, ranking, and permissible profile metadata.
