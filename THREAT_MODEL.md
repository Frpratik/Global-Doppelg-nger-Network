# DOPPEL Threat Model & Risk Mitigations

## 1. Threat Scenarios & Countermeasures

| Threat Scenario | Risk Level | Mitigation Architecture |
|---|---|---|
| **Bulk Facial Scraping** | High | Authenticated search endpoints with strict rate limiting (15/min), zero public face listings. |
| **Embedding Inversion Attack** | Medium | Raw vectors are kept in backend vector store only; never returned in API payloads. |
| **Account Takeover** | High | Salted bcrypt-12 passwords, secure JWT token rotation, short expiration windows. |
| **Malicious File Ingestion** | Medium | Pillow image header inspection, strict MIME whitelist, max 10MB payload constraint. |
| **Non-Consenting Search** | Critical | Mandatory dual consent validation in FastAPI router before any matching search. |
