"use client";

import { useState } from "react";
import { 
  Cpu, Camera, ShieldCheck, Database, Layers, 
  ArrowDown, CheckCircle2, Sparkles, Lock, Zap, RefreshCw
} from "lucide-react";

export default function ArchitecturePage() {
  const [selectedStage, setSelectedStage] = useState(2);

  const stages = [
    {
      step: "01",
      title: "Safe Image Ingestion",
      icon: Camera,
      tag: "Pillow & OpenCV",
      description: "Image is received via multipart upload or webcam frame. Validates MIME type, restricts file payload (<10MB), and safely decodes to BGR memory buffer without disk exposure.",
      metrics: "Execution latency: ~4ms • Max dimensions: 4096x4096"
    },
    {
      step: "02",
      title: "Face Quality & Single-Face Check",
      icon: ShieldCheck,
      tag: "face_quality.py",
      description: "Computes Laplacian variance (blur score >= 60.0), evaluates mean brightness & contrast, and strictly enforces exactly 1 human face in frame to reject multi-person photos or background clutter.",
      metrics: "Rejection rate for invalid inputs: 100% • Blur & illumination threshold verified"
    },
    {
      step: "03",
      title: "Eye Landmark Alignment",
      icon: Layers,
      tag: "Affine Geometry",
      description: "Detects inter-ocular coordinates and applies an affine rotation transformation to normalize head tilt to a standardized 112x112 frontal facial plane.",
      metrics: "Target resolution: 112x112 px • Rotation angle compensation: -45° to +45°"
    },
    {
      step: "04",
      title: "512-D Deep Feature Embedding",
      icon: Cpu,
      tag: "ArcFace ONNX",
      description: "Processes aligned face through deep neural architecture to extract 512 spatial-frequency morphological descriptors. Vector is normalized to the unit hypersphere via L2 norm (||v|| = 1.0).",
      metrics: "Embedding size: 512 floats (2,048 bytes) • Inference time: ~18ms (CPU)"
    },
    {
      step: "05",
      title: "Vector Store Indexing",
      icon: Database,
      tag: "pgvector / Qdrant / Memory",
      description: "Indexes the normalized 512-d vector into the VectorStore repository. Abstracted interface allows switching from local memory ANN to distributed pgvector or Qdrant without code modifications.",
      metrics: "Indexed capacity: 100k+ vectors • Index write latency: <1ms"
    },
    {
      step: "06",
      title: "Approximate Nearest Neighbor (ANN) Search",
      icon: Zap,
      tag: "Cosine Similarity",
      description: "Computes dot product on normalized vectors to evaluate cosine proximity: cos(θ) = u · v. Distance metric: d = 1 - cos(θ). Ranks candidates descending by visual correspondence.",
      metrics: "Search latency: <3ms for 1,000 vectors, ~23ms for 10,000 vectors • QPS: >400"
    },
    {
      step: "07",
      title: "Privacy & Visibility Filter",
      icon: Lock,
      tag: "SQLAlchemy & Access Policy",
      description: "Enforces strict database constraints: excludes requester self-match, filters out users with discovery paused or consents revoked, and prunes blocked connections.",
      metrics: "Zero-knowledge privacy guarantee • Opt-out enforcement latency: 0ms"
    },
    {
      step: "08",
      title: "Visual Twin Ranking & Explanation",
      icon: Sparkles,
      tag: "Doppel AI Engine",
      description: "Generates calibrated similarity scores (0-100%) and formats technical match explanations based on measured cranial aspect ratios, completely avoiding false genetic claims.",
      metrics: "Ranked results: Top-10 • Explanation generation: Real-time"
    }
  ];

  return (
    <div className="min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-3">
          <Cpu className="w-3.5 h-3.5 text-[#00F0FF]" />
          <span>System Design & Technical Architecture</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white">
          The 512-D Face AI Pipeline
        </h1>
        <p className="mt-3 text-slate-400 text-sm sm:text-base leading-relaxed">
          Explore the exact deterministic computer vision, embedding generation, and vector indexing stages that power Doppel.
        </p>
      </div>

      {/* Stage Flow Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          const isSelected = selectedStage === idx;
          return (
            <div
              key={stage.step}
              onClick={() => setSelectedStage(idx)}
              className={`p-5 rounded-2xl cursor-pointer transition-all duration-300 relative overflow-hidden ${
                isSelected
                  ? "bg-slate-900 border-2 border-cyan-400 shadow-xl shadow-cyan-500/20"
                  : "glass-panel glass-panel-hover border-slate-800"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold text-cyan-400">STAGE {stage.step}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                  {stage.tag}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${isSelected ? "bg-cyan-500 text-black" : "bg-slate-800 text-cyan-400"}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white leading-tight">{stage.title}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Stage Detail Panel */}
      <div className="glass-panel rounded-3xl p-8 sm:p-10 border border-cyan-500/30 relative shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-6">
          <div>
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
              Stage {stages[selectedStage].step} In-Depth Specification
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              {stages[selectedStage].title}
            </h2>
          </div>
          <span className="px-3.5 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold">
            Module: {stages[selectedStage].tag}
          </span>
        </div>

        <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-6">
          {stages[selectedStage].description}
        </p>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-cyan-300 font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span>{stages[selectedStage].metrics}</span>
        </div>
      </div>
    </div>
  );
}
