"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Fingerprint, Search, ShieldCheck, Cpu, HelpCircle, User, LogOut, LayoutDashboard, Settings } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navLinks = [
    { name: "Discover", href: "/discover", icon: Search },
    { name: "Matches", href: "/matches", icon: Fingerprint, authRequired: true },
    { name: "Architecture", href: "/architecture", icon: Cpu },
    { name: "Privacy", href: "/privacy", icon: ShieldCheck },
    { name: "Doppel AI", href: "/help", icon: HelpCircle },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#06090F]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00F0FF] to-[#8A2BE2] p-0.5 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-[#06090F] rounded-[10px] flex items-center justify-center">
              <Fingerprint className="w-5 h-5 text-[#00F0FF]" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold tracking-wider text-xl bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-[#00F0FF]">
              DOPPEL
            </span>
            <span className="text-[10px] tracking-widest text-cyan-400 font-mono -mt-1 uppercase">
              Visual Twin AI
            </span>
          </div>
        </Link>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            if (link.authRequired && !user) return null;
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "text-[#00F0FF] bg-cyan-950/30 border border-cyan-500/30 shadow-sm shadow-cyan-500/10"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#00F0FF]" : "text-slate-400"}`} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* User / Auth State */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Dashboard
              </Link>
              <Link
                href="/settings"
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                title="Settings & Privacy"
              >
                <Settings className="w-4 h-4" />
              </Link>
              <button
                onClick={logout}
                className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-[#00F0FF] to-[#00A8FF] text-black shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:opacity-95 transition-all duration-200"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
