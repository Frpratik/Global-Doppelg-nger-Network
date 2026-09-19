"use client";

import Link from "next/link";
import { CheckCircle2, Search, ArrowRight, ShieldCheck, Cpu } from "lucide-react";

export default function EnrollSuccessPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-radial-gradient">
      <div className="max-w-md w-full glass-panel rounded-3xl p-8 border border-cyan-500/30 text-center relative shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20 animate-bounce">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
          Profile Enrolled!
        </h2>
        <p className="text-slate-300 text-sm mb-6 leading-relaxed">
          Your 512-dimensional facial embedding vector has been securely normalized and indexed in the Doppel matching repository.
        </p>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-left space-y-2 mb-8 text-xs">
          <div className="flex items-center justify-between text-slate-300">
            <span>Embedding Model:</span>
            <span className="font-mono text-cyan-400">ArcFace-ONNX (512-D)</span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span>Vector Index:</span>
            <span className="font-mono text-emerald-400">Normalized L2 Cosine</span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span>Discovery Status:</span>
            <span className="font-mono text-cyan-300">Active (Consenting)</span>
          </div>
        </div>

        <div className="space-y-3">
          <Link
            href="/discover"
            className="w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-[#00F0FF] to-[#00A8FF] text-black shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:opacity-95 transition-all flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4 text-black" />
            Find My Doppelgängers
            <ArrowRight className="w-4 h-4 text-black" />
          </Link>
          <Link
            href="/dashboard"
            className="w-full py-3 rounded-xl font-semibold text-xs text-slate-300 glass-panel hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2"
          >
            Go to User Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
