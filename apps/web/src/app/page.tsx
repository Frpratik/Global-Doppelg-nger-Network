"use client";

import React from "react";
import Link from "next/link";
import { RadarScanner } from "@/components/RadarScanner";
import { 
  Fingerprint, Search, ShieldCheck, ArrowRight, 
  Cpu, Lock, Zap, CheckCircle2, UserCheck, Shield,
  Sparkles, Compass, Users, MessageSquare
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-16 sm:space-y-24">
      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-12 flex flex-col items-center text-center">
        {/* Verification Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-6">
          <ShieldCheck className="w-4 h-4" />
          <span>Consent-Based Facial Discovery • 512-D ArcFace Manifold</span>
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-content-primary max-w-5xl leading-[1.12]">
          Discover your closest <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-300">visual twin</span> across the globe.
        </h1>

        <p className="mt-6 text-base sm:text-lg text-content-secondary max-w-2xl leading-relaxed">
          Voluntary, privacy-first peer discovery. We map facial geometry into 512-dimensional vector space to find people who share your uncanny likeness.
        </p>

        {/* Primary CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link
            href="/discover"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl text-sm font-bold bg-cyan-500 text-surface-background hover:bg-cyan-400 transition-all shadow-md active:scale-95"
          >
            <Compass className="w-4 h-4" />
            Launch Doppel Discovery
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/enroll"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-content-primary bg-surface-card hover:bg-surface-elevated border border-surface-border transition-all"
          >
            Enroll Your Profile
          </Link>
        </div>

        {/* Live Vector Preview Panel */}
        <div className="mt-14 sm:mt-18 w-full max-w-5xl">
          <div className="p-6 sm:p-10 rounded-3xl bg-surface-card border border-surface-border shadow-panel relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Radar Column */}
              <div className="lg:col-span-6 flex flex-col items-center justify-center">
                <RadarScanner activeScanning={true} matchScore={94.2} />
                <div className="mt-4 text-xs font-mono text-content-muted flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                  <span>Cosine Distance: d = 0.058 (94.2% match)</span>
                </div>
              </div>

              {/* Side-by-Side Card Comparison Preview */}
              <div className="lg:col-span-6 space-y-4 text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  Live Discovery Result
                </div>
                <h2 className="text-2xl font-extrabold text-content-primary">
                  Rank #1 Visual Proximity
                </h2>
                <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
                  Normalized embeddings plotted in 512-dimensional feature space demonstrate close correspondence in cranial proportions, jawline slope, and ocular distance.
                </p>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-4 rounded-2xl bg-surface-background border border-surface-border text-center">
                    <img
                      src="https://api.dicebear.com/7.x/adventurer/svg?seed=elena_r&gender=female"
                      alt="Your Enrolled Portrait"
                      className="w-16 h-16 rounded-xl bg-surface-card border border-surface-border p-1 mx-auto mb-2"
                    />
                    <span className="text-xs font-bold text-content-primary block">Your Portrait</span>
                    <span className="text-[11px] text-content-muted font-mono">Query Vector</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-surface-background border border-cyan-500/40 text-center shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                    <img
                      src="https://api.dicebear.com/7.x/adventurer/svg?seed=sophia_m&gender=female"
                      alt="Closest Match Portrait"
                      className="w-16 h-16 rounded-xl bg-surface-card border-2 border-cyan-400 p-1 mx-auto mb-2"
                    />
                    <span className="text-xs font-bold text-content-primary block">Sophia M.</span>
                    <span className="text-[11px] text-cyan-400 font-mono font-bold">94.2% Likeness</span>
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-between text-xs text-content-muted border-t border-surface-border">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Consenting Participant
                  </span>
                  <span>Active on Network</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Highlights */}
      <section className="py-12 border-t border-surface-border bg-surface-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
              Deterministic Discovery
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-content-primary">
              Built for Safety, Privacy & Connection
            </h2>
            <p className="text-sm text-content-secondary">
              A clean consumer social experience where you control your identity at every step.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-surface-card border border-surface-border space-y-3 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-content-primary">512-D ArcFace Vectors</h3>
              <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
                Raw face photos are reduced to normalized topological coordinates. The original image cannot be reconstructed from vector weights.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-surface-card border border-surface-border space-y-3 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-content-primary">Consenting Peer Discovery</h3>
              <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
                Only verified accounts who voluntarily opted into the network appear in searches. Zero web crawling or unapproved indexing.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-surface-card border border-surface-border space-y-3 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-content-primary">Twin Direct Messaging</h3>
              <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
                Send a personalized twin connection request to mutual matches and initiate private, encrypted peer chats.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ethical Commitment Banner */}
      <section className="pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-3xl bg-surface-card border border-surface-border flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
              <Lock className="w-4 h-4" />
              <span>Zero Surveillance Guarantee</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-content-primary">
              No surveillance. No scraping. Voluntary peer matching only.
            </h3>
            <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
              Doppel is built exclusively for consenting discovery. We never harvest photos from social networks, identify strangers, or monetize biometric data.
            </p>
          </div>
          <Link
            href="/settings"
            className="px-6 py-3 rounded-xl text-xs font-bold bg-surface-background hover:bg-surface-elevated text-content-primary border border-surface-border whitespace-nowrap transition-colors shadow-sm"
          >
            Review Biometric Charter
          </Link>
        </div>
      </section>
    </div>
  );
}
