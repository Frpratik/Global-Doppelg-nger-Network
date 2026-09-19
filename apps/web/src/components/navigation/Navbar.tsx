"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { 
  Fingerprint, Search, ShieldCheck, Cpu, HelpCircle, 
  LayoutDashboard, Settings, LogOut, Menu, X, MessageSquare 
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { name: "Discover", href: "/discover", icon: Search },
    { name: "My Matches", href: "/matches", icon: Fingerprint, authRequired: true },
    { name: "Twin Chat", href: "/messages", icon: MessageSquare, authRequired: true },
    { name: "Architecture", href: "/architecture", icon: Cpu },
    { name: "Privacy", href: "/privacy", icon: ShieldCheck },
    { name: "Doppel AI", href: "/help", icon: HelpCircle },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-surface-border bg-background/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-lg bg-surface-elevated border border-surface-border flex items-center justify-center group-hover:border-brand-cyan/60 transition-colors">
            <Fingerprint className="w-5 h-5 text-brand-cyan" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold tracking-tight text-base text-content-primary">
              DOPPEL
            </span>
            <span className="text-[10px] tracking-wider text-content-muted font-mono uppercase">
              Visual Twin AI
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            if (link.authRequired && !user) return null;
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "text-brand-cyan bg-brand-cyan/10 border border-brand-cyan/30"
                    : "text-content-secondary hover:text-content-primary hover:bg-surface-elevated border border-transparent"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-brand-cyan" : "text-content-muted"}`} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* User / Actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-elevated text-content-primary border border-surface-border hover:border-brand-cyan/40 transition-colors"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-brand-cyan" />
                Dashboard
              </Link>
              <Link
                href="/settings"
                className="p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-elevated transition-colors"
                title="Privacy & Profile Settings"
              >
                <Settings className="w-4 h-4" />
              </Link>
              <button
                onClick={logout}
                className="p-1.5 rounded-lg text-content-muted hover:text-status-danger hover:bg-status-dangerBg transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3.5 py-1.5 text-xs font-medium text-content-secondary hover:text-content-primary transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-brand-cyan text-black hover:bg-brand-cyanHover transition-all shadow-buttonPrimary"
              >
                Enroll Profile
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-content-secondary hover:text-content-primary"
          aria-label="Toggle Navigation Menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-surface-border bg-background px-4 py-4 space-y-2">
          {navLinks.map((link) => {
            if (link.authRequired && !user) return null;
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs font-medium ${
                  isActive ? "text-brand-cyan bg-brand-cyan/10" : "text-content-secondary"
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.name}
              </Link>
            );
          })}
          {user ? (
            <div className="pt-3 border-t border-surface-border space-y-1">
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-content-primary"
              >
                <LayoutDashboard className="w-4 h-4 text-brand-cyan" />
                Dashboard
              </Link>
              <Link
                href="/settings"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-content-primary"
              >
                <Settings className="w-4 h-4" />
                Settings
              </Link>
              <button
                onClick={() => {
                  setMobileOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-status-danger"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-surface-border flex gap-2">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="flex-1 py-2 text-center text-xs font-medium bg-surface-elevated text-content-primary rounded-lg"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileOpen(false)}
                className="flex-1 py-2 text-center text-xs font-semibold bg-brand-cyan text-black rounded-lg"
              >
                Enroll
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
