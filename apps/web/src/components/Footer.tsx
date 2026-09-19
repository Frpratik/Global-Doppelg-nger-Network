import Link from "next/link";
import { Fingerprint, Shield, Cpu, Lock, Github, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#06090F] pt-12 pb-8 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand & Mission */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#00F0FF] to-[#8A2BE2] p-0.5">
                <div className="w-full h-full bg-[#06090F] rounded-[6px] flex items-center justify-center">
                  <Fingerprint className="w-4 h-4 text-[#00F0FF]" />
                </div>
              </div>
              <span className="font-bold tracking-wider text-white text-lg">DOPPEL</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              Consent-based AI doppelgänger discovery network. Finding visual twins through ethical, zero-scraping biometric vector embeddings.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Vector Engine Operational</span>
            </div>
          </div>

          {/* Col 2: Product & Experience */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/discover" className="hover:text-[#00F0FF] transition-colors">Find My Doppel</Link></li>
              <li><Link href="/enroll" className="hover:text-[#00F0FF] transition-colors">Enroll Selfie</Link></li>
              <li><Link href="/matches" className="hover:text-[#00F0FF] transition-colors">Match Results</Link></li>
              <li><Link href="/how-it-works" className="hover:text-[#00F0FF] transition-colors">How It Works</Link></li>
              <li><Link href="/dashboard" className="hover:text-[#00F0FF] transition-colors">User Dashboard</Link></li>
            </ul>
          </div>

          {/* Col 3: Architecture & Privacy */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Trust & Tech</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/privacy" className="hover:text-[#00F0FF] transition-colors">Privacy Architecture</Link></li>
              <li><Link href="/security" className="hover:text-[#00F0FF] transition-colors">Security & Threat Model</Link></li>
              <li><Link href="/architecture" className="hover:text-[#00F0FF] transition-colors">512-D Pipeline</Link></li>
              <li><Link href="/help" className="hover:text-[#00F0FF] transition-colors">Doppel AI Assistant</Link></li>
              <li><Link href="/admin" className="hover:text-[#00F0FF] transition-colors">Admin Telemetry</Link></li>
            </ul>
          </div>

          {/* Col 4: Zero-Scraping Guarantee */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-2">Our Pledge</h4>
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] leading-relaxed text-slate-300">
              <div className="flex items-center gap-1.5 text-cyan-400 font-semibold mb-1">
                <Lock className="w-3.5 h-3.5" />
                <span>Zero Open-Web Scraping</span>
              </div>
              Doppel only compares you with enrolled participants who explicitly consented to discovery. We never index external photos or social media.
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} DOPPEL AI Inc. All biometric processing consent protected.</p>
          <div className="flex items-center gap-6">
            <span>ArcFace 512-D ONNX</span>
            <span>pgvector / Qdrant</span>
            <span>FastAPI + Next.js</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
