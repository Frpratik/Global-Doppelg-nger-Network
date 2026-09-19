import React from "react";

interface SimilarityMeterProps {
  similarityScore: number; // 0.0 - 100.0%
  rawDistance: number; // 1 - cos(theta)
}

export function SimilarityMeter({ similarityScore, rawDistance }: SimilarityMeterProps) {
  return (
    <div className="surface-elevated rounded-xl p-4 border border-surface-border space-y-3">
      <div className="flex items-center justify-between text-xs">
        <span className="text-content-secondary font-medium">Visual Similarity Score</span>
        <span className="font-mono font-bold text-brand-cyan text-sm">{similarityScore.toFixed(1)}%</span>
      </div>

      {/* Meter Bar */}
      <div className="w-full h-2 rounded-full bg-surface-subtle overflow-hidden border border-surface-border">
        <div
          className="h-full bg-gradient-to-r from-brand-cyan to-status-success rounded-full transition-all duration-500"
          style={{ width: `${Math.min(100, Math.max(0, similarityScore))}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-content-muted font-mono pt-1">
        <span>Cosine Distance: d = {rawDistance.toFixed(4)}</span>
        <span>Manifold: 512-D L2 Space</span>
      </div>
    </div>
  );
}
