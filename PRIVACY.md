# DOPPEL Privacy Policy & Biometric Architecture

## 1. Zero-Scraping Commitment
Doppel never scrapes the web, harvests social media images, or performs mass unconsented facial surveillance. The system indexes only registered users who explicitly opted in.

## 2. Dual Consent Framework
- **Biometric Processing Consent**: Voluntary consent to process selfies into mathematical embeddings.
- **Discovery Consent**: Voluntary consent to appear in searches by other enrolled participants.

## 3. Right to Permanent Erasure
Users can:
1. **Purge Biometrics**: Instantly delete the 512-d embedding vector via `DELETE /api/v1/account/face-profile`.
2. **Delete Account**: Completely erase user credentials, consent history, and settings via `DELETE /api/v1/account`.
