import React from "react";

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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
      {/* User Profile */}
      <div className="surface-card rounded-xl p-5 border border-surface-border flex flex-col items-center text-center">
        <div className="relative mb-3">
          <img
            src={userAvatar || "https://api.dicebear.com/7.x/adventurer/svg?seed=user"}
            alt={`${userDisplayName}'s profile`}
            className="w-24 h-24 rounded-xl bg-surface-elevated border-2 border-brand-cyan/60 p-1 object-cover"
          />
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-brand-cyan text-black font-mono font-bold text-[9px] uppercase tracking-wider">
            You
          </span>
        </div>
        <h4 className="text-sm font-bold text-content-primary mt-1">{userDisplayName}</h4>
        <p className="text-xs text-content-muted font-mono">@{userUsername}</p>
        <span className="text-[11px] text-content-secondary mt-2">Enrolled Query Vector</span>
      </div>

      {/* Visual Twin Match */}
      <div className="surface-card rounded-xl p-5 border border-brand-cyan/40 flex flex-col items-center text-center">
        <div className="relative mb-3">
          <img
            src={matchAvatar || "https://api.dicebear.com/7.x/adventurer/svg?seed=match"}
            alt={`${matchDisplayName}'s profile`}
            className="w-24 h-24 rounded-xl bg-surface-elevated border-2 border-brand-cyan p-1 object-cover"
          />
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-status-success text-black font-mono font-bold text-[9px] uppercase tracking-wider">
            {similarityScore.toFixed(1)}% Match
          </span>
        </div>
        <h4 className="text-sm font-bold text-content-primary mt-1">{matchDisplayName}</h4>
        <p className="text-xs text-content-muted font-mono">@{matchUsername}</p>
        <span className="text-[11px] text-status-success font-medium mt-2">Closest Algorithmic Twin</span>
      </div>
    </div>
  );
}
