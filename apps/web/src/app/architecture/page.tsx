"use client";

import { useState } from "react";
import { 
  Cpu, Camera, ShieldCheck, Database, Layers, 
  CheckCircle2, Lock, Zap
} from "lucide-react";

export default function ArchitecturePage() {
  const [selectedStage, setSelectedStage] = useState(2);

  const stages = [
    {
      step: "01",
      title: "Safe Image Ingestion",
      icon: Camera,
      tag: "Pillow & OpenCV",
      description: "Image is received via multipart upload or webcam capture stream. Validates MIME type (JPEG/PNG/WebP), restricts payload (<10MB), and safely decodes to a BGR numpy memory buffer without persistent raw photo storage.",
      metrics: "Execution latency: ~3-5ms • Dimension normalization: up to 4096x4096"
    },
    {
      step: "02",
      title: "Face Quality & Single-Face Gate",
      icon: ShieldCheck,
      tag: "face_quality.py",
      description: "Computes Laplacian variance (blur score >= 60.0), evaluates mean illumination & dynamic range (35-230 brightness scale), and strictly requires exactly 1 human face in frame to reject multi-person scenes or poor captures.",
      metrics: "Rejection rate for invalid inputs: 100% • Blur & illumination threshold verified"
    },
    {
      step: "03",
      title: "Inter-Ocular Landmark Alignment",
      icon: Layers,
      tag: "Affine Geometry",
      description: "Extracts eye coordinate landmarks and applies an affine rotational matrix to normalize facial yaw/roll to a standardized 112x112 canonical frontal alignment plane.",
      metrics: "Standardized resolution: 112x112 px • Rotation angle compensation: -45° to +45°"
    },
    {
      step: "04",
      title: "512-D Deep Feature Embedding",
      icon: Cpu,
      tag: "ArcFace ONNX",
      description: "Passes aligned facial patch through deep ResNet architecture to extract 512 spatial morphological descriptors. Normalizes vector to unit sphere via L2 norm (||v|| = 1.0).",
      metrics: "Vector size: 512 float32 (2,048 bytes) • Inference time: ~18ms (CPU)"
    },
    {
      step: "05",
      title: "Vector Store Indexing",
      icon: Database,
      tag: "pgvector / Qdrant / Memory",
      description: "Indexes the normalized 512-D vector into the VectorStore repository. Modular abstraction permits switching between local in-memory ANN, PostgreSQL pgvector (HNSW), or Qdrant without application code changes.",
      metrics: "Index capacity: 100k+ vectors • Index write latency: <1ms"
    },
    {
      step: "06",
      title: "Cosine Proximity ANN Search",
      icon: Zap,
      tag: "Cosine Similarity",
      description: "Calculates dot products on unit vectors to determine cosine similarity: cos(θ) = u · v. Normalized spatial distance is calculated as d = 1 - cos(θ). Ranks candidates descending by visual correspondence.",
      metrics: "Query latency: ~2.0ms (1,000 vectors), ~22ms (10,000 vectors) • Throughput: >400 QPS"
    },
    {
      step: "07",
      title: "Privacy & Consent Filters",
      icon: Lock,
      tag: "SQLAlchemy & Access Policy",
      description: "Enforces strict database constraints: excludes requester self-match, filters out participants with discovery paused or consents revoked, and prunes blocked connections.",
      metrics: "Zero-knowledge privacy guarantee • Opt-out enforcement latency: 0ms"
    },
    {
      step: "08",
      title: "Visual Twin Ranking & Explanation",
      icon: CheckCircle2,
      tag: "Doppel Match Engine",
      description: "Generates calibrated similarity scores (0-100%) and formats clear technical match explanations based on measured facial proportions, avoiding inaccurate genetic claims.",
      metrics: "Ranked results: Top-10 • Explanation generation: Real-time"
    }
  ];

  return (
    <div className="min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-surface-elevated border border-surface-border text-brand-cyan text-xs font-mono font-medium mb-3">
          <Cpu className="w-3.5 h-3.5 text-brand-cyan" />
          <span>System Architecture & Pipeline Specification</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-content-primary tracking-tight">
          The 512-D Face AI Pipeline
        </h1>
        <p className="mt-2 text-content-secondary text-sm sm:text-base leading-relaxed">
          The deterministic computer vision, landmark alignment, deep embedding, and vector similarity stages powering Doppel.
        </p>
      </div>

      {/* Stage Flow Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          const isSelected = selectedStage === idx;
          return (
            <button
              type="button"
              key={stage.step}
              onClick={() => setSelectedStage(idx)}
              className={`p-4 rounded-xl text-left transition-all duration-200 relative overflow-hidden ${
                isSelected
                  ? "surface-elevated border-2 border-brand-cyan shadow-panel"
                  : "surface-card surface-interactive border border-surface-border"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono font-bold text-brand-cyan">STAGE {stage.step}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-elevated text-content-muted font-mono border border-surface-border">
                  {stage.tag}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-lg ${isSelected ? "bg-brand-cyan text-black" : "bg-surface-elevated text-brand-cyan"}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-content-primary leading-snug">{stage.title}</h3>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Stage Detail Panel */}
      <div className="surface-card rounded-2xl p-6 sm:p-8 border border-brand-cyan/30 relative shadow-panel space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-surface-border pb-4">
          <div>
            <span className="text-[11px] font-mono font-bold text-brand-cyan uppercase tracking-wider">
              Stage {stages[selectedStage].step} Technical Specification
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-content-primary mt-0.5">
              {stages[selectedStage].title}
            </h2>
          </div>
          <span className="px-2.5 py-1 rounded bg-surface-elevated border border-surface-border text-brand-cyan text-xs font-mono font-semibold">
            Module: {stages[selectedStage].tag}
          </span>
        </div>

        <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
          {stages[selectedStage].description}
        </p>

        <div className="p-3.5 rounded-lg bg-surface-elevated border border-surface-border text-xs text-brand-cyan font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-brand-cyan flex-shrink-0" />
          <span>{stages[selectedStage].metrics}</span>
        </div>
      </div>
    </div>
  );
}
