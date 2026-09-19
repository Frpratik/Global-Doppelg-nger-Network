import { ApiClient } from "@/lib/api";
import { ChatConversation, ChatMessage } from "@/types/domain";

export const ChatService = {
  async getConversations(): Promise<ChatConversation[]> {
    return ApiClient.request<ChatConversation[]>("/chat/conversations", { method: "GET" });
  },

  async getMessages(twinId: string): Promise<ChatMessage[]> {
    return ApiClient.request<ChatMessage[]>(`/chat/conversations/${twinId}/messages`, { method: "GET" });
  },

  async sendMessage(twinId: string, content: string): Promise<ChatMessage> {
    return ApiClient.request<ChatMessage>(`/chat/conversations/${twinId}/messages`, {
      method: "POST",
      body: JSON.stringify({ content })
    });
  }
};
