import React from "react";
import Link from "next/link";
import { DoppelMatch } from "@/types/domain";
import { MapPin, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";

interface MatchCardProps {
  match: DoppelMatch;
}

export function MatchCard({ match }: MatchCardProps) {
  const isTopRank = match.ranking === 1;

  return (
    <article
      className={`surface-card surface-interactive rounded-xl p-5 flex flex-col justify-between relative overflow-hidden ${
        isTopRank ? "border-brand-cyan/40 shadow-panelHover" : "border-surface-border"
      }`}
    >
      {/* Top Meta Bar */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="relative">
            <img
              src={match.avatar || "https://api.dicebear.com/7.x/adventurer/svg?seed=twin"}
              alt={`${match.display_name}'s enrolled photo`}
              className="w-14 h-14 rounded-lg bg-surface-elevated border border-surface-border p-0.5 object-cover"
              loading="lazy"
            />
            {isTopRank && (
              <span className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded bg-brand-cyan text-black font-mono font-bold text-[10px]">
                #1
              </span>
            )}
          </div>

          <div className="text-right">
            <div className="flex items-center justify-end gap-1">
              <span className="text-xs font-mono font-semibold text-content-muted">Rank</span>
              <span className="text-xs font-mono font-bold text-content-primary">#{match.ranking}</span>
            </div>
            <div className="text-base font-mono font-extrabold text-brand-cyan mt-0.5">
              {match.similarity_score.toFixed(1)}%
            </div>
            <span className="text-[10px] text-content-muted font-mono block">Visual Similarity</span>
          </div>
        </div>

        {/* User Info */}
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-content-primary leading-tight flex items-center gap-1.5">
            {match.display_name}
          </h3>
          <p className="text-xs text-content-muted font-mono">@{match.username}</p>
        </div>

        {/* Location badge if shared */}
        {match.city_name && (
          <div className="mt-2.5 inline-flex items-center gap-1 text-[11px] text-content-secondary bg-surface-elevated px-2 py-0.5 rounded border border-surface-border">
            <MapPin className="w-3 h-3 text-brand-cyan flex-shrink-0" />
            <span>{match.city_name}</span>
          </div>
        )}

        {/* Bio */}
        <p className="text-xs text-content-secondary mt-3 line-clamp-2 leading-relaxed">
          {match.bio || "Consenting participant in the Doppel discovery network."}
        </p>
      </div>

      {/* Footer Action */}
      <div className="mt-5 pt-3.5 border-t border-surface-border/80 flex items-center justify-between">
        <span className="text-[11px] text-status-success font-medium flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Consenting Profile
        </span>

        <Link
          href={`/matches/${match.match_id}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-cyan hover:text-brand-cyanHover transition-colors"
        >
          Inspect Match
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </article>
  );
}
