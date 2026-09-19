import { ApiClient } from "@/lib/api";
import { User } from "@/types/domain";

export interface RegisterPayload {
  email: string;
  password: string;
  display_name: string;
  username: string;
  biometric_consent: boolean;
  discovery_consent: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthTokensResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export const AuthService = {
  async register(payload: RegisterPayload): Promise<AuthTokensResponse> {
    return ApiClient.request<AuthTokensResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  async login(payload: LoginPayload): Promise<AuthTokensResponse> {
    return ApiClient.request<AuthTokensResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  async getMe(): Promise<User> {
    return ApiClient.request<User>("/auth/me", {
      method: "GET"
    });
  },

  async refresh(refreshToken: string): Promise<AuthTokensResponse> {
    return ApiClient.request<AuthTokensResponse>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken })
    });
  }
};
