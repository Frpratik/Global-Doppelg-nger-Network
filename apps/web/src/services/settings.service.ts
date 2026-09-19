import { ApiClient } from "@/lib/api";
import { UserSettings, ConsentRecord } from "@/types/domain";

export const SettingsService = {
  async getConsent(): Promise<ConsentRecord> {
    return ApiClient.request<ConsentRecord>("/consent", { method: "GET" });
  },

  async updateConsent(biometricConsent: boolean, discoveryConsent: boolean): Promise<ConsentRecord> {
    return ApiClient.request<ConsentRecord>("/consent", {
      method: "POST",
      body: JSON.stringify({
        biometric_processing_consent: biometricConsent,
        discovery_consent: discoveryConsent
      })
    });
  },

  async updateSettings(settings: Partial<UserSettings>): Promise<{ success: boolean; message: string; settings: UserSettings }> {
    return ApiClient.request<{ success: boolean; message: string; settings: UserSettings }>("/users/settings", {
      method: "PUT",
      body: JSON.stringify(settings)
    });
  },

  async deleteBiometricProfile(): Promise<{ success: boolean; message: string }> {
    return ApiClient.request<{ success: boolean; message: string }>("/account/face-profile", {
      method: "DELETE"
    });
  },

  async deleteAccount(): Promise<{ success: boolean; message: string }> {
    return ApiClient.request<{ success: boolean; message: string }>("/account", {
      method: "DELETE"
    });
  }
};
