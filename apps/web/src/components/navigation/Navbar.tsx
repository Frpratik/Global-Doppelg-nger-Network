"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ChatService } from "@/services/chat.service";
import { 
  Fingerprint, Search, ShieldCheck, Cpu, HelpCircle, 
  LayoutDashboard, Settings, LogOut, Menu, X, MessageSquare, Bell 
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState({
    unread_messages: 0,
    pending_requests: 0,
    total_notifications: 0,
  });

  // Poll for unread messages and twin connection requests
  useEffect(() => {
    if (!user) return;

    const checkNotifications = async () => {
      try {
        const notifs = await ChatService.getNotifications();
        setNotifications(notifs);
      } catch {
        // Fallback silently if offline
      }
    };

    checkNotifications();
    const interval = setInterval(checkNotifications, 4000);
    return () => clearInterval(interval);
  }, [user, pathname]);

  const navLinks = [
    { name: "Discover", href: "/discover", icon: Search },
    { name: "My Matches", href: "/matches", icon: Fingerprint, authRequired: true },
    { 
      name: "Messages", 
      href: "/messages", 
      icon: MessageSquare, 
      authRequired: true,
      badge: notifications.total_notifications > 0 ? notifications.total_notifications : undefined
    },
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
                className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "text-brand-cyan bg-brand-cyan/10 border border-brand-cyan/30"
                    : "text-content-secondary hover:text-content-primary hover:bg-surface-elevated border border-transparent"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-brand-cyan" : "text-content-muted"}`} />
                <span>{link.name}</span>
                {link.badge !== undefined && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full bg-brand-cyan text-black font-mono font-bold text-[10px] animate-pulse">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User / Actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              {/* Highlighted Messages & Notifications Hub Button */}
              <Link
                href="/messages"
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  notifications.total_notifications > 0
                    ? "bg-brand-cyan/15 text-brand-cyan border-brand-cyan/50 shadow-[0_0_12px_rgba(6,182,212,0.25)] animate-pulse"
                    : "bg-surface-elevated text-content-secondary border-surface-border hover:border-brand-cyan/40 hover:text-content-primary"
                }`}
                title={
                  notifications.total_notifications > 0
                    ? `${notifications.unread_messages} unread message(s), ${notifications.pending_requests} pending request(s)`
                    : "Twin Chat & Messages"
                }
              >
                <MessageSquare className={`w-3.5 h-3.5 ${notifications.total_notifications > 0 ? "text-brand-cyan" : "text-content-muted"}`} />
                <span>Messages</span>
                {notifications.total_notifications > 0 && (
                  <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-brand-cyan text-black font-mono font-black text-[10px] shadow-sm">
                    {notifications.total_notifications}
                  </span>
                )}
              </Link>

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
        <div className="flex md:hidden items-center gap-2">
          {user && notifications.total_notifications > 0 && (
            <Link
              href="/messages"
              className="p-1.5 rounded-lg bg-brand-cyan/20 border border-brand-cyan/40 text-brand-cyan flex items-center gap-1"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="text-[10px] font-bold font-mono px-1 rounded bg-brand-cyan text-black">
                {notifications.total_notifications}
              </span>
            </Link>
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-content-secondary hover:text-content-primary"
            aria-label="Toggle Navigation Menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
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
                className={`flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium ${
                  isActive ? "text-brand-cyan bg-brand-cyan/10" : "text-content-secondary"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </div>
                {link.badge !== undefined && (
                  <span className="px-1.5 py-0.5 rounded-full bg-brand-cyan text-black font-mono font-bold text-[10px]">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
          {user ? (
            <div className="pt-3 border-t border-surface-border space-y-1">
              <Link
                href="/messages"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between px-3.5 py-2 text-xs font-semibold text-brand-cyan bg-brand-cyan/10 rounded-lg"
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="w-4 h-4" />
                  <span>Twin Messages</span>
                </div>
                {notifications.total_notifications > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-brand-cyan text-black font-mono font-bold text-[10px]">
                    {notifications.total_notifications} New
                  </span>
                )}
              </Link>
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
