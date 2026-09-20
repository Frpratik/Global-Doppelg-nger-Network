"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { AuthService } from "@/services/auth.service";
import { Fingerprint, Lock, Mail, User, ShieldCheck, ArrowRight, AlertCircle, Sparkles } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [biometricConsent, setBiometricConsent] = useState(true);
  const [discoveryConsent, setDiscoveryConsent] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!biometricConsent) {
      setError("Biometric consent is required to process facial embeddings on Doppel.");
      return;
    }

    setLoading(true);

    try {
      const res = await AuthService.register({
        display_name: displayName.trim(),
        username: username.toLowerCase().trim(),
        email: email.trim(),
        password,
        biometric_consent: biometricConsent,
        discovery_consent: discoveryConsent,
      });

      login(res);
      router.push("/enroll");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please verify your details and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full p-8 sm:p-10 rounded-3xl bg-surface-card border border-surface-border relative shadow-panel space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-4 text-cyan-400">
            <Fingerprint className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-content-primary tracking-tight">
            Create Your Doppel Profile
          </h1>
          <p className="text-xs sm:text-sm text-content-secondary mt-1.5">
            Join the consent-driven visual twin discovery network
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-status-danger/10 border border-status-danger/30 text-status-danger text-xs flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-status-danger flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-content-secondary mb-1.5">Full Name / Display Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-content-muted absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Elena Rostova"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-background border border-surface-border focus:border-cyan-500 focus:outline-none text-content-primary text-sm transition-colors placeholder-content-muted"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-content-secondary mb-1.5">Username</label>
            <div className="relative">
              <span className="text-content-muted text-sm font-mono absolute left-3.5 top-3.5">@</span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="elena_r"
                className="w-full pl-9 pr-4 py-3 rounded-xl bg-surface-background border border-surface-border focus:border-cyan-500 focus:outline-none text-content-primary text-sm transition-colors placeholder-content-muted font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-content-secondary mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-content-muted absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="elena@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-background border border-surface-border focus:border-cyan-500 focus:outline-none text-content-primary text-sm transition-colors placeholder-content-muted"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-content-secondary mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-content-muted absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-background border border-surface-border focus:border-cyan-500 focus:outline-none text-content-primary text-sm transition-colors placeholder-content-muted"
              />
            </div>
          </div>

          {/* Consent Checkboxes */}
          <div className="pt-3 pb-1 space-y-3 border-t border-surface-border">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={biometricConsent}
                onChange={(e) => setBiometricConsent(e.target.checked)}
                className="mt-0.5 rounded text-cyan-500 bg-surface-background border-surface-border cursor-pointer w-4 h-4 accent-cyan-500"
              />
              <span className="text-xs text-content-secondary leading-snug">
                I explicitly agree to the <strong>biometric transformation</strong> of my portrait photo into a 512-D mathematical vector.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={discoveryConsent}
                onChange={(e) => setDiscoveryConsent(e.target.checked)}
                className="mt-0.5 rounded text-cyan-500 bg-surface-background border-surface-border cursor-pointer w-4 h-4 accent-cyan-500"
              />
              <span className="text-xs text-content-secondary leading-snug">
                I agree to be discoverable as a <strong>visual twin</strong> to other enrolled participants on the network.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 py-3.5 rounded-xl font-bold bg-cyan-500 text-surface-background hover:bg-cyan-400 disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-sm shadow-md active:scale-95"
          >
            {loading ? "Creating Profile..." : "Create Account & Proceed to Enrollment"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-content-muted pt-2 border-t border-surface-border">
          Already have an account?{" "}
          <Link href="/login" className="text-cyan-400 hover:underline font-semibold ml-1">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
