"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { MatchingService } from "@/services/matching.service";
import { DiscoverySessionResult } from "@/types/domain";
import { RadarScanner } from "@/components/RadarScanner";
import { MatchCard } from "@/components/matching/MatchCard";
import { 
  Search, ShieldCheck, ArrowRight, AlertCircle, 
  RefreshCw, Eye, MapPin, Sparkles, Filter, CheckCircle2
} from "lucide-react";

export default function DiscoverPage() {
  const { user } = useAuth();
  const [searching, setSearching] = useState(false);
  const [scanStep, setScanStep] = useState<number>(0);
  const [sessionData, setSessionData] = useState<DiscoverySessionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startScan = async () => {
    if (!user) {
      window.location.href = "/login";
      return;
    }
    if (!user.is_enrolled) {
      window.location.href = "/enroll";
      return;
    }

    setSearching(true);
    setError(null);
    setSessionData(null);
    setScanStep(1); // "Connecting to 512-D Vector Index..."

    const stepTimer1 = setTimeout(() => setScanStep(2), 650);
    const stepTimer2 = setTimeout(() => setScanStep(3), 1300);

    try {
      const data = await MatchingService.search(10, 0.50);
      setTimeout(() => {
        setSessionData(data);
        setSearching(false);
        setScanStep(0);
      }, 1900);
    } catch (err: any) {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setSearching(false);
      setScanStep(0);
      setError(err.message || "Unable to search the participant network. Please verify backend status.");
    }
  };

  return (
    <div className="min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Header Section */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-surface-elevated border border-surface-border text-brand-cyan text-xs font-mono font-medium mb-3">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-cyan" />
          <span>Cosine ANN Vector Manifold • Consenting Network</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-content-primary tracking-tight">
          Discover Your Visual Twins
        </h1>
        <p className="mt-2 text-content-secondary text-sm sm:text-base leading-relaxed">
          Search the consenting participant network to identify profiles with high facial feature correspondence.
        </p>
      </div>

      {error && (
        <div className="max-w-2xl mx-auto p-4 rounded-xl bg-status-danger/10 border border-status-danger/30 text-status-danger text-xs sm:text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="block font-semibold">Discovery scan failed</strong>
            <p className="text-content-secondary mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Main Interactive Radar & Trigger Panel */}
      {!sessionData && (
        <div className="max-w-2xl mx-auto surface-card rounded-2xl p-8 sm:p-12 border border-surface-border text-center flex flex-col items-center shadow-panel relative overflow-hidden">
          <RadarScanner activeScanning={searching} />

          {/* Dynamic Progress Microcopy */}
          <div className="mt-8 mb-6 h-14 flex flex-col items-center justify-center">
            {searching ? (
              <div className="space-y-1">
                <div className="text-xs font-mono text-brand-cyan flex items-center justify-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  {scanStep === 1 && "Querying 512-D ArcFace vector store..."}
                  {scanStep === 2 && "Computing Cosine ANN similarities across enrolled pool..."}
                  {scanStep === 3 && "Applying privacy filters, blocklists, and ranking top candidates..."}
                </div>
                <p className="text-[11px] text-content-muted font-mono">
                  Zero-knowledge consent filtering active
                </p>
              </div>
            ) : (
              <p className="text-xs text-content-secondary">
                Ready to search. Click below to execute a cosine distance query against enrolled participants.
              </p>
            )}
          </div>

          <button
            onClick={startScan}
            disabled={searching}
            className="w-full sm:w-auto px-8 py-3.5 rounded-lg font-bold bg-brand-cyan hover:bg-brand-cyanHover text-black disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-sm shadow-sm"
          >
            <Search className="w-4 h-4 text-black" />
            {searching ? "Scanning Network..." : "Start Vector Search"}
          </button>
        </div>
      )}

      {/* Results View */}
      {sessionData && (
        <div className="space-y-8 animate-fade-in">
          {/* Summary Metric Header */}
          <div className="surface-card rounded-xl p-5 border border-surface-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-mono text-brand-cyan uppercase tracking-wider font-semibold">
                Completed in {sessionData.execution_time_ms.toFixed(1)} ms
              </span>
              <h2 className="text-xl font-bold text-content-primary mt-0.5">
                {sessionData.matches_found} Algorithmic Doppelgängers Identified
              </h2>
            </div>
            <button
              onClick={startScan}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-surface-elevated hover:bg-surface-border border border-surface-border text-content-secondary hover:text-content-primary flex items-center gap-2 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Re-Scan Network
            </button>
          </div>

          {/* Top Rank Highlight Profile */}
          {sessionData.matches.length > 0 && (
            <div className="surface-card rounded-2xl p-6 sm:p-8 border border-brand-cyan/40 relative overflow-hidden shadow-panelHover">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan text-xs font-mono font-bold uppercase tracking-wider mb-6">
                <Sparkles className="w-3.5 h-3.5 text-brand-cyan" />
                <span>Rank #1 Visual Proximity Match</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Avatar Display */}
                <div className="md:col-span-4 flex flex-col items-center text-center">
                  <div className="relative">
                    <img
                      src={sessionData.matches[0].avatar || "https://api.dicebear.com/7.x/adventurer/svg?seed=twin1"}
                      alt={sessionData.matches[0].display_name}
                      className="w-32 h-32 rounded-xl bg-surface-elevated border-2 border-brand-cyan p-1 object-cover"
                    />
                    <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-brand-cyan text-black font-mono font-extrabold text-[11px] shadow-sm">
                      {sessionData.matches[0].similarity_score.toFixed(1)}% MATCH
                    </span>
                  </div>
                </div>

                {/* Information and Explanation */}
                <div className="md:col-span-8 space-y-3">
                  <div>
                    <h3 className="text-xl font-bold text-content-primary">
                      {sessionData.matches[0].display_name}
                    </h3>
                    <div className="text-xs text-content-muted font-mono mt-0.5">
                      @{sessionData.matches[0].username}
                      {sessionData.matches[0].city_name && (
                        <span className="ml-3 inline-flex items-center gap-1 text-content-secondary">
                          <MapPin className="w-3 h-3 text-brand-cyan" />
                          {sessionData.matches[0].city_name}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
                    {sessionData.matches[0].bio || "Consenting participant in the Doppel visual discovery network."}
                  </p>

                  <div className="p-3.5 rounded-lg bg-surface-elevated border border-surface-border text-xs text-content-secondary space-y-1">
                    <span className="text-brand-cyan font-semibold block">Feature Correlation Analysis</span>
                    <p>{sessionData.matches[0].match_explanation}</p>
                  </div>

                  <div className="pt-2 flex items-center gap-3">
                    <Link
                      href={`/matches/${sessionData.matches[0].match_id}`}
                      className="px-4 py-2 rounded-lg text-xs font-bold bg-brand-cyan text-black hover:bg-brand-cyanHover transition-colors flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Inspect Match Telemetry
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Remaining Matches Grid (Ranks 2+) */}
          {sessionData.matches.length > 1 && (
            <div className="space-y-4">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-content-muted">
                Additional Proximity Matches (Ranks 2–{sessionData.matches.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {sessionData.matches.slice(1).map((match) => (
                  <MatchCard key={match.match_id} match={match} />
                ))}
              </div>
            </div>
          )}

          {/* Empty Matches State */}
          {sessionData.matches.length === 0 && (
            <div className="surface-card rounded-2xl p-12 text-center max-w-md mx-auto border border-surface-border space-y-3">
              <Filter className="w-10 h-10 text-content-muted mx-auto opacity-40" />
              <h3 className="text-base font-bold text-content-primary">No Matching Profiles Found</h3>
              <p className="text-xs text-content-secondary leading-relaxed">
                No currently enrolled consenting profiles met the minimum similarity threshold (&ge; 50%). As more participants join the network, new visual matches will appear.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
