"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { AuthService } from "@/services/auth.service";
import { Fingerprint, Lock, Mail, ArrowRight, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await AuthService.login({
        email: email.trim(),
        password,
      });

      login(res);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please verify your email and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full surface-card rounded-2xl p-8 border border-surface-border relative shadow-panel">
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-surface-elevated border border-surface-border flex items-center justify-center mx-auto mb-3">
            <Fingerprint className="w-5 h-5 text-brand-cyan" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-content-primary">
            Sign In to Doppel
          </h2>
          <p className="text-xs text-content-secondary mt-1">
            Access your visual twin matches and discovery controls
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
            <label className="block text-xs font-semibold text-content-secondary mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-content-muted absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-surface-elevated border border-surface-border focus:border-brand-cyan focus:outline-none text-content-primary text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 py-2.5 rounded-lg font-bold bg-brand-cyan text-black hover:bg-brand-cyanHover disabled:opacity-50 transition-colors flex items-center justify-center gap-2 text-xs shadow-sm"
          >
            {loading ? "Authenticating..." : "Sign In"}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="mt-6 p-3 rounded-lg bg-surface-elevated border border-surface-border text-[11px] text-content-muted text-center font-mono">
          Demo Admin: <span className="text-brand-cyan">admin@doppel.ai</span> | <span className="text-brand-cyan">AdminPass123!</span>
        </div>

        <div className="text-center mt-6 text-xs text-content-muted">
          New to the network?{" "}
          <Link href="/signup" className="text-brand-cyan hover:underline font-semibold">
            Create Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
