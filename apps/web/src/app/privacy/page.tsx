import { ShieldCheck, Lock, EyeOff, Trash2, CheckCircle2 } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-10">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-3">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Biometric Privacy Charter v1.2</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Privacy-First Biometric Architecture
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
          Face embeddings are sensitive biometric-derived representations. Doppel treats privacy as an immutable architectural invariant.
        </p>
      </div>

      <div className="space-y-6 text-xs sm:text-sm text-slate-300 leading-relaxed">
        <div className="glass-panel rounded-3xl p-8 border border-slate-800 space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-cyan-400" />
            1. Zero Open-Web Crawling & Scraping Guarantee
          </h2>
          <p>
            Doppel strictly does NOT search the public internet, crawl social media (Instagram, Facebook, LinkedIn), or attempt to identify unknown individuals. The vector index contains exclusively registered users who explicitly consented to participation.
          </p>
        </div>

        <div className="glass-panel rounded-3xl p-8 border border-slate-800 space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <EyeOff className="w-5 h-5 text-purple-400" />
            2. Dual Consent Decoupling
          </h2>
          <p>
            We separate <strong>Biometric Processing Consent</strong> (permission to calculate mathematical coordinates from your selfie) from <strong>Discovery Consent</strong> (permission to appear as a visual twin match to other users). You can maintain your enrolled biometric coordinates while pausing discovery at any time.
          </p>
        </div>

        <div className="glass-panel rounded-3xl p-8 border border-slate-800 space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-rose-400" />
            3. Irreversible Biometric & Account Deletion
          </h2>
          <p>
            When you request biometric profile deletion, your 512-dimensional vector is immediately and permanently purged from the active vector index (pgvector/memory/Qdrant) and associated DB profile records are deleted. Deleting your account cascades full removal of credentials and match histories.
          </p>
        </div>

        <div className="glass-panel rounded-3xl p-8 border border-slate-800 space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            4. Minimal Exposure & No Public Directories
          </h2>
          <p>
            There is no public directory of faces. Users cannot browse all registered participants or submit arbitrary photos of third parties to look them up. Results only expose what the matched participant explicitly chose to share (display name, approximate city, bio).
          </p>
        </div>
      </div>
    </div>
  );
}
