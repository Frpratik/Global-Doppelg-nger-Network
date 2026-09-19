"use client";

import React from "react";
import Link from "next/link";
import { RadarScanner } from "@/components/RadarScanner";
import { 
  Fingerprint, Search, ShieldCheck, ArrowRight, 
  Cpu, Lock, Zap, CheckCircle2, UserCheck, Shield 
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 flex flex-col items-center text-center">
        {/* Verification Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-elevated border border-surface-border text-brand-cyan text-xs font-medium mb-6">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-cyan" />
          <span>Consent-Based Facial Manifold Discovery • ArcFace 512-D</span>
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-content-primary max-w-4xl leading-[1.15]">
          What if your closest{" "}
          <span className="text-brand-cyan">visual twin</span>{" "}
          is already here?
        </h1>

        <p className="mt-5 text-sm sm:text-base text-content-secondary max-w-2xl leading-relaxed">
          Discover other enrolled participants whose facial appearance is mathematically similar to yours. Built with 512-dimensional ArcFace embeddings and strict privacy protection.
        </p>

        {/* Primary CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
          <Link
            href="/discover"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-xs font-semibold bg-brand-cyan text-black hover:bg-brand-cyanHover shadow-buttonPrimary transition-all"
          >
            <Search className="w-4 h-4 text-black" />
            Find My Matches
            <ArrowRight className="w-3.5 h-3.5 text-black" />
          </Link>
          <Link
            href="/how-it-works"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-xs font-medium text-content-secondary bg-surface-elevated hover:text-content-primary border border-surface-border hover:border-surface-borderHover transition-all"
          >
            How It Works
          </Link>
        </div>

        {/* Live Vector Preview Panel */}
        <div className="mt-14 w-full max-w-4xl">
          <div className="surface-card rounded-2xl p-6 sm:p-8 border border-surface-border">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Radar Column */}
              <div className="lg:col-span-6 flex flex-col items-center justify-center">
                <RadarScanner activeScanning={true} matchScore={94.2} />
                <div className="mt-3 text-[11px] font-mono text-content-muted flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan inline-block" />
                  <span>ANN Distance: d = 0.058 (94.2% match)</span>
                </div>
              </div>

              {/* Side-by-Side Card Comparison Preview */}
              <div className="lg:col-span-6 space-y-4 text-left">
                <span className="text-[10px] font-mono uppercase tracking-widest text-brand-cyan font-semibold">
                  Match Output Preview
                </span>
                <h2 className="text-xl font-bold text-content-primary">
                  Rank #1 Visual Proximity
                </h2>
                <p className="text-xs text-content-secondary leading-relaxed">
                  Deep embedding vectors mapped in 512-dimensional feature space demonstrate close correspondence in facial proportions and landmark symmetry.
                </p>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-xl bg-surface-elevated border border-surface-border text-center">
                    <img
                      src="https://api.dicebear.com/7.x/adventurer/svg?seed=elena_r&gender=female"
                      alt="Your Enrolled Portrait"
                      className="w-14 h-14 rounded-lg bg-surface-subtle border border-surface-border p-0.5 mx-auto mb-2"
                    />
                    <span className="text-xs font-semibold text-content-primary block">Your Photo</span>
                    <span className="text-[10px] text-content-muted font-mono">Query Vector</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-surface-elevated border border-brand-cyan/40 text-center">
                    <img
                      src="https://api.dicebear.com/7.x/adventurer/svg?seed=sophia_m&gender=female"
                      alt="Closest Match Portrait"
                      className="w-14 h-14 rounded-lg bg-surface-subtle border border-brand-cyan p-0.5 mx-auto mb-2"
                    />
                    <span className="text-xs font-semibold text-content-primary block">Sophia M.</span>
                    <span className="text-[10px] text-brand-cyan font-mono font-medium">94.2% Similarity</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-[11px] text-content-muted border-t border-surface-border">
                  <span>Location: Berlin (Consenting)</span>
                  <span className="text-status-success font-medium">Consenting Participant</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Engineering Foundations Section */}
      <section className="py-16 border-t border-surface-border bg-surface-subtle/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold font-mono tracking-wider text-brand-cyan uppercase">
              Core Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-content-primary mt-1.5">
              Deterministic Computer Vision & Vector Search
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-content-secondary leading-relaxed">
              Doppel executes structured computer vision, affine landmark alignment, and cosine vector distance across enrolled embeddings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="surface-card rounded-xl p-6 border border-surface-border">
              <div className="w-10 h-10 rounded-lg bg-surface-elevated border border-surface-border flex items-center justify-center text-brand-cyan mb-4">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-content-primary mb-1.5">512-D ArcFace Embeddings</h3>
              <p className="text-xs text-content-secondary leading-relaxed">
                Raw face images are normalized to 512 topological float coordinates capturing cranial structure and inter-ocular ratios.
              </p>
            </div>

            <div className="surface-card rounded-xl p-6 border border-surface-border">
              <div className="w-10 h-10 rounded-lg bg-surface-elevated border border-surface-border flex items-center justify-center text-brand-cyan mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-content-primary mb-1.5">Sub-3ms Cosine ANN Search</h3>
              <p className="text-xs text-content-secondary leading-relaxed">
                Approximate Nearest Neighbor search executes dot-product comparisons across tens of thousands of vectors with sub-3ms latency.
              </p>
            </div>

            <div className="surface-card rounded-xl p-6 border border-surface-border">
              <div className="w-10 h-10 rounded-lg bg-surface-elevated border border-surface-border flex items-center justify-center text-brand-cyan mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-content-primary mb-1.5">Dual Consent Architecture</h3>
              <p className="text-xs text-content-secondary leading-relaxed">
                Biometric processing consent is decoupled from discovery searchability. Pause discovery or delete embeddings anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ethical Commitment Banner */}
      <section className="py-14 border-t border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="surface-card rounded-2xl p-8 border border-surface-border flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-1.5 text-brand-cyan font-semibold text-xs uppercase tracking-wider">
                <Lock className="w-3.5 h-3.5" />
                <span>Zero Open-Web Scraping Guarantee</span>
              </div>
              <h3 className="text-xl font-bold text-content-primary">
                No surveillance. No scraping. Voluntary peer matching only.
              </h3>
              <p className="text-xs text-content-secondary leading-relaxed">
                Doppel is built exclusively for consenting discovery. We never harvest photos from social networks, identify strangers, or monetize biometric data.
              </p>
            </div>
            <Link
              href="/privacy"
              className="px-4 py-2.5 rounded-lg text-xs font-medium bg-surface-elevated hover:bg-surface-hover text-content-primary border border-surface-border whitespace-nowrap transition-colors"
            >
              Read Privacy Charter
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
