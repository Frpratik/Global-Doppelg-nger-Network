# DOPPEL Test Suite & Verification

## Running Tests
```bash
python -m pytest -v
```

## Test Coverage
- `tests/test_api_integration.py`:
  - `test_health_check_endpoint`: Healthcheck response validation.
  - `test_register_and_login_flow`: User registration, JWT creation, `/me` profile retrieval.
  - `test_consent_retrieval_and_update`: Biometric & discovery consent toggling.
  - `test_ai_chat_assistant_faq`: Doppel AI Assistant RAG FAQ resolution.
- `tests/test_face_quality.py`:
  - `test_single_face_quality_pass`: Quality check verification on valid portraits.
  - `test_no_face_rejected`: Rejection when 0 faces are in frame.
  - `test_multiple_faces_rejected`: Rejection when 2+ faces are detected.
  - `test_blurry_image_warning`: Blur detection using Laplacian variance.
  - `test_dark_image_warning`: Brightness analysis.
- `tests/test_vector_store.py`:
  - `test_vector_upsert_and_retrieve`: Vector indexing and retrieval.
  - `test_cosine_similarity_ranking`: Cosine ranking validation.
  - `test_vector_exclusion_filtering`: Filtering self and excluded user IDs.
  - `test_vector_deletion`: Permanent deletion from vector index.
