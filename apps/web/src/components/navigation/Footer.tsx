import React from "react";
import Link from "next/link";
import { Fingerprint, Lock, ShieldCheck, Cpu } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-surface-border bg-background pt-12 pb-8 text-content-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-surface-elevated border border-surface-border flex items-center justify-center">
                <Fingerprint className="w-4 h-4 text-brand-cyan" />
              </div>
              <span className="font-bold tracking-tight text-content-primary text-sm">DOPPEL</span>
            </div>
            <p className="text-xs leading-relaxed text-content-muted">
              Consent-based visual twin discovery platform. Connecting participants via normalized 512-d ArcFace manifold embeddings.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-status-success font-medium">
              <span className="w-2 h-2 rounded-full bg-status-success inline-block" />
              <span>Vector Engine Operational</span>
            </div>
          </div>

          {/* Discovery Col */}
          <div>
            <h4 className="text-xs font-semibold text-content-primary uppercase tracking-wider mb-3">Discovery</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/discover" className="hover:text-brand-cyan transition-colors">Find My Doppel</Link></li>
              <li><Link href="/enroll" className="hover:text-brand-cyan transition-colors">Enroll Profile</Link></li>
              <li><Link href="/matches" className="hover:text-brand-cyan transition-colors">Match Results</Link></li>
              <li><Link href="/how-it-works" className="hover:text-brand-cyan transition-colors">How It Works</Link></li>
              <li><Link href="/dashboard" className="hover:text-brand-cyan transition-colors">User Dashboard</Link></li>
            </ul>
          </div>

          {/* Technology Col */}
          <div>
            <h4 className="text-xs font-semibold text-content-primary uppercase tracking-wider mb-3">Trust & Architecture</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/privacy" className="hover:text-brand-cyan transition-colors">Biometric Privacy Charter</Link></li>
              <li><Link href="/security" className="hover:text-brand-cyan transition-colors">Security & Threat Model</Link></li>
              <li><Link href="/architecture" className="hover:text-brand-cyan transition-colors">512-D Pipeline</Link></li>
              <li><Link href="/help" className="hover:text-brand-cyan transition-colors">Doppel AI Assistant</Link></li>
              <li><Link href="/admin" className="hover:text-brand-cyan transition-colors">Admin Telemetry</Link></li>
            </ul>
          </div>

          {/* Ethical Commitment */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-content-primary uppercase tracking-wider mb-2">Our Standard</h4>
            <div className="p-3.5 rounded-lg bg-surface-elevated border border-surface-border text-xs leading-relaxed text-content-secondary">
              <div className="flex items-center gap-1.5 text-brand-cyan font-semibold mb-1">
                <Lock className="w-3.5 h-3.5" />
                <span>Zero Open-Web Scraping</span>
              </div>
              Doppel only compares participants who voluntarily enrolled. We never scrape social media or perform surveillance.
            </div>
          </div>
        </div>

        <div className="border-t border-surface-border/60 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-content-muted gap-4">
          <p>© {new Date().getFullYear()} DOPPEL Network. All biometric processing consent protected.</p>
          <div className="flex items-center gap-4 font-mono">
            <span>ArcFace 512-D</span>
            <span>•</span>
            <span>pgvector / Qdrant</span>
            <span>•</span>
            <span>FastAPI + Next.js</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
