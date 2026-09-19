"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { ApiClient } from "@/lib/api";
import { 
  Fingerprint, Search, MapPin, Eye, RefreshCw, AlertCircle, Sparkles, ArrowRight
} from "lucide-react";

export default function MatchesListPage() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.getMatchHistory();
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
    <div className="min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#00F0FF]" />
            <span>Discovery History</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Your Visual Doppelgängers</h1>
          <p className="text-xs text-slate-400 mt-1">
            Historical visual proximity matches recorded across your discovery sessions
          </p>
        </div>

        <Link
          href="/discover"
          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#00F0FF] text-black shadow-lg shadow-cyan-500/20 hover:opacity-90 transition-all flex items-center gap-2"
        >
          <Search className="w-4 h-4" />
          Run New Scan
        </Link>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
          <span className="text-xs text-slate-400 font-mono">Loading Discovered Twins...</span>
        </div>
      ) : matches.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center max-w-md mx-auto">
          <Fingerprint className="w-12 h-12 text-cyan-400 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-bold text-white mb-1">No Matches Discovered Yet</h3>
          <p className="text-xs text-slate-400 mb-6">
            Run your first vector search across the consenting participant network.
          </p>
          <Link
            href="/discover"
            className="px-6 py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-[#00F0FF] to-[#00A8FF] text-black inline-flex items-center gap-2"
          >
            Start Discovering
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match) => (
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
                    <span className="inline-block px-2.5 py-0.5 rounded-md bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono font-bold text-xs">
                      Rank #{match.ranking}
                    </span>
                    <div className="text-sm font-mono font-extrabold text-cyan-400 mt-1">
                      {match.similarity_score}%
                    </div>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white">{match.display_name}</h3>
                <p className="text-xs text-slate-500 font-mono">@{match.username}</p>

                {match.city_name && (
                  <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-cyan-400" />
                    {match.city_name}
                  </p>
                )}

                <p className="text-xs text-slate-300 mt-3 line-clamp-2 leading-relaxed">
                  {match.bio || "Consenting participant."}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800">
                <Link
                  href={`/matches/${match.match_id}`}
                  className="w-full py-2 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 hover:text-white transition-all flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Match Card
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
