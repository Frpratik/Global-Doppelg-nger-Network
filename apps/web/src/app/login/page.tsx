"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { AuthService } from "@/services/auth.service";
import { Fingerprint, Lock, Mail, ArrowRight, AlertCircle, Shield } from "lucide-react";

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
      <div className="max-w-md w-full p-8 sm:p-10 rounded-3xl bg-surface-card border border-surface-border relative shadow-panel space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-4 text-cyan-400">
            <Fingerprint className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-content-primary tracking-tight">
            Sign In to Doppel
          </h1>
          <p className="text-xs text-content-secondary mt-1.5">
            Access your discovery matches, message hub, and privacy controls
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
            <label className="block text-xs font-semibold text-content-secondary mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-content-muted absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-background border border-surface-border focus:border-cyan-500 focus:outline-none text-content-primary text-sm transition-colors placeholder-content-muted"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-content-secondary">Password</label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-content-muted absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-background border border-surface-border focus:border-cyan-500 focus:outline-none text-content-primary text-sm transition-colors placeholder-content-muted"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 rounded-xl font-bold bg-cyan-500 text-surface-background hover:bg-cyan-400 disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-sm shadow-md active:scale-95"
          >
            {loading ? "Authenticating..." : "Sign In to Account"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="p-3.5 rounded-xl bg-surface-background border border-surface-border text-xs text-content-muted text-center font-mono">
          Demo Admin: <span className="text-cyan-400">admin@doppel.ai</span> | <span className="text-cyan-400">AdminPass123!</span>
        </div>

        <div className="text-center text-xs text-content-muted pt-2 border-t border-surface-border">
          New to the network?{" "}
          <Link href="/signup" className="text-cyan-400 hover:underline font-semibold ml-1">
            Create Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
