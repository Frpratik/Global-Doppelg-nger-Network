"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { ApiClient } from "@/lib/api";
import { 
  Fingerprint, Search, ShieldCheck, Cpu, UserCheck, 
  Settings, ArrowRight, CheckCircle2, AlertCircle, RefreshCw, Eye
} from "lucide-react";

export default function DashboardPage() {
  const { user, refreshUser } = useAuth();
  const [discoveryEnabled, setDiscoveryEnabled] = useState(user?.settings?.discovery_enabled ?? true);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [recentMatches, setRecentMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.settings?.discovery_enabled !== undefined) {
      setDiscoveryEnabled(user.settings.discovery_enabled);
    }
  }, [user]);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const history = await ApiClient.getMatchHistory();
        setRecentMatches(history.matches?.slice(0, 3) || []);
      } catch {
        // Handled silently
      } finally {
        setLoading(false);
      }
    };
    fetchRecent();
  }, []);

  const handleToggleDiscovery = async () => {
    setToggleLoading(true);
    const newState = !discoveryEnabled;
    try {
      await ApiClient.updateSettings({ discovery_enabled: newState });
      setDiscoveryEnabled(newState);
      await refreshUser();
    } catch (err: any) {
      alert("Failed to update discovery status.");
    } finally {
      setToggleLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Header Banner */}
      <div className="glass-panel rounded-3xl p-8 sm:p-10 border border-cyan-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden shadow-2xl">
        <div className="flex items-center gap-5">
          <img
            src={user?.avatar || "https://api.dicebear.com/7.x/bottts/svg?seed=user"}
            alt="Profile Avatar"
            className="w-20 h-20 rounded-2xl bg-slate-900 border-2 border-cyan-400 p-1 shadow-lg shadow-cyan-500/20"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                {user?.display_name || "Doppel Explorer"}
              </h1>
              {user?.is_enrolled && (
                <span className="p-1 rounded-full bg-emerald-500/20 text-emerald-400" title="Enrolled">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">@{user?.username || "username"}</p>
            <div className="flex items-center gap-3 mt-2 text-xs">
              <span className="text-cyan-400 font-medium">ArcFace 512-D</span>
              <span className="text-slate-600">•</span>
              <span className={discoveryEnabled ? "text-emerald-400" : "text-amber-400"}>
                {discoveryEnabled ? "Searchable in Network" : "Hidden from Searches"}
              </span>
            </div>
          </div>
        </div>

        {/* Discovery Switch Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleToggleDiscovery}
            disabled={toggleLoading}
            className={`px-5 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              discoveryEnabled
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
                : "bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30"
            }`}
          >
            {toggleLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <UserCheck className="w-4 h-4" />
            )}
            Discovery: {discoveryEnabled ? "Enabled" : "Paused"}
          </button>

          <Link
            href="/discover"
            className="px-6 py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-[#00F0FF] to-[#00A8FF] text-black shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4 text-black" />
            Find Doppels
          </Link>
        </div>
      </div>

      {/* Telemetry Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-panel rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Biometric Status</span>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {user?.is_enrolled ? "Enrolled & Active" : "Pending Capture"}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {user?.is_enrolled ? "512-d L2 vector stored in RAM/Index" : "Upload portrait to activate"}
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Discovery Network</span>
            <Cpu className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">60+ Consenting</div>
          <p className="text-[11px] text-slate-500 mt-1">
            Zero internet scraping • Pure peer discovery
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Similarity Metric</span>
            <Fingerprint className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">Cosine ANN</div>
          <p className="text-[11px] text-slate-500 mt-1">
            Normalized distance metric: d = 1 - cos(θ)
          </p>
        </div>
      </div>

      {/* Recent Discovered Matches */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Recent Visual Proximity Matches</h2>
          <Link href="/matches" className="text-xs text-cyan-400 hover:underline font-semibold flex items-center gap-1">
            View All History <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentMatches.length === 0 ? (
          <div className="glass-panel rounded-2xl p-8 text-center text-xs text-slate-400">
            No matches saved yet. Launch a search to discover your visual twins.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {recentMatches.map((match) => (
              <div
                key={match.match_id}
                className="glass-panel glass-panel-hover rounded-2xl p-5 border border-slate-800 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={match.avatar}
                    alt={match.display_name}
                    className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 p-0.5"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-white">{match.display_name}</h4>
                    <span className="text-xs font-mono text-cyan-400 font-bold">{match.similarity_score}%</span>
                  </div>
                </div>
                <Link
                  href={`/matches/${match.match_id}`}
                  className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white"
                >
                  <Eye className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
