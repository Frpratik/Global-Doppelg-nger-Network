import { Shield, Lock, Server, Key, AlertOctagon, CheckCircle2 } from "lucide-react";

export default function SecurityPage() {
  return (
    <div className="min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-10">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-3">
          <Shield className="w-3.5 h-3.5 text-cyan-400" />
          <span>Security Architecture & Threat Model</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          System Security & Anti-Abuse Controls
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
          Comprehensive defense-in-depth safeguards protecting biometric data, user identities, and search endpoints.
        </p>
      </div>

      <div className="space-y-6 text-xs sm:text-sm text-slate-300 leading-relaxed">
        <div className="glass-panel rounded-3xl p-8 border border-slate-800 space-y-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Key className="w-4 h-4 text-cyan-400" />
            1. Authentication & Credential Storage
          </h3>
          <p>
            Passwords are encrypted using <strong>salted bcrypt with 12 computational rounds</strong>. Session authorization employs signed RS256/HS256 JSON Web Tokens (JWT) with separate short-lived access tokens (60 min) and rotating refresh tokens. Raw passwords and JWT secrets are strictly managed through environment variables and never committed to source code.
          </p>
        </div>

        <div className="glass-panel rounded-3xl p-8 border border-slate-800 space-y-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-purple-400" />
            2. Anti-Harvesting & Rate Limiting System
          </h3>
          <p>
            To prevent adversarial bulk scraping or facial database harvesting, search endpoints are throttled to a maximum of 15 queries per minute per authenticated account. Unauthenticated or mass queries are blocked at the middleware gateway.
          </p>
        </div>

        <div className="glass-panel rounded-3xl p-8 border border-slate-800 space-y-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-400" />
            3. Vector Store Isolation
          </h3>
          <p>
            Raw 512-d feature vectors are never transmitted to frontend clients. Vector search results return only ranked participant identifiers and permissible metadata (display names and approximate locations), preventing reconstruction attacks.
          </p>
        </div>

        <div className="glass-panel rounded-3xl p-8 border border-slate-800 space-y-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-400" />
            4. User Blocking & Report Moderation
          </h3>
          <p>
            Users can instantaneously block any matched profile, immediately removing both parties from each other's search spaces in vector and database queries. Submitted user reports are routed directly to the Trust & Safety audit review queue.
          </p>
        </div>
      </div>
    </div>
  );
}
