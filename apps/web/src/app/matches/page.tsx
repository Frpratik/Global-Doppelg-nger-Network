"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { MatchingService } from "@/services/matching.service";
import { DoppelMatch } from "@/types/domain";
import { MatchCard } from "@/components/matching/MatchCard";
import { 
  Search, RefreshCw, AlertCircle, Sparkles, ArrowRight, Fingerprint, 
  Filter, SlidersHorizontal, MapPin, Users
} from "lucide-react";

export default function MatchesListPage() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<DoppelMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<"all" | "high" | "city">("all");

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await MatchingService.getHistory();
      setMatches(res.matches || []);
    } catch (err: any) {
      setError(err.message || "Failed to load match history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filteredMatches = useMemo(() => {
    if (filterMode === "high") {
      return matches.filter((m) => m.similarity_score >= 80);
    }
    if (filterMode === "city") {
      return matches.filter((m) => Boolean(m.city_name));
    }
    return matches;
  }, [matches, filterMode]);

  const stats = useMemo(() => {
    if (!matches.length) return null;
    const highest = Math.max(...matches.map((m) => m.similarity_score));
    const avg = matches.reduce((acc, m) => acc + m.similarity_score, 0) / matches.length;
    return {
      total: matches.length,
      highest: highest.toFixed(1),
      avg: avg.toFixed(1)
    };
  }, [matches]);

  return (
    <div className="min-h-[85vh] py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-surface-elevated border border-surface-border text-brand-cyan text-xs font-mono font-medium mb-2">
            <Sparkles className="w-3.5 h-3.5 text-brand-cyan" />
            <span>Discovered Doppel Network</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-content-primary tracking-tight">
            Visual Twin Matches
          </h1>
          <p className="text-xs text-content-secondary mt-1">
            Historical algorithmic twin discovery logs and mathematical proximity rankings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/discover"
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-cyan text-black hover:bg-brand-cyanHover transition-all flex items-center gap-2 shadow-buttonPrimary"
          >
            <Search className="w-3.5 h-3.5" />
            Run Discovery Scan
          </Link>
        </div>
      </div>

      {/* Telemetry Stats Bar */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="surface-card rounded-xl p-4 border border-surface-border flex items-center justify-between">
            <span className="text-xs text-content-secondary">Total Discoveries</span>
            <span className="text-lg font-bold text-content-primary font-mono">{stats.total} Profiles</span>
          </div>
          <div className="surface-card rounded-xl p-4 border border-surface-border flex items-center justify-between">
            <span className="text-xs text-content-secondary">Peak Similarity</span>
            <span className="text-lg font-bold text-brand-cyan font-mono">{stats.highest}%</span>
          </div>
          <div className="surface-card rounded-xl p-4 border border-surface-border flex items-center justify-between">
            <span className="text-xs text-content-secondary">Mean Proximity</span>
            <span className="text-lg font-bold text-status-success font-mono">{stats.avg}%</span>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      {matches.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setFilterMode("all")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterMode === "all"
                ? "bg-brand-cyan text-black font-bold shadow-sm"
                : "bg-surface-elevated text-content-secondary hover:text-content-primary border border-surface-border"
            }`}
          >
            All Matches ({matches.length})
          </button>
          <button
            onClick={() => setFilterMode("high")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterMode === "high"
                ? "bg-brand-cyan text-black font-bold shadow-sm"
                : "bg-surface-elevated text-content-secondary hover:text-content-primary border border-surface-border"
            }`}
          >
            High Likeness &ge;80%
          </button>
          <button
            onClick={() => setFilterMode("city")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterMode === "city"
                ? "bg-brand-cyan text-black font-bold shadow-sm"
                : "bg-surface-elevated text-content-secondary hover:text-content-primary border border-surface-border"
            }`}
          >
            Location Disclosed
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-status-danger/10 border border-status-danger/30 text-status-danger text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Content Grid */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-center space-y-3">
          <RefreshCw className="w-6 h-6 text-brand-cyan animate-spin" />
          <span className="text-xs text-content-muted font-mono">Querying Participant Vector History...</span>
        </div>
      ) : filteredMatches.length === 0 ? (
        <div className="surface-card rounded-2xl p-12 text-center max-w-md mx-auto border border-surface-border space-y-4 shadow-panel">
          <Fingerprint className="w-12 h-12 text-content-muted mx-auto opacity-30" />
          <div>
            <h3 className="text-base font-bold text-content-primary">
              {matches.length === 0 ? "No Matches in History" : "No Matches in Selected Filter"}
            </h3>
            <p className="text-xs text-content-secondary mt-1 leading-relaxed">
              {matches.length === 0
                ? "You haven't recorded any visual twin matches yet. Start a discovery scan to search the participant network."
                : "Try selecting 'All Matches' to see your complete discovery log."}
            </p>
          </div>
          {matches.length === 0 ? (
            <Link
              href="/discover"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-cyan text-black hover:bg-brand-cyanHover transition-all shadow-buttonPrimary"
            >
              Start Discovering
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <button
              onClick={() => setFilterMode("all")}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-surface-elevated text-brand-cyan border border-brand-cyan/40"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMatches.map((match) => (
            <MatchCard key={match.match_id} match={match} />
          ))}
        </div>
      )}
    </div>
  );
}
