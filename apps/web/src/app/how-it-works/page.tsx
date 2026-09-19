import Link from "next/link";
import { UserCheck, Camera, Search, Fingerprint, Lock, ArrowRight, ShieldCheck } from "lucide-react";

export default function HowItWorksPage() {
  const steps = [
    {
      num: "01",
      title: "Explicit Consent & Account Creation",
      desc: "Create your account and voluntarily consent to biometric feature extraction and participant discovery. Without consent, your image is never processed.",
      icon: UserCheck
    },
    {
      num: "02",
      title: "Live Quality Verification & Landmark Alignment",
      desc: "Capture a portrait via webcam or upload. Our automated engine validates single-face presence, sharpness, and aligns facial landmarks to a standard 112x112 frontal matrix.",
      icon: Camera
    },
    {
      num: "03",
      title: "512-D Normalized Vector Encoding",
      desc: "Deep ArcFace model maps your facial morphology into a unit hypersphere embedding vector (512 float coordinates) and securely stores it in the index.",
      icon: Fingerprint
    },
    {
      num: "04",
      title: "Consent-Protected Vector Matching",
      desc: "When you launch a search, Approximate Nearest Neighbor (ANN) cosine distance scans all other consenting enrolled participants, excluding non-consenting and blocked accounts.",
      icon: Search
    },
    {
      num: "05",
      title: "Granular Privacy & Instant Purge",
      desc: "View your closest visual twins, toggle your discovery status off whenever desired, or irreversibly purge your biometric profile in 1 click.",
      icon: Lock
    }
  ];

  return (
    <div className="min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white">How Doppel Works</h1>
        <p className="mt-3 text-slate-400 text-sm sm:text-base leading-relaxed">
          A transparent, step-by-step walkthrough of our consent-based visual matching pipeline.
        </p>
      </div>

      <div className="space-y-6">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div key={step.num} className="glass-panel rounded-3xl p-8 border border-slate-800 flex flex-col sm:flex-row items-start gap-6">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-[#00F0FF] font-mono font-bold text-xl flex-shrink-0">
                {step.num}
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-lg font-bold text-white">{step.title}</h3>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center pt-6">
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-sm font-bold bg-gradient-to-r from-[#00F0FF] to-[#00A8FF] text-black shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all"
        >
          Enroll and Find Your Visual Twin
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
