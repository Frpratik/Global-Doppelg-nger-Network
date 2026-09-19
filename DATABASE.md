# DOPPEL Database Schema Specification

## Entity Relationship Overview

- **`users`**: `id (UUID)`, `email`, `password_hash`, `display_name`, `username`, `avatar`, `is_admin`, `account_status`, `created_at`.
- **`consents`**: `id`, `user_id (FK)`, `biometric_processing_consent`, `discovery_consent`, `consent_version`, `accepted_at`, `revoked_at`.
- **`face_profiles`**: `id`, `user_id (FK)`, `model_name`, `model_version`, `embedding_dimension`, `quality_score`, `blur_score`, `brightness_score`, `face_box`, `enrollment_status`.
- **`user_settings`**: `user_id (FK)`, `profile_visibility`, `discovery_enabled`, `allow_contact_requests`, `show_city`, `city_name`, `bio`.
- **`matches`**: `id`, `requester_id (FK)`, `matched_user_id (FK)`, `similarity_score`, `ranking`, `session_id`, `created_at`.
- **`discovery_sessions`**: `id`, `user_id (FK)`, `model_version`, `search_parameters`, `result_count`, `execution_time_ms`, `created_at`.
- **`audit_logs`**: `id`, `user_id (FK)`, `action`, `ip_address`, `timestamp`, `metadata_json`.
- **`user_blocks`**: `id`, `blocker_id (FK)`, `blocked_user_id (FK)`, `created_at`.
- **`user_reports`**: `id`, `reporter_id (FK)`, `reported_user_id (FK)`, `reason`, `details`, `status`.
- **`connection_requests`**: `id`, `sender_id (FK)`, `receiver_id (FK)`, `status`, `message`.
