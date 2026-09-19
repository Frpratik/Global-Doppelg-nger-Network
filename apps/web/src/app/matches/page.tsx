"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { MatchingService } from "@/services/matching.service";
import { DoppelMatch } from "@/types/domain";
import { MatchCard } from "@/components/matching/MatchCard";
import { 
  Search, RefreshCw, AlertCircle, Sparkles, ArrowRight, Fingerprint
} from "lucide-react";

export default function MatchesListPage() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<DoppelMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-surface-elevated border border-surface-border text-brand-cyan text-xs font-mono font-medium mb-2">
            <Sparkles className="w-3.5 h-3.5 text-brand-cyan" />
            <span>Historical Telemetry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-content-primary tracking-tight">
            Discovered Visual Twins
          </h1>
          <p className="text-xs text-content-secondary mt-1">
            Recorded matches and algorithmic proximity scores from your previous discovery sessions.
          </p>
        </div>

        <Link
          href="/discover"
          className="px-4 py-2.5 rounded-lg text-xs font-bold bg-brand-cyan text-black hover:bg-brand-cyanHover transition-colors flex items-center gap-2 shadow-sm"
        >
          <Search className="w-3.5 h-3.5" />
          Run Vector Scan
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-status-danger/10 border border-status-danger/30 text-status-danger text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Content State */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-center space-y-3">
          <RefreshCw className="w-6 h-6 text-brand-cyan animate-spin" />
          <span className="text-xs text-content-muted font-mono">Loading Discovered Matches...</span>
        </div>
      ) : matches.length === 0 ? (
        <div className="surface-card rounded-2xl p-12 text-center max-w-md mx-auto border border-surface-border space-y-4 shadow-panel">
          <Fingerprint className="w-12 h-12 text-content-muted mx-auto opacity-30" />
          <div>
            <h3 className="text-base font-bold text-content-primary">No Matches in History</h3>
            <p className="text-xs text-content-secondary mt-1 leading-relaxed">
              You haven't recorded any visual twin matches yet. Start a discovery scan to search the participant network.
            </p>
          </div>
          <Link
            href="/discover"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold bg-brand-cyan text-black hover:bg-brand-cyanHover transition-colors"
          >
            Start Discovering
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match) => (
            <MatchCard key={match.match_id} match={match} />
          ))}
        </div>
      )}
    </div>
  );
}
