"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { ApiClient } from "@/lib/api";
import { 
  Fingerprint, MapPin, Send, ShieldAlert, Ban, ArrowLeft, 
  CheckCircle2, AlertCircle, RefreshCw, Eye, Sparkles, Lock
} from "lucide-react";

export default function MatchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const matchId = params?.id as string;

  const [match, setMatch] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectMessage, setConnectMessage] = useState("");
  const [connectStatus, setConnectStatus] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const data = await ApiClient.getMatchDetail(matchId);
        setMatch(data);
      } catch (err: any) {
        // If not in single get by id directly from session, load mock / history
        try {
          const history = await ApiClient.getMatchHistory();
          const found = history.matches.find((m: any) => m.match_id === matchId);
          if (found) {
            setMatch(found);
          } else {
            setError("Match profile not found or is no longer searchable.");
          }
        } catch {
          setError("Failed to load match details.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (matchId) {
      fetchDetail();
    }
  }, [matchId]);

  const handleSendConnection = async () => {
    if (!match) return;
    try {
      await ApiClient.sendConnection({
        receiver_id: match.matched_user_id,
        message: connectMessage || "Hello! We are visual twins on Doppel."
      });
      setConnectStatus("Connection request sent successfully.");
    } catch (err: any) {
      setError(err.message || "Could not send connection request.");
    }
  };

  const handleBlock = async () => {
    if (!match) return;
    if (confirm("Block this participant? They will never appear in your searches again.")) {
      try {
        await ApiClient.blockUser(match.matched_user_id);
        setActionNotice("User blocked. Returning to matches...");
        setTimeout(() => router.push("/matches"), 1500);
      } catch (err: any) {
        setError(err.message || "Failed to block user.");
      }
    }
  };

  const handleReport = async () => {
    if (!match) return;
    const reason = prompt("Please enter the reason for reporting this profile:");
    if (reason) {
      try {
        await ApiClient.reportUser({
          reported_user_id: match.matched_user_id,
          reason,
          details: "Reported from match inspection view."
        });
        setActionNotice("Report submitted to Doppel Trust & Safety.");
      } catch (err: any) {
        setError(err.message || "Failed to submit report.");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
        <p className="text-xs text-slate-400 font-mono">Retrieving Match Telemetry...</p>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full glass-panel rounded-3xl p-8 text-center">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Match Unavailable</h2>
          <p className="text-xs text-slate-400 mb-6">{error || "Record not found."}</p>
          <Link
            href="/discover"
            className="px-6 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 text-black hover:opacity-90"
          >
            Return to Discover
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <Link
        href="/discover"
        className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-cyan-400 mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Discovery
      </Link>

      {actionNotice && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Main Inspection Card */}
      <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-cyan-500/30 relative shadow-2xl">
        {/* Top Header Badge */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6 mb-8">
          <div>
            <div className="inline-block px-3 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold uppercase tracking-wider mb-2">
              Rank #{match.ranking} • Cosine Metric
            </div>
            <h1 className="text-3xl font-extrabold text-white">
              {match.display_name}
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              @{match.username}
              {match.city_name && (
                <span className="ml-3 inline-flex items-center gap-1 text-slate-300">
                  <MapPin className="w-3 h-3 text-cyan-400" />
                  {match.city_name}
                </span>
              )}
            </p>
          </div>

          <div className="text-right">
            <div className="text-4xl font-extrabold text-[#00F0FF] glow-cyan font-mono">
              {match.similarity_score}%
            </div>
            <div className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">
              Visual Correlation
            </div>
          </div>
        </div>

        {/* Side-by-Side Avatar Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-8">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col items-center text-center">
            <img
              src={user?.avatar || "https://api.dicebear.com/7.x/bottts/svg?seed=me"}
              alt="You"
              className="w-28 h-28 rounded-2xl bg-slate-800 border-2 border-cyan-400 p-1 mb-3"
            />
            <span className="text-sm font-bold text-white">Your Profile</span>
            <span className="text-xs text-slate-500 font-mono">@{user?.username || "you"}</span>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/80 border border-purple-500/40 flex flex-col items-center text-center shadow-lg shadow-purple-500/10">
            <img
              src={match.avatar}
              alt={match.display_name}
              className="w-28 h-28 rounded-2xl bg-slate-800 border-2 border-purple-400 p-1 mb-3"
            />
            <span className="text-sm font-bold text-white">{match.display_name}</span>
            <span className="text-xs text-purple-400 font-mono">@{match.username}</span>
          </div>
        </div>

        {/* AI Correlation Explanation */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 mb-8">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Algorithmic Feature Proximity Analysis</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {match.match_explanation}
          </p>
          <p className="text-[11px] text-slate-500 italic pt-1">
            * Note: Visual similarity scores represent Euclidean/Cosine spatial distance in the deep feature manifold and do not indicate genetic or biological kinship.
          </p>
        </div>

        {/* Social Connection Section */}
        {match.allow_contact && (
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 mb-8">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Send className="w-4 h-4 text-cyan-400" />
              Send Doppel Connection Request
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Send a note to exchange contact details or share your visual match card.
            </p>

            {connectStatus ? (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs">
                {connectStatus}
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={connectMessage}
                  onChange={(e) => setConnectMessage(e.target.value)}
                  placeholder="Hey, looks like our visual similarity score is 94%!"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:border-cyan-400 focus:outline-none"
                />
                <button
                  onClick={handleSendConnection}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#00F0FF] text-black shadow-md shadow-cyan-500/20 hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  Send Request
                </button>
              </div>
            )}
          </div>
        )}

        {/* Moderation Controls: Block & Report */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-white/10 text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBlock}
              className="flex items-center gap-1.5 text-slate-400 hover:text-amber-400 transition-colors"
            >
              <Ban className="w-4 h-4" />
              Block User
            </button>
            <button
              onClick={handleReport}
              className="flex items-center gap-1.5 text-slate-400 hover:text-rose-400 transition-colors"
            >
              <ShieldAlert className="w-4 h-4" />
              Report Profile
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-slate-500">
            <Lock className="w-3.5 h-3.5" />
            <span>Encrypted Vector Identity</span>
          </div>
        </div>
      </div>
    </div>
  );
}
