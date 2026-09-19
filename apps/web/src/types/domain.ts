/**
 * DOPPEL Domain Type Definitions
 * Strictly typed contracts corresponding to product concepts and backend models.
 */

export interface User {
  id: string;
  email: string;
  display_name: string;
  username: string;
  avatar?: string;
  is_admin: boolean;
  account_status: "active" | "suspended" | "pending_verification" | "deleted";
  created_at: string;
  has_biometric_consent: boolean;
  has_discovery_consent: boolean;
  is_enrolled: boolean;
  settings?: UserSettings;
}

export interface UserSettings {
  profile_visibility: "public" | "discovery_only" | "private";
  discovery_enabled: boolean;
  allow_contact_requests: boolean;
  show_city: boolean;
  city_name: string;
  bio: string;
}

export interface ConsentRecord {
  user_id: string;
  biometric_processing_consent: boolean;
  discovery_consent: boolean;
  consent_version: string;
  accepted_at?: string;
  revoked_at?: string;
}

export interface QualityAssessment {
  quality_score: number; // 0.0 - 1.0
  acceptable: boolean;
  blur_score: number; // Laplacian variance (>= 60.0 required)
  brightness_score: number; // Mean intensity (35 - 230 required)
  face_count: number;
  face_box?: [number, number, number, number]; // [x, y, w, h]
  warnings: string[];
}

export interface FaceProfile {
  model_name: string;
  model_version: string;
  quality_score: number;
  enrollment_status: "enrolled" | "pending" | "revoked";
  created_at: string;
}

export interface DoppelMatch {
  match_id: string;
  matched_user_id: string;
  display_name: string;
  username: string;
  avatar?: string;
  city_name?: string;
  bio?: string;
  similarity_score: number; // 0.0 - 100.0%
  raw_distance: number; // 1 - cos(theta)
  ranking: number;
  allow_contact: boolean;
  match_explanation?: string;
}

export interface DiscoverySessionResult {
  session_id: string;
  total_searched: number;
  matches_found: number;
  execution_time_ms: number;
  matches: DoppelMatch[];
}

export interface ConnectionRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: "pending" | "accepted" | "rejected" | "blocked";
  message?: string;
  created_at: string;
}

export interface ConnectionPeerInfo {
  user_id: string;
  display_name: string;
  username: string;
  avatar?: string;
  city_name?: string;
  bio?: string;
  similarity_score?: number;
}

export interface ConnectionItem {
  id: string;
  status: "pending" | "accepted" | "declined";
  message?: string;
  created_at: string;
  is_sender: boolean;
  peer: ConnectionPeerInfo;
}

export interface ConnectionsList {
  pending_incoming: ConnectionItem[];
  pending_outgoing: ConnectionItem[];
  accepted_twins: ConnectionItem[];
}

export interface ChatMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  is_mine: boolean;
}

export interface ChatConversation {
  twin_id: string;
  display_name: string;
  username: string;
  avatar?: string;
  similarity_score?: number;
  last_message?: string;
  last_message_at?: string;
  unread_count: number;
}

export interface AuditLogItem {
  id: string;
  user_id?: string;
  action: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface AdminTelemetry {
  total_users: number;
  enrolled_users: number;
  active_discovery_profiles: number;
  total_matches_run: number;
  avg_search_latency_ms: number;
  vector_index_size: number;
  vector_backend: string;
  model_name: string;
  model_version: string;
}
