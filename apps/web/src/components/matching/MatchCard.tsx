import React from "react";
import Link from "next/link";
import { DoppelMatch } from "@/types/domain";
import { MapPin, ArrowRight, ShieldCheck, CheckCircle2, MessageSquare, Sparkles } from "lucide-react";

interface MatchCardProps {
  match: DoppelMatch;
  onConnectClick?: (match: DoppelMatch) => void;
}

export function MatchCard({ match, onConnectClick }: MatchCardProps) {
  const isTopRank = match.ranking === 1;
  const likeness = match.similarity_score;

  return (
    <article
      className={`surface-card surface-interactive rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden transition-all duration-300 ${
        isTopRank
          ? "border-brand-cyan/50 shadow-[0_0_24px_rgba(0,216,230,0.12)] bg-gradient-to-b from-brand-cyan/[0.04] to-surface"
          : "border-surface-border hover:border-surface-borderHover"
      }`}
    >
      {/* Top Meta & Portrait */}
      <div>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="relative">
            <img
              src={match.avatar || "https://api.dicebear.com/7.x/adventurer/svg?seed=" + match.username}
              alt={`${match.display_name}'s enrolled portrait`}
              className="w-16 h-16 rounded-xl bg-surface-elevated border-2 border-surface-border p-1 object-cover shadow-sm"
              loading="lazy"
            />
            {isTopRank && (
              <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-brand-cyan text-black font-mono font-extrabold text-[10px] shadow-sm flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5" /> #1 Twin
              </span>
            )}
          </div>

          <div className="text-right">
            <div className="flex items-center justify-end gap-1.5">
              <span className="text-xs font-mono text-content-muted">Rank</span>
              <span className="text-xs font-mono font-bold text-content-primary">#{match.ranking}</span>
            </div>
            <div className="text-xl font-mono font-black text-brand-cyan mt-0.5 tracking-tight">
              {likeness.toFixed(1)}%
            </div>
            <span className="text-[10px] text-content-muted font-mono uppercase tracking-wider block">
              Likeness
            </span>
          </div>
        </div>

        {/* Proximity Progress Indicator */}
        <div className="w-full bg-surface-subtle h-1.5 rounded-full overflow-hidden mb-4 border border-surface-border/40">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-indigo via-brand-cyan to-brand-cyan"
            style={{ width: `${Math.min(100, Math.max(10, likeness))}%` }}
          />
        </div>

        {/* User Identity */}
        <div className="space-y-1">
          <h3 className="text-base font-bold text-content-primary leading-tight hover:text-brand-cyan transition-colors">
            <Link href={`/matches/${match.match_id}`}>{match.display_name}</Link>
          </h3>
          <p className="text-xs text-content-muted font-mono">@{match.username}</p>
        </div>

        {/* Location pill if voluntarily shared */}
        {match.city_name && (
          <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-content-secondary bg-surface-elevated px-2.5 py-1 rounded-lg border border-surface-border">
            <MapPin className="w-3 h-3 text-brand-cyan flex-shrink-0" />
            <span>{match.city_name}</span>
          </div>
        )}

        {/* Bio */}
        <p className="text-xs text-content-secondary mt-3.5 line-clamp-2 leading-relaxed">
          {match.bio || "Consenting participant enrolled in the Doppel visual twin network."}
        </p>
      </div>

      {/* Footer Actions */}
      <div className="mt-6 pt-4 border-t border-surface-border/70 flex items-center justify-between gap-2">
        <div className="text-[11px] text-status-success font-medium flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="hidden xs:inline">Consenting</span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/matches/${match.match_id}`}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-brand-cyan text-black hover:bg-brand-cyanHover transition-all flex items-center gap-1.5 shadow-sm"
          >
            <span>Inspect</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </article>
  );
}
