"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { ApiClient } from "@/lib/api";
import { RadarScanner } from "@/components/RadarScanner";
import { 
  Search, Sparkles, Fingerprint, ArrowRight, ShieldCheck, 
  MapPin, MessageSquare, AlertCircle, RefreshCw, Eye
} from "lucide-react";

export default function DiscoverPage() {
  const { user } = useAuth();
  const [searching, setSearching] = useState(false);
  const [scanStep, setScanStep] = useState<number>(0);
  const [results, setResults] = useState<any | null>(null);
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
    setResults(null);
    setScanStep(1); // "Connecting to Vector Index..."

    const stepTimer1 = setTimeout(() => setScanStep(2), 700);
    const stepTimer2 = setTimeout(() => setScanStep(3), 1400);

    try {
      const data = await ApiClient.searchMatches(10, 0.50);
      setTimeout(() => {
        setResults(data);
        setSearching(false);
        setScanStep(0);
      }, 2000);
    } catch (err: any) {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setSearching(false);
      setScanStep(0);
      setError(err.message || "Failed to search for visual twins.");
    }
  };

  return (
    <div className="min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Top Banner / Hero */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5 text-[#00F0FF]" />
          <span>Vector Similarity ANN Engine • Cosine Proximity</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white">
          Discover Your Visual Twins
        </h1>
        <p className="mt-3 text-slate-400 text-sm sm:text-base leading-relaxed">
          Scan the consenting Doppel participant network to locate your closest algorithmic doppelgängers.
        </p>
      </div>

      {error && (
        <div className="mb-8 max-w-2xl mx-auto p-4 rounded-2xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs sm:text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Interactive Radar & Search Section */}
      {!results && (
        <div className="max-w-2xl mx-auto glass-panel rounded-3xl p-8 sm:p-12 border border-cyan-500/20 text-center flex flex-col items-center shadow-2xl relative overflow-hidden">
          <RadarScanner activeScanning={searching} />

          {/* Dynamic Status Text */}
          <div className="mt-8 mb-6 h-12 flex flex-col items-center justify-center">
            {searching ? (
              <div className="space-y-1">
                <div className="text-sm font-mono text-cyan-300 animate-pulse flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                  {scanStep === 1 && "Connecting to 512-D Vector Index..."}
                  {scanStep === 2 && "Executing Cosine Similarity ANN Search..."}
                  {scanStep === 3 && "Filtering Opted-Out Profiles & Calculating Ranks..."}
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  Enforcing zero-knowledge privacy constraints
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                Ready to search. Click below to begin your neural matching scan.
              </p>
            )}
          </div>

          <button
            onClick={startScan}
            disabled={searching}
            className="w-full sm:w-auto px-10 py-4 rounded-xl font-bold bg-gradient-to-r from-[#00F0FF] to-[#00A8FF] text-black shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2.5 text-base"
          >
            <Search className="w-5 h-5 text-black" />
            {searching ? "Scanning Network..." : "Start Neural Search"}
          </button>
        </div>
      )}

      {/* Results View */}
      {results && (
        <div className="space-y-10 animate-fade-in">
          {/* Summary Banner */}
          <div className="glass-panel rounded-2xl p-6 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-semibold">
                Search Completed in {results.execution_time_ms} ms
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                {results.matches_found} Visual Twins Identified
              </h2>
            </div>
            <button
              onClick={startScan}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 flex items-center gap-2 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Re-Scan Network
            </button>
          </div>

          {/* Top Rank #1 Feature Hero Match Card */}
          {results.matches.length > 0 && (
            <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-cyan-500/40 relative overflow-hidden shadow-2xl shadow-cyan-500/10">
              <div className="inline-block px-3 py-1 rounded-md bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold uppercase tracking-widest mb-6">
                ★ Closest Visual Match • Rank #1
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                {/* Photo & Avatar Display */}
                <div className="md:col-span-4 flex flex-col items-center text-center">
                  <div className="relative">
                    <img
                      src={results.matches[0].avatar || "https://api.dicebear.com/7.x/bottts/svg?seed=twin"}
                      alt={results.matches[0].display_name}
                      className="w-32 h-32 sm:w-36 sm:h-36 rounded-2xl bg-slate-900 border-2 border-cyan-400 p-1 shadow-2xl shadow-cyan-500/30"
                    />
                    <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 px-3 py-0.5 rounded-full bg-cyan-500 text-black font-mono font-extrabold text-xs shadow-md">
                      {results.matches[0].similarity_score}% MATCH
                    </div>
                  </div>
                </div>

                {/* Match Information */}
                <div className="md:col-span-8 space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      {results.matches[0].display_name}
                    </h3>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">
                      @{results.matches[0].username}
                      {results.matches[0].city_name && (
                        <span className="ml-3 inline-flex items-center gap-1 text-slate-300">
                          <MapPin className="w-3 h-3 text-cyan-400" />
                          {results.matches[0].city_name}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {results.matches[0].bio || "Consenting participant in the Doppel visual discovery network."}
                  </p>

                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-cyan-200">
                    <strong className="text-cyan-400 font-semibold block mb-1">Algorithmic Correlation Analysis:</strong>
                    {results.matches[0].match_explanation}
                  </div>

                  <div className="pt-2 flex items-center gap-3">
                    <Link
                      href={`/matches/${results.matches[0].match_id}`}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#00F0FF] text-black shadow-md shadow-cyan-500/20 hover:opacity-90 transition-all flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Profile Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Remaining Matches Grid (Ranks 2-10) */}
          {results.matches.length > 1 && (
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">
                Other Visual Proximity Matches (Ranks 2–{results.matches.length})
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.matches.slice(1).map((match: any) => (
                  <div
                    key={match.match_id}
                    className="glass-panel glass-panel-hover rounded-2xl p-6 border border-slate-800 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <img
                          src={match.avatar}
                          alt={match.display_name}
                          className="w-16 h-16 rounded-xl bg-slate-900 border border-slate-700 p-1"
                        />
                        <div className="text-right">
                          <span className="inline-block px-2.5 py-0.5 rounded-md bg-purple-500/20 border border-purple-500/40 text-purple-300 font-mono font-bold text-xs">
                            Rank #{match.ranking}
                          </span>
                          <div className="text-sm font-mono font-extrabold text-cyan-400 mt-1">
                            {match.similarity_score}%
                          </div>
                        </div>
                      </div>

                      <h4 className="text-base font-bold text-white">{match.display_name}</h4>
                      <p className="text-xs text-slate-500 font-mono">@{match.username}</p>

                      {match.city_name && (
                        <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-cyan-400" />
                          {match.city_name}
                        </p>
                      )}

                      <p className="text-xs text-slate-300 mt-3 line-clamp-2 leading-relaxed">
                        {match.bio || "Enrolled participant."}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-800/80">
                      <Link
                        href={`/matches/${match.match_id}`}
                        className="w-full py-2 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 hover:text-white transition-all flex items-center justify-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Inspect Match
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
