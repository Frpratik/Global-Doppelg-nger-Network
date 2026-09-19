"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { AdminService } from "@/services/admin.service";
import { AdminTelemetry, AuditLogItem } from "@/types/domain";
import { 
  Users, Fingerprint, Activity, Database, 
  RefreshCw, AlertCircle, Clock, ShieldCheck
} from "lucide-react";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminTelemetry | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsData, logsData] = await Promise.all([
        AdminService.getTelemetry(),
        AdminService.getAuditLogs()
      ]);
      setStats(statsData);
      setAuditLogs(logsData || []);
    } catch (err: any) {
      setError(err.message || "Failed to load telemetry. Admin privileges are required.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  return (
    <div className="min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-surface-elevated border border-surface-border text-brand-cyan text-xs font-mono font-medium mb-2">
            <Activity className="w-3.5 h-3.5 text-brand-cyan" />
            <span>Operational Telemetry & Security Audit</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-content-primary tracking-tight">
            System Administration
          </h1>
          <p className="text-xs text-content-secondary mt-1">
            Real-time vector index health, query latency distribution, and immutable audit logs.
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          disabled={loading}
          className="px-4 py-2 rounded-lg text-xs font-semibold bg-surface-elevated hover:bg-surface-border border border-surface-border text-content-secondary hover:text-content-primary flex items-center gap-2 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Metrics
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-status-danger/10 border border-status-danger/30 text-status-danger text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Metric Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="surface-card rounded-xl p-5 border border-surface-border space-y-2">
            <div className="flex items-center justify-between text-xs text-content-muted">
              <span className="font-semibold uppercase tracking-wider">Total Accounts</span>
              <Users className="w-4 h-4 text-brand-cyan" />
            </div>
            <div className="text-2xl font-bold text-content-primary font-mono">{stats.total_users}</div>
            <p className="text-[11px] text-content-muted">{stats.enrolled_users} Enrolled & Vectorized</p>
          </div>

          <div className="surface-card rounded-xl p-5 border border-surface-border space-y-2">
            <div className="flex items-center justify-between text-xs text-content-muted">
              <span className="font-semibold uppercase tracking-wider">Active Discovery</span>
              <Fingerprint className="w-4 h-4 text-status-success" />
            </div>
            <div className="text-2xl font-bold text-content-primary font-mono">{stats.active_discovery_profiles}</div>
            <p className="text-[11px] text-content-muted">Consenting & Searchable</p>
          </div>

          <div className="surface-card rounded-xl p-5 border border-surface-border space-y-2">
            <div className="flex items-center justify-between text-xs text-content-muted">
              <span className="font-semibold uppercase tracking-wider">Avg Query Latency</span>
              <Activity className="w-4 h-4 text-brand-cyan" />
            </div>
            <div className="text-2xl font-bold text-content-primary font-mono">{stats.avg_search_latency_ms.toFixed(2)} ms</div>
            <p className="text-[11px] text-content-muted font-mono">Cosine Dot-Product ANN</p>
          </div>

          <div className="surface-card rounded-xl p-5 border border-surface-border space-y-2">
            <div className="flex items-center justify-between text-xs text-content-muted">
              <span className="font-semibold uppercase tracking-wider">Vector Store</span>
              <Database className="w-4 h-4 text-brand-cyan" />
            </div>
            <div className="text-2xl font-bold text-content-primary font-mono">{stats.vector_index_size}</div>
            <p className="text-[11px] text-content-muted font-mono">Driver: {stats.vector_backend}</p>
          </div>
        </div>
      )}

      {/* Audit Log Table */}
      <div className="surface-card rounded-2xl p-6 sm:p-8 border border-surface-border space-y-5 shadow-panel">
        <h2 className="text-base font-bold text-content-primary flex items-center gap-2 border-b border-surface-border pb-4">
          <Clock className="w-4 h-4 text-brand-cyan" />
          Security & Biometric Audit Trail
        </h2>

        {auditLogs.length === 0 ? (
          <p className="text-xs text-content-muted text-center py-6">No audit records recorded.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-surface-border text-content-muted">
                  <th className="pb-3 font-semibold font-mono">Timestamp</th>
                  <th className="pb-3 font-semibold font-mono">Action</th>
                  <th className="pb-3 font-semibold font-mono">Subject ID</th>
                  <th className="pb-3 font-semibold font-mono">Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/60 font-mono text-[11px]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="text-content-secondary hover:bg-surface-elevated/50 transition-colors">
                    <td className="py-2.5 text-content-muted whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2.5 font-bold text-brand-cyan">{log.action}</td>
                    <td className="py-2.5 text-content-muted">{log.user_id ? log.user_id.slice(0, 8) + "..." : "System"}</td>
                    <td className="py-2.5 text-content-muted truncate max-w-xs">
                      {JSON.stringify(log.metadata || {})}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
