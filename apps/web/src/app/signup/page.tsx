"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { AuthService } from "@/services/auth.service";
import { Fingerprint, Lock, Mail, User, ShieldCheck, ArrowRight, AlertCircle } from "lucide-react";

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
      <div className="max-w-md w-full surface-card rounded-2xl p-8 border border-surface-border relative shadow-panel">
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-surface-elevated border border-surface-border flex items-center justify-center mx-auto mb-3">
            <Fingerprint className="w-5 h-5 text-brand-cyan" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-content-primary">
            Create Your Doppel Profile
          </h2>
          <p className="text-xs text-content-secondary mt-1">
            Join the consent-driven visual twin discovery network
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-lg bg-status-danger/10 border border-status-danger/30 text-status-danger text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-status-danger flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-content-secondary mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-content-muted absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Elena Rostova"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-surface-elevated border border-surface-border focus:border-brand-cyan focus:outline-none text-content-primary text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-content-secondary mb-1">Username</label>
            <div className="relative">
              <span className="text-content-muted text-xs absolute left-3.5 top-2.5">@</span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="elena_r"
                className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-surface-elevated border border-surface-border focus:border-brand-cyan focus:outline-none text-content-primary text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-content-secondary mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-content-muted absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="elena@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-surface-elevated border border-surface-border focus:border-brand-cyan focus:outline-none text-content-primary text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-content-secondary mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-content-muted absolute left-3.5 top-3" />
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-surface-elevated border border-surface-border focus:border-brand-cyan focus:outline-none text-content-primary text-xs"
              />
            </div>
          </div>

          {/* Consent Checkboxes */}
          <div className="pt-2 space-y-3 border-t border-surface-border">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={biometricConsent}
                onChange={(e) => setBiometricConsent(e.target.checked)}
                className="mt-0.5 rounded text-brand-cyan bg-surface-elevated border-surface-border cursor-pointer"
              />
              <span className="text-[11px] text-content-secondary leading-snug">
                I agree to the <strong>biometric conversion</strong> of my uploaded photo into a 512-D mathematical embedding.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={discoveryConsent}
                onChange={(e) => setDiscoveryConsent(e.target.checked)}
                className="mt-0.5 rounded text-brand-cyan bg-surface-elevated border-surface-border cursor-pointer"
              />
              <span className="text-[11px] text-content-secondary leading-snug">
                I agree to be discoverable as a <strong>visual twin</strong> to other enrolled participants.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 py-2.5 rounded-lg font-bold bg-brand-cyan text-black hover:bg-brand-cyanHover disabled:opacity-50 transition-colors flex items-center justify-center gap-2 text-xs shadow-sm"
          >
            {loading ? "Creating Profile..." : "Create Account & Proceed"}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="text-center mt-6 text-xs text-content-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-brand-cyan hover:underline font-semibold">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
