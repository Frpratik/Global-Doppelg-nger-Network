import { ApiClient } from "@/lib/api";
import { ConnectionsList, ConnectionRequest } from "@/types/domain";

export const ConnectionService = {
  async getConnections(): Promise<ConnectionsList> {
    return ApiClient.request<ConnectionsList>("/users/connections", { method: "GET" });
  },

  async sendRequest(receiverId: string, message?: string): Promise<ConnectionRequest> {
    return ApiClient.request<ConnectionRequest>("/users/connect", {
      method: "POST",
      body: JSON.stringify({ receiver_id: receiverId, message })
    });
  },

  async respondToRequest(connectionId: string, action: "accept" | "decline"): Promise<{ success: boolean; message: string; status: string }> {
    return ApiClient.request<{ success: boolean; message: string; status: string }>(
      `/users/connections/${connectionId}/respond`,
      {
        method: "PUT",
        body: JSON.stringify({ action })
      }
    );
  },

  async deleteConnection(connectionId: string): Promise<{ success: boolean; message: string }> {
    return ApiClient.request<{ success: boolean; message: string }>(
      `/users/connections/${connectionId}`,
      { method: "DELETE" }
    );
  }
};
