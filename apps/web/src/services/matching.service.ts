import { ApiClient } from "@/lib/api";
import { DiscoverySessionResult, DoppelMatch, ConnectionRequest } from "@/types/domain";

export const MatchingService = {
  async search(topK: number = 10, threshold: number = 0.55): Promise<DiscoverySessionResult> {
    return ApiClient.request<DiscoverySessionResult>(
      `/matches/search?top_k=${topK}&threshold=${threshold}`,
      { method: "POST" }
    );
  },

  async getHistory(limit: number = 20): Promise<{ matches: DoppelMatch[] }> {
    return ApiClient.request<{ matches: DoppelMatch[] }>(
      `/matches/history?limit=${limit}`,
      { method: "GET" }
    );
  },

  async getMatchById(matchId: string): Promise<DoppelMatch> {
    return ApiClient.request<DoppelMatch>(`/matches/${matchId}`, {
      method: "GET"
    });
  },

  async sendConnection(receiverId: string, message?: string): Promise<ConnectionRequest> {
    return ApiClient.request<ConnectionRequest>("/users/connect", {
      method: "POST",
      body: JSON.stringify({ receiver_id: receiverId, message })
    });
  },

  async blockUser(blockedUserId: string): Promise<{ success: boolean; message: string }> {
    return ApiClient.request<{ success: boolean; message: string }>("/users/block", {
      method: "POST",
      body: JSON.stringify({ blocked_user_id: blockedUserId })
    });
  },

  async reportUser(reportedUserId: string, reason: string, details?: string): Promise<{ success: boolean; message: string }> {
    return ApiClient.request<{ success: boolean; message: string }>("/users/report", {
      method: "POST",
      body: JSON.stringify({ reported_user_id: reportedUserId, reason, details })
    });
  }
};
