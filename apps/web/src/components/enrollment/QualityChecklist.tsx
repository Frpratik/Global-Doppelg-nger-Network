import React from "react";
import { QualityAssessment } from "@/types/domain";
import { CheckCircle2, AlertCircle, AlertTriangle, ShieldCheck, RefreshCw } from "lucide-react";

interface QualityChecklistProps {
  assessment: QualityAssessment | null;
  loading: boolean;
}

export function QualityChecklist({ assessment, loading }: QualityChecklistProps) {
  if (loading) {
    return (
      <div className="surface-card rounded-xl p-6 border border-surface-border text-center py-10">
        <RefreshCw className="w-6 h-6 text-brand-cyan animate-spin mx-auto mb-2" />
        <p className="text-xs text-content-secondary font-mono">Running face quality and alignment diagnostics...</p>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="surface-card rounded-xl p-6 border border-surface-border text-center py-8">
        <ShieldCheck className="w-8 h-8 text-content-muted mx-auto mb-2 opacity-60" />
        <h4 className="text-xs font-semibold text-content-primary">Quality Diagnostics Ready</h4>
        <p className="text-[11px] text-content-muted mt-1 max-w-xs mx-auto">
          Capture or upload your selfie to evaluate sharpness, lighting uniformity, and single-face verification.
        </p>
      </div>
    );
  }

  const isAcceptable = assessment.acceptable;

  return (
    <div className="surface-card rounded-xl p-5 border border-surface-border space-y-4">
      <div className="flex items-center justify-between border-b border-surface-border pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-brand-cyan" />
          <h4 className="text-xs font-semibold text-content-primary uppercase tracking-wider">Quality Assessment</h4>
        </div>
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
            isAcceptable
              ? "bg-status-successBg text-status-success border border-status-success/30"
              : "bg-status-dangerBg text-status-danger border border-status-danger/30"
          }`}
        >
          {isAcceptable ? "Passed" : "Action Required"}
        </span>
      </div>

      {/* Composite Quality Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-content-secondary font-medium">Composite Quality Score</span>
          <span className="font-mono font-bold text-brand-cyan">
            {Math.round(assessment.quality_score * 100)}%
          </span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-surface-subtle overflow-hidden border border-surface-border">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isAcceptable ? "bg-status-success" : "bg-status-danger"
            }`}
            style={{ width: `${assessment.quality_score * 100}%` }}
          />
        </div>
      </div>

      {/* Individual Rules Checklist */}
      <ul className="space-y-2 text-xs">
        <li className="flex items-center justify-between p-2.5 rounded-lg bg-surface-elevated border border-surface-border">
          <span className="text-content-secondary">Single Face Verification</span>
          {assessment.face_count === 1 ? (
            <span className="text-status-success font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Exactly 1 face
            </span>
          ) : (
            <span className="text-status-danger font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> {assessment.face_count} faces detected
            </span>
          )}
        </li>

        <li className="flex items-center justify-between p-2.5 rounded-lg bg-surface-elevated border border-surface-border">
          <span className="text-content-secondary">Sharpness (Laplacian Var)</span>
          <span className="font-mono text-content-primary">
            {assessment.blur_score.toFixed(1)} / 60.0 min
          </span>
        </li>

        <li className="flex items-center justify-between p-2.5 rounded-lg bg-surface-elevated border border-surface-border">
          <span className="text-content-secondary">Lighting & Contrast</span>
          <span className="font-mono text-content-primary">
            {assessment.brightness_score.toFixed(1)} (Balanced)
          </span>
        </li>
      </ul>

      {/* Warnings */}
      {assessment.warnings.length > 0 && (
        <div className="p-3 rounded-lg bg-status-warningBg border border-status-warning/30 text-status-warning text-xs space-y-1">
          {assessment.warnings.map((warning, index) => (
            <div key={index} className="flex items-start gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>{warning}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
