"use client";

import Link from "next/link";
import { RadarScanner } from "@/components/RadarScanner";
import { 
  Fingerprint, Search, ShieldCheck, Sparkles, ArrowRight, 
  Cpu, Lock, Zap, Eye, CheckCircle2, UserCheck, ShieldAlert 
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="relative overflow-hidden bg-radial-gradient">
      {/* Background cyber grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28 flex flex-col items-center text-center">
        {/* Status pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-8 backdrop-blur-md shadow-sm shadow-cyan-500/10">
          <Sparkles className="w-3.5 h-3.5 text-[#00F0FF]" />
          <span>Consent-Based Visual AI Network • ArcFace 512-D</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl leading-[1.1]">
          What if your closest{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00F0FF] via-cyan-200 to-[#A855F7] glow-cyan">
            visual twin
          </span>{" "}
          is already here?
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl font-normal leading-relaxed">
          Meet people who look remarkably like you — through privacy-first AI, deep geometric facial embeddings, and strictly consent-based matching.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link
            href="/discover"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl text-base font-bold bg-gradient-to-r from-[#00F0FF] to-[#00A8FF] text-black shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] transition-all duration-200"
          >
            <Search className="w-5 h-5 text-black" />
            Find My Doppel
            <ArrowRight className="w-4 h-4 text-black" />
          </Link>
          <Link
            href="/how-it-works"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl text-base font-semibold text-slate-300 glass-panel hover:bg-white/10 hover:text-white transition-all duration-200"
          >
            How It Works
          </Link>
        </div>

        {/* Radar & Visual Twin Card Showcase */}
        <div className="mt-16 w-full max-w-5xl">
          <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-cyan-500/20 relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Radar Simulation Column */}
              <div className="lg:col-span-6 flex flex-col items-center justify-center">
                <RadarScanner activeScanning={true} matchScore={94.2} />
                <div className="mt-4 text-xs font-mono text-cyan-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span>ANN Vector Distance: d = 0.058 (94.2% match)</span>
                </div>
              </div>

              {/* Side-by-Side Visual Twin Match Preview */}
              <div className="lg:col-span-6 space-y-4 text-left">
                <div className="inline-block px-3 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono uppercase tracking-widest font-semibold">
                  Live Match Demo
                </div>
                <h3 className="text-2xl font-bold text-white">
                  Rank #1 Visual Proximity
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Deep embedding vectors mapped in 512 dimensions demonstrate exceptional cranial aspect ratio and cheekbone symmetry correspondence.
                </p>

                {/* Profile Twin Card Comparison */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col items-center text-center">
                    <img
                      src="https://api.dicebear.com/7.x/adventurer/svg?seed=elena_r&gender=female"
                      alt="Your Photo"
                      className="w-16 h-16 rounded-full bg-slate-800 border-2 border-cyan-500 p-1 mb-2"
                    />
                    <span className="text-xs font-bold text-white">Your Profile</span>
                    <span className="text-[10px] text-cyan-400 font-mono">Enrolled Vector</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-purple-500/40 flex flex-col items-center text-center shadow-lg shadow-purple-500/10">
                    <img
                      src="https://api.dicebear.com/7.x/adventurer/svg?seed=sophia_m&gender=female"
                      alt="Visual Twin"
                      className="w-16 h-16 rounded-full bg-slate-800 border-2 border-purple-400 p-1 mb-2"
                    />
                    <span className="text-xs font-bold text-white">Sophia M.</span>
                    <span className="text-[10px] text-purple-400 font-mono">94.2% Similarity</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-white/5">
                  <span>Location: Berlin (Consenting)</span>
                  <span className="text-emerald-400 font-semibold">Verified Participant</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Intelligence Differentiator */}
      <section className="py-20 border-t border-white/10 bg-[#06090F]/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold tracking-widest text-[#00F0FF] uppercase mb-3">
              The Real Architecture
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white">
              Not a prompt wrapper. A true biometric vector pipeline.
            </p>
            <p className="mt-4 text-slate-400 text-sm leading-relaxed">
              We never pass images to generic LLMs for hallucinations. Doppel executes deterministic computer vision, landmark alignment, and cosine vector search.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="glass-panel glass-panel-hover rounded-2xl p-7 flex flex-col">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-5">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">512-D ArcFace Embeddings</h3>
              <p className="text-xs text-slate-400 leading-relaxed flex-1">
                Raw pixels are transformed into normalized 512-dimensional topological coordinates that encode inter-ocular distances and facial geometry.
              </p>
            </div>

            {/* Card 2 */}
            <div className="glass-panel glass-panel-hover rounded-2xl p-7 flex flex-col">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-5">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Sub-3ms Vector Search</h3>
              <p className="text-xs text-slate-400 leading-relaxed flex-1">
                Approximate Nearest Neighbor (ANN) index compares your vector against tens of thousands of consenting profiles with instant cosine similarity ranking.
              </p>
            </div>

            {/* Card 3 */}
            <div className="glass-panel glass-panel-hover rounded-2xl p-7 flex flex-col">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Dual Consent Architecture</h3>
              <p className="text-xs text-slate-400 leading-relaxed flex-1">
                Zero searchability without explicit opt-in. Turn off discovery anytime, or purge your biometric embedding irreversibly with a single click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Pledge Banner */}
      <section className="py-16 bg-slate-950 border-t border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-slate-900 via-[#0A0E18] to-slate-900 border border-cyan-500/30 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                <Lock className="w-4 h-4" />
                <span>Ethical Biometric Standard</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                No surveillance. No internet scraping. Ever.
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Doppel is built strictly for consenting discovery among participants. We never harvest photos from social networks, identify strangers, or monetize biometric data.
              </p>
            </div>
            <Link
              href="/privacy"
              className="px-6 py-3.5 rounded-xl font-semibold text-sm bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all whitespace-nowrap"
            >
              Read Privacy Architecture
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
