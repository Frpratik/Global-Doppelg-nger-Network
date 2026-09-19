import { ApiClient } from "@/lib/api";
import { AdminTelemetry, AuditLogItem } from "@/types/domain";

export const AdminService = {
  async getTelemetry(): Promise<AdminTelemetry> {
    return ApiClient.request<AdminTelemetry>("/admin/stats", { method: "GET" });
  },

  async getAuditLogs(limit: number = 50): Promise<AuditLogItem[]> {
    return ApiClient.request<AuditLogItem[]>(`/admin/audit-logs?limit=${limit}`, { method: "GET" });
  },

  async getReports(): Promise<any[]> {
    return ApiClient.request<any[]>("/admin/reports", { method: "GET" });
  }
};
