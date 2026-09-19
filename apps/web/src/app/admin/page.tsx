"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { ApiClient } from "@/lib/api";
import { 
  Cpu, Users, Fingerprint, ShieldAlert, Activity, 
  Database, RefreshCw, AlertCircle, Clock, CheckCircle2
} from "lucide-react";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsData, logsData] = await Promise.all([
        ApiClient.getAdminStats(),
        ApiClient.getAuditLogs()
      ]);
      setStats(statsData);
      setAuditLogs(logsData || []);
    } catch (err: any) {
      setError(err.message || "Failed to load admin telemetry. Admin privileges required.");
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-2">
            <Activity className="w-3.5 h-3.5 text-[#00F0FF]" />
            <span>Operational Telemetry & Audit</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">System Administration</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time vector index health, search latencies, and security audit log monitor.
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Stats
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Telemetry Metric Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-panel rounded-2xl p-6 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Total Users</span>
              <Users className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold text-white font-mono">{stats.total_users}</div>
            <p className="text-[11px] text-slate-500 mt-1">{stats.enrolled_users} Enrolled Portraits</p>
          </div>

          <div className="glass-panel rounded-2xl p-6 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Active Discovery</span>
              <Fingerprint className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white font-mono">{stats.active_discovery_profiles}</div>
            <p className="text-[11px] text-slate-500 mt-1">Consenting & Searchable</p>
          </div>

          <div className="glass-panel rounded-2xl p-6 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Avg Search Latency</span>
              <Activity className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-white font-mono">{stats.avg_search_latency_ms} ms</div>
            <p className="text-[11px] text-slate-500 mt-1">Cosine ANN Vector Distance</p>
          </div>

          <div className="glass-panel rounded-2xl p-6 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Vector Store Size</span>
              <Database className="w-4 h-4 text-[#00F0FF]" />
            </div>
            <div className="text-2xl font-bold text-white font-mono">{stats.vector_index_size}</div>
            <p className="text-[11px] text-slate-500 mt-1">Backend: {stats.vector_backend}</p>
          </div>
        </div>
      )}

      {/* Audit Log Table */}
      <div className="glass-panel rounded-3xl p-8 border border-slate-800 space-y-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-4">
          <Clock className="w-5 h-5 text-cyan-400" />
          Recent Security & Biometric Audit Trail
        </h2>

        {auditLogs.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">No audit records loaded.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3 font-semibold">Timestamp</th>
                  <th className="pb-3 font-semibold">Action</th>
                  <th className="pb-3 font-semibold">User ID</th>
                  <th className="pb-3 font-semibold">Audit Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="text-slate-300 hover:bg-slate-900/50">
                    <td className="py-3 text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 font-bold text-cyan-300">{log.action}</td>
                    <td className="py-3 text-slate-400">{log.user_id ? log.user_id.slice(0, 8) + "..." : "System"}</td>
                    <td className="py-3 text-slate-500 truncate max-w-xs">
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
