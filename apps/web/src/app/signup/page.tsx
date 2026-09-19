"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ApiClient } from "@/lib/api";
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
    setLoading(true);

    try {
      const res = await ApiClient.register({
        display_name: displayName,
        username: username.toLowerCase().trim(),
        email: email.trim(),
        password,
        biometric_consent: biometricConsent,
        discovery_consent: discoveryConsent,
      });

      login(res);
      router.push("/enroll");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please verify your details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-radial-gradient">
      <div className="max-w-md w-full glass-panel rounded-3xl p-8 border border-cyan-500/20 relative shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00F0FF] to-[#8A2BE2] p-0.5 mx-auto mb-4">
            <div className="w-full h-full bg-[#06090F] rounded-[14px] flex items-center justify-center">
              <Fingerprint className="w-6 h-6 text-[#00F0FF]" />
            </div>
          </div>
          <h2 className="text-2xl font-extrabold text-white">Join the Doppel Network</h2>
          <p className="text-xs text-slate-400 mt-1">
            Create your account and discover your visual twin
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Display Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Elena Rostova"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 focus:border-cyan-400 focus:outline-none text-white text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Username</label>
            <div className="relative">
              <span className="text-slate-500 text-sm absolute left-3.5 top-2.5">@</span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="elena_r"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 focus:border-cyan-400 focus:outline-none text-white text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="elena@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 focus:border-cyan-400 focus:outline-none text-white text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 focus:border-cyan-400 focus:outline-none text-white text-sm"
              />
            </div>
          </div>

          {/* Consent Checkboxes */}
          <div className="pt-2 space-y-3 border-t border-slate-800">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={biometricConsent}
                onChange={(e) => setBiometricConsent(e.target.checked)}
                className="mt-0.5 rounded text-cyan-500 focus:ring-cyan-400 bg-slate-900 border-slate-700"
              />
              <span className="text-[11px] text-slate-300 leading-snug">
                I agree to the <strong>biometric processing</strong> of my selfie into a 512-d mathematical vector embedding.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={discoveryConsent}
                onChange={(e) => setDiscoveryConsent(e.target.checked)}
                className="mt-0.5 rounded text-cyan-500 focus:ring-cyan-400 bg-slate-900 border-slate-700"
              />
              <span className="text-[11px] text-slate-300 leading-snug">
                I agree to allow my profile to be discoverable as a <strong>visual twin</strong> to other enrolled participants.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 rounded-xl font-bold bg-gradient-to-r from-[#00F0FF] to-[#00A8FF] text-black shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:opacity-95 transition-all flex items-center justify-center gap-2"
          >
            {loading ? "Creating Account..." : "Create Account & Enroll"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center mt-6 text-xs text-slate-400">
          Already enrolled in Doppel?{" "}
          <Link href="/login" className="text-cyan-400 hover:underline font-semibold">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
