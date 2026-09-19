/**
 * DOPPEL API Client Library
 */

const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    return "/api/v1";
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";
};

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  request_id?: string;
}

export interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  error?: ApiError;
}

export class ApiClient {
  private static getHeaders(isMultipart = false): HeadersInit {
    const headers: Record<string, string> = {};
    if (!isMultipart) {
      headers["Content-Type"] = "application/json";
    }
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("doppel_access_token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return headers;
  }

  static async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}${endpoint}`;
    const isMultipart = options.body instanceof FormData;
    const headers = {
      ...this.getHeaders(isMultipart),
      ...(options.headers || {})
    };

    try {
      let response: Response;
      try {
        response = await fetch(url, { ...options, headers });
      } catch (networkErr) {
        // Fallback to direct backend URL if proxy fails
        const fallbackUrl = `http://127.0.0.1:8000/api/v1${endpoint}`;
        response = await fetch(fallbackUrl, { ...options, headers });
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        let msg = "Request failed.";
        let code = "UNKNOWN_ERROR";
        let details = {};

        if (data?.error?.message) {
          msg = data.error.message;
          code = data.error.code || code;
          details = data.error.details || details;
        } else if (data?.detail?.error?.message) {
          msg = data.detail.error.message;
          code = data.detail.error.code || code;
          details = data.detail.error.details || details;
        } else if (typeof data?.detail === "string") {
          msg = data.detail;
        } else if (data?.message) {
          msg = data.message;
        }

        const errorInfo: ApiError = { code, message: msg, details };
        throw errorInfo;
      }

      return data as T;
    } catch (err: any) {
      if (err.code && err.message) {
        throw err;
      }
      throw {
        code: "NETWORK_ERROR",
        message: err.message || "Failed to communicate with Doppel API server."
      } as ApiError;
    }
  }

  // Auth
  static register(data: any) {
    return this.request("/auth/register", { method: "POST", body: JSON.stringify(data) });
  }

  static login(data: any) {
    return this.request("/auth/login", { method: "POST", body: JSON.stringify(data) });
  }

  static getMe() {
    return this.request("/auth/me", { method: "GET" });
  }

  // Consent
  static getConsent() {
    return this.request("/consent", { method: "GET" });
  }

  static updateConsent(data: { biometric_processing_consent: boolean; discovery_consent: boolean }) {
    return this.request("/consent", { method: "POST", body: JSON.stringify(data) });
  }

  // Face AI
  static checkQuality(formData: FormData) {
    return this.request("/face/check-quality", { method: "POST", body: formData });
  }

  static enrollFace(formData: FormData) {
    return this.request("/face/enroll", { method: "POST", body: formData });
  }

  static getFaceProfile() {
    return this.request("/face/profile", { method: "GET" });
  }

  // Matching
  static searchMatches(topK = 10, threshold = 0.55) {
    return this.request(`/matches/search?top_k=${topK}&threshold=${threshold}`, { method: "POST" });
  }

  static getMatchHistory() {
    return this.request("/matches/history", { method: "GET" });
  }

  static getMatchDetail(id: string) {
    return this.request(`/matches/${id}`, { method: "GET" });
  }

  // Users & Settings
  static updateSettings(settings: any) {
    return this.request("/users/settings", { method: "PUT", body: JSON.stringify(settings) });
  }

  static blockUser(blocked_user_id: string) {
    return this.request("/users/block", { method: "POST", body: JSON.stringify({ blocked_user_id }) });
  }

  static reportUser(data: { reported_user_id: string; reason: string; details?: string }) {
    return this.request("/users/report", { method: "POST", body: JSON.stringify(data) });
  }

  static sendConnection(data: { receiver_id: string; message?: string }) {
    return this.request("/users/connect", { method: "POST", body: JSON.stringify(data) });
  }

  // Deletion
  static deleteBiometricProfile() {
    return this.request("/account/face-profile", { method: "DELETE" });
  }

  static deleteAccount() {
    return this.request("/account", { method: "DELETE" });
  }

  // AI Assistant
  static chatAI(message: string) {
    return this.request("/ai/chat", { method: "POST", body: JSON.stringify({ message }) });
  }

  // Admin
  static getAdminStats() {
    return this.request("/admin/stats", { method: "GET" });
  }

  static getAuditLogs() {
    return this.request("/admin/audit-logs", { method: "GET" });
  }
}
