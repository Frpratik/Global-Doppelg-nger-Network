"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { MatchingService } from "@/services/matching.service";
import { ConnectionService } from "@/services/connection.service";
import { DoppelMatch } from "@/types/domain";
import { ComparisonViewer } from "@/components/matching/ComparisonViewer";
import { SimilarityMeter } from "@/components/matching/SimilarityMeter";
import { 
  ArrowLeft, MapPin, Send, Ban, ShieldAlert, CheckCircle2, 
  AlertCircle, RefreshCw, Lock, Sparkles, UserCheck, MessageSquare, Clock
} from "lucide-react";

export default function MatchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const matchId = params?.id as string;

  const [match, setMatch] = useState<DoppelMatch | null>(null);
  const [twinStatus, setTwinStatus] = useState<"none" | "pending" | "accepted">("none");
  const [loading, setLoading] = useState(true);
  const [connectMessage, setConnectMessage] = useState("");
  const [connectStatus, setConnectStatus] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await MatchingService.getMatchById(matchId);
        setMatch(data);

        // Check connection status
        try {
          const conns = await ConnectionService.getConnections();
          const isAccepted = conns.accepted_twins.some((c) => c.peer.user_id === data.matched_user_id);
          const isPendingOut = conns.pending_outgoing.some((c) => c.peer.user_id === data.matched_user_id);
          const isPendingIn = conns.pending_incoming.some((c) => c.peer.user_id === data.matched_user_id);

          if (isAccepted) setTwinStatus("accepted");
          else if (isPendingOut || isPendingIn) setTwinStatus("pending");
          else setTwinStatus("none");
        } catch {
          // Handled gracefully
        }
      } catch (err: any) {
        // Fallback search through match history
        try {
          const history = await MatchingService.getHistory();
          const found = history.matches.find((m: DoppelMatch) => m.match_id === matchId);
          if (found) {
            setMatch(found);
          } else {
            setError("The requested match profile is no longer available or was removed from discovery.");
          }
        } catch {
          setError("Failed to retrieve match details.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (matchId) {
      fetchDetail();
    }
  }, [matchId]);

  const handleSendConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!match) return;
    setIsSending(true);
    try {
      await MatchingService.sendConnection(
        match.matched_user_id,
        connectMessage || `Hi ${match.display_name}! Our Doppel similarity score is ${match.similarity_score.toFixed(1)}%.`
      );
      setConnectStatus("Connection invitation successfully delivered.");
      setConnectMessage("");
    } catch (err: any) {
      setError(err.message || "Unable to send connection invitation.");
    } finally {
      setIsSending(false);
    }
  };

  const handleBlock = async () => {
    if (!match) return;
    if (confirm(`Block @${match.username}? They will never appear in your future discovery scans and will not be able to contact you.`)) {
      try {
        await MatchingService.blockUser(match.matched_user_id);
        setActionNotice("Participant blocked. Returning to matches...");
        setTimeout(() => router.push("/matches"), 1400);
      } catch (err: any) {
        setError(err.message || "Failed to block participant.");
      }
    }
  };

  const handleReport = async () => {
    if (!match) return;
    const reason = prompt("Please provide a reason for reporting this profile (e.g., impersonation, abusive photo):");
    if (reason && reason.trim()) {
      try {
        await MatchingService.reportUser(
          match.matched_user_id,
          reason.trim(),
          "Report submitted from visual match inspection view."
        );
        setActionNotice("Report submitted to Doppel Trust & Safety.");
      } catch (err: any) {
        setError(err.message || "Failed to submit report.");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-6 h-6 text-brand-cyan animate-spin" />
        <p className="text-xs text-content-muted font-mono">Loading Profile Telemetry...</p>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full surface-card rounded-2xl p-8 text-center border border-surface-border space-y-4 shadow-panel">
          <AlertCircle className="w-10 h-10 text-status-danger mx-auto opacity-70" />
          <h2 className="text-lg font-bold text-content-primary">Match Not Available</h2>
          <p className="text-xs text-content-secondary leading-relaxed">{error || "Record not found."}</p>
          <Link
            href="/discover"
            className="inline-flex items-center gap-1 px-5 py-2.5 rounded-lg text-xs font-bold bg-brand-cyan text-black hover:bg-brand-cyanHover transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Return to Discovery
          </Link>
        </div>
      </div>
    );
  }

  // Calculate raw distance from similarity score: distance = 1 - (score / 100)
  const rawDistance = Math.max(0, 1 - (match.similarity_score / 100));

  return (
    <div className="min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      {/* Back Link */}
      <Link
        href="/discover"
        className="inline-flex items-center gap-1.5 text-xs text-content-muted hover:text-brand-cyan transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Discovery
      </Link>

      {actionNotice && (
        <div className="p-4 rounded-xl bg-status-success/10 border border-status-success/30 text-status-success text-xs flex items-center gap-3">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Main Inspection Card */}
      <div className="surface-card rounded-2xl p-6 sm:p-10 border border-surface-border space-y-8 shadow-panel">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-surface-elevated border border-surface-border text-brand-cyan text-xs font-mono font-bold uppercase tracking-wider mb-2">
              Rank #{match.ranking} Visual Match
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-content-primary">
              {match.display_name}
            </h1>
            <div className="text-xs text-content-muted font-mono mt-0.5 flex items-center gap-3">
              <span>@{match.username}</span>
              {match.city_name && (
                <span className="inline-flex items-center gap-1 text-content-secondary">
                  <MapPin className="w-3 h-3 text-brand-cyan" />
                  {match.city_name}
                </span>
              )}
            </div>
          </div>

          <div className="text-left sm:text-right">
            <div className="text-3xl font-extrabold text-brand-cyan font-mono">
              {match.similarity_score.toFixed(1)}%
            </div>
            <span className="text-[10px] text-content-muted font-mono uppercase tracking-wider block">
              Cosine Similarity
            </span>
          </div>
        </div>

        {/* Side-by-Side Comparison */}
        <ComparisonViewer
          userAvatar={user?.avatar}
          userDisplayName={user?.display_name || "You"}
          userUsername={user?.username || "you"}
          matchAvatar={match.avatar}
          matchDisplayName={match.display_name}
          matchUsername={match.username}
          similarityScore={match.similarity_score}
        />

        {/* Similarity Metric Gauge */}
        <SimilarityMeter
          similarityScore={match.similarity_score}
          rawDistance={rawDistance}
        />

        {/* Feature Correlation Analysis */}
        <div className="p-4 rounded-xl bg-surface-elevated border border-surface-border space-y-2">
          <div className="flex items-center gap-2 text-brand-cyan font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-brand-cyan" />
            <span>512-D Feature Space Correlation Analysis</span>
          </div>
          <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
            {match.match_explanation}
          </p>
          <p className="text-[11px] text-content-muted pt-1">
            * Scientific Note: Visual similarity measures angular proximity in the mathematical ArcFace feature space. It represents morphological resemblance and does not imply genetic or genealogical kinship.
          </p>
        </div>

        {/* Twin Connection & Chat Launch Section */}
        {match.allow_contact && (
          <div className="surface-elevated rounded-xl p-5 border border-surface-border space-y-3">
            {twinStatus === "accepted" ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-status-success uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Confirmed Visual Twins
                  </span>
                  <p className="text-xs text-content-secondary mt-0.5">
                    You and {match.display_name} have mutually accepted a Twin Connection. Direct messaging is unlocked!
                  </p>
                </div>
                <Link
                  href={`/messages?twin=${match.matched_user_id}`}
                  className="px-5 py-2.5 rounded-lg text-xs font-bold bg-brand-cyan text-black hover:bg-brand-cyanHover transition-colors flex items-center gap-2 whitespace-nowrap shadow-sm"
                >
                  <MessageSquare className="w-4 h-4" />
                  Open Twin Chat
                </Link>
              </div>
            ) : twinStatus === "pending" ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-status-warning uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    Twin Request Pending
                  </span>
                  <p className="text-xs text-content-secondary mt-0.5">
                    A Twin Connection request has been sent to {match.display_name}. Chat will unlock once accepted.
                  </p>
                </div>
                <Link
                  href="/messages"
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-surface-main hover:bg-surface-border text-content-secondary hover:text-content-primary border border-surface-border transition-colors flex items-center gap-1.5"
                >
                  View in Inbox
                </Link>
              </div>
            ) : (
              <>
                <h3 className="text-xs font-bold text-content-primary uppercase tracking-wider flex items-center gap-2">
                  <Send className="w-3.5 h-3.5 text-brand-cyan" />
                  Request to be Twins (Like Instagram Connection)
                </h3>
                <p className="text-xs text-content-secondary">
                  Send a Twin Request to {match.display_name}. Once they accept your invitation, private direct messaging will unlock!
                </p>

                {connectStatus ? (
                  <div className="p-3 rounded-lg bg-status-success/10 border border-status-success/30 text-status-success text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>{connectStatus}</span>
                  </div>
                ) : (
                  <form onSubmit={handleSendConnection} className="flex flex-col sm:flex-row gap-2.5">
                    <input
                      type="text"
                      value={connectMessage}
                      onChange={(e) => setConnectMessage(e.target.value)}
                      placeholder={`Hi ${match.display_name}, let's connect as Doppel twins! Our likeness is ${match.similarity_score.toFixed(1)}%.`}
                      className="flex-1 px-3.5 py-2 rounded-lg bg-surface-main border border-surface-border text-xs text-content-primary focus:border-brand-cyan focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={isSending}
                      className="px-5 py-2 rounded-lg text-xs font-bold bg-brand-cyan text-black hover:bg-brand-cyanHover disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
                    >
                      <Send className="w-3 h-3" />
                      {isSending ? "Sending..." : "Send Twin Request"}
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        )}

        {/* Privacy & Moderation Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-surface-border text-xs text-content-muted">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBlock}
              className="flex items-center gap-1 text-content-muted hover:text-status-warning transition-colors"
            >
              <Ban className="w-3.5 h-3.5" />
              Block Participant
            </button>
            <button
              onClick={handleReport}
              className="flex items-center gap-1 text-content-muted hover:text-status-danger transition-colors"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Report Profile
            </button>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-content-muted">
            <Lock className="w-3 h-3" />
            <span>Encrypted 512-D Representation</span>
          </div>
        </div>
      </div>
    </div>
  );
}
