import React from "react";
import { Sparkles, Fingerprint, ShieldCheck } from "lucide-react";

interface ComparisonViewerProps {
  userAvatar?: string;
  userDisplayName: string;
  userUsername: string;
  matchAvatar?: string;
  matchDisplayName: string;
  matchUsername: string;
  similarityScore: number;
}

export function ComparisonViewer({
  userAvatar,
  userDisplayName,
  userUsername,
  matchAvatar,
  matchDisplayName,
  matchUsername,
  similarityScore,
}: ComparisonViewerProps) {
  return (
    <div className="surface-card rounded-2xl p-6 sm:p-8 border border-surface-border relative overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* User Portrait */}
        <div className="md:col-span-5 flex flex-col items-center text-center p-5 rounded-2xl bg-surface-elevated/70 border border-surface-border">
          <div className="relative mb-4">
            <img
              src={userAvatar || "https://api.dicebear.com/7.x/adventurer/svg?seed=user"}
              alt={`${userDisplayName}'s portrait`}
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-surface-subtle border-2 border-brand-cyan/60 p-1 object-cover shadow-panel"
            />
            <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-surface-main border border-brand-cyan/60 text-brand-cyan font-mono font-bold text-[10px] uppercase tracking-wider shadow-sm">
              Your Portrait
            </span>
          </div>
          <h4 className="text-base font-bold text-content-primary mt-1">{userDisplayName}</h4>
          <p className="text-xs text-content-muted font-mono">@{userUsername}</p>
          <div className="mt-3 text-[11px] font-mono text-content-secondary px-3 py-1 rounded-md bg-surface-main border border-surface-border/60">
            512-D Query Vector
          </div>
        </div>

        {/* Central Metric Bridge */}
        <div className="md:col-span-2 flex flex-col items-center justify-center text-center py-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-cyan/15 border border-brand-cyan/40 flex items-center justify-center text-brand-cyan shadow-glowCyan mb-2">
            <Fingerprint className="w-6 h-6 text-brand-cyan" />
          </div>
          <span className="text-2xl font-mono font-black text-brand-cyan tracking-tight">
            {similarityScore.toFixed(1)}%
          </span>
          <span className="text-[10px] text-content-muted font-mono uppercase tracking-widest mt-0.5">
            Cosine ANN
          </span>
          <div className="w-full max-w-[100px] h-0.5 bg-gradient-to-r from-transparent via-brand-cyan/40 to-transparent my-2" />
        </div>

        {/* Visual Twin Match Portrait */}
        <div className="md:col-span-5 flex flex-col items-center text-center p-5 rounded-2xl bg-surface-elevated/70 border border-brand-cyan/40">
          <div className="relative mb-4">
            <img
              src={matchAvatar || "https://api.dicebear.com/7.x/adventurer/svg?seed=" + matchUsername}
              alt={`${matchDisplayName}'s portrait`}
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-surface-subtle border-2 border-brand-cyan p-1 object-cover shadow-panel"
            />
            <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-brand-cyan text-black font-mono font-extrabold text-[10px] uppercase tracking-wider shadow-sm flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" /> Doppel Match
            </span>
          </div>
          <h4 className="text-base font-bold text-content-primary mt-1">{matchDisplayName}</h4>
          <p className="text-xs text-content-muted font-mono">@{matchUsername}</p>
          <div className="mt-3 text-[11px] font-mono text-status-success px-3 py-1 rounded-md bg-surface-main border border-status-success/30">
            Consenting Visual Twin
          </div>
        </div>
      </div>
    </div>
  );
}
