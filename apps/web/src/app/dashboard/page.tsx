"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { SettingsService } from "@/services/settings.service";
import { MatchingService } from "@/services/matching.service";
import { DoppelMatch } from "@/types/domain";
import { 
  Search, ShieldCheck, Cpu, UserCheck, ArrowRight, 
  CheckCircle2, RefreshCw, Eye, Fingerprint, MapPin
} from "lucide-react";

export default function DashboardPage() {
  const { user, refreshUser } = useAuth();
  const [discoveryEnabled, setDiscoveryEnabled] = useState(user?.settings?.discovery_enabled ?? true);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [recentMatches, setRecentMatches] = useState<DoppelMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.settings?.discovery_enabled !== undefined) {
      setDiscoveryEnabled(user.settings.discovery_enabled);
    }
  }, [user]);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const history = await MatchingService.getHistory();
        setRecentMatches(history.matches?.slice(0, 3) || []);
      } catch {
        // Handled gracefully
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
      await SettingsService.updateSettings({ discovery_enabled: newState });
      setDiscoveryEnabled(newState);
      await refreshUser();
    } catch {
      alert("Failed to update discovery status. Please verify connection.");
    } finally {
      setToggleLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Profile & Status Card */}
      <div className="surface-card rounded-2xl p-6 sm:p-8 border border-surface-border flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-panel">
        <div className="flex items-center gap-5">
          <img
            src={user?.avatar || "https://api.dicebear.com/7.x/adventurer/svg?seed=user"}
            alt="Profile Avatar"
            className="w-18 h-18 rounded-xl bg-surface-elevated border-2 border-brand-cyan/60 p-1 object-cover"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-content-primary">
                {user?.display_name || "Doppel Participant"}
              </h1>
              {user?.is_enrolled && (
                <span className="p-1 rounded-full bg-status-success/20 text-status-success" title="Enrolled in Vector Store">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
              )}
            </div>
            <p className="text-xs text-content-muted font-mono mt-0.5">@{user?.username || "username"}</p>
            <div className="flex items-center gap-2 mt-2 text-xs">
              <span className="text-brand-cyan font-mono font-medium">ArcFace 512-D</span>
              <span className="text-content-muted">•</span>
              <span className={discoveryEnabled ? "text-status-success font-medium" : "text-status-warning font-medium"}>
                {discoveryEnabled ? "Discovery Active" : "Discovery Paused"}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleToggleDiscovery}
            disabled={toggleLoading}
            className={`px-4 py-2.5 rounded-lg text-xs font-semibold border transition-colors flex items-center justify-center gap-2 ${
              discoveryEnabled
                ? "bg-status-success/10 text-status-success border-status-success/30 hover:bg-status-success/20"
                : "bg-status-warning/10 text-status-warning border-status-warning/30 hover:bg-status-warning/20"
            }`}
          >
            {toggleLoading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <UserCheck className="w-3.5 h-3.5" />
            )}
            Discovery: {discoveryEnabled ? "Searchable" : "Hidden"}
          </button>

          <Link
            href="/discover"
            className="px-5 py-2.5 rounded-lg text-xs font-bold bg-brand-cyan text-black hover:bg-brand-cyanHover transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <Search className="w-3.5 h-3.5 text-black" />
            Find Visual Twins
          </Link>
        </div>
      </div>

      {/* System Telemetry & Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="surface-card rounded-xl p-5 border border-surface-border space-y-2">
          <div className="flex items-center justify-between text-xs text-content-muted">
            <span className="uppercase tracking-wider font-semibold">Biometric Status</span>
            <ShieldCheck className="w-4 h-4 text-brand-cyan" />
          </div>
          <div className="text-xl font-bold text-content-primary">
            {user?.is_enrolled ? "Enrolled & Indexed" : "Pending Enrollment"}
          </div>
          <p className="text-[11px] text-content-muted">
            {user?.is_enrolled ? "512-D L2 normalized embedding in active index" : "Upload your selfie to participate"}
          </p>
        </div>

        <div className="surface-card rounded-xl p-5 border border-surface-border space-y-2">
          <div className="flex items-center justify-between text-xs text-content-muted">
            <span className="uppercase tracking-wider font-semibold">Consenting Network</span>
            <Cpu className="w-4 h-4 text-brand-cyan" />
          </div>
          <div className="text-xl font-bold text-content-primary">60+ Consenting</div>
          <p className="text-[11px] text-content-muted">
            Zero open-web scraping • 100% voluntary participant network
          </p>
        </div>

        <div className="surface-card rounded-xl p-5 border border-surface-border space-y-2">
          <div className="flex items-center justify-between text-xs text-content-muted">
            <span className="uppercase tracking-wider font-semibold">Similarity Metric</span>
            <Fingerprint className="w-4 h-4 text-status-success" />
          </div>
          <div className="text-xl font-bold text-content-primary font-mono">Cosine ANN</div>
          <p className="text-[11px] text-content-muted font-mono">
            Spatial Metric: d = 1 - cos(θ)
          </p>
        </div>
      </div>

      {/* Recent Discovered Matches */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-content-primary">Recent Discovery Results</h2>
          <Link href="/matches" className="text-xs text-brand-cyan hover:underline font-semibold flex items-center gap-1">
            View History <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentMatches.length === 0 ? (
          <div className="surface-card rounded-xl p-8 text-center text-xs text-content-muted border border-surface-border">
            No matches saved yet. Launch a discovery search to identify your visual twins.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {recentMatches.map((match) => (
              <div
                key={match.match_id}
                className="surface-card surface-interactive rounded-xl p-4 border border-surface-border flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={match.avatar || "https://api.dicebear.com/7.x/adventurer/svg?seed=recent"}
                    alt={match.display_name}
                    className="w-11 h-11 rounded-lg bg-surface-elevated border border-surface-border p-0.5 object-cover"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-content-primary leading-tight">{match.display_name}</h4>
                    <span className="text-[11px] font-mono text-brand-cyan font-bold block mt-0.5">
                      {match.similarity_score.toFixed(1)}% Match
                    </span>
                  </div>
                </div>
                <Link
                  href={`/matches/${match.match_id}`}
                  className="p-2 rounded-lg bg-surface-elevated hover:bg-surface-border text-content-secondary hover:text-content-primary transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
