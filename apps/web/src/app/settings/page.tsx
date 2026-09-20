"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { SettingsService } from "@/services/settings.service";
import { 
  Shield, CheckCircle2, AlertCircle, RefreshCw, 
  MapPin, Eye, EyeOff, Lock, AlertTriangle, Trash2, 
  User, Sparkles, Sliders, ExternalLink, Cpu, Info
} from "lucide-react";

type SettingsTab = "privacy" | "profile" | "charter" | "danger";

export default function SettingsPage() {
  const router = useRouter();
  const { user, refreshUser, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<SettingsTab>("privacy");

  // Form states
  const [discoveryEnabled, setDiscoveryEnabled] = useState(true);
  const [showCity, setShowCity] = useState(false);
  const [cityName, setCityName] = useState("");
  const [allowContact, setAllowContact] = useState(true);
  const [bio, setBio] = useState("");

  const [saving, setSaving] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const [deletingBio, setDeletingBio] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  useEffect(() => {
    if (user?.settings) {
      setDiscoveryEnabled(user.settings.discovery_enabled);
      setShowCity(user.settings.show_city);
      setCityName(user.settings.city_name || "");
      setAllowContact(user.settings.allow_contact_requests);
      setBio(user.settings.bio || "");
    }
  }, [user]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessNotice(null);
    setErrorNotice(null);

    try {
      await SettingsService.updateSettings({
        discovery_enabled: discoveryEnabled,
        show_city: showCity,
        city_name: cityName,
        allow_contact_requests: allowContact,
        bio: bio
      });
      await refreshUser();
      setSuccessNotice("Privacy preferences and discovery settings saved successfully.");
    } catch (err: any) {
      setErrorNotice(err.message || "Failed to update preferences.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBiometricProfile = async () => {
    if (confirm("Are you sure you want to delete your biometric face profile? Your 512-D embedding vector will be permanently purged from the index and you will no longer appear in visual searches.")) {
      setDeletingBio(true);
      setErrorNotice(null);
      try {
        await SettingsService.deleteBiometricProfile();
        await refreshUser();
        setSuccessNotice("Biometric profile and facial embedding permanently deleted from the vector index.");
      } catch (err: any) {
        setErrorNotice(err.message || "Failed to purge biometric profile.");
      } finally {
        setDeletingBio(false);
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm("PERMANENT ACTION: Are you sure you want to delete your entire Doppel account? All credentials, discovery history, and biometric records will be permanently destroyed.")) {
      setDeletingAccount(true);
      try {
        await SettingsService.deleteAccount();
        logout();
      } catch (err: any) {
        setErrorNotice(err.message || "Failed to delete account.");
        setDeletingAccount(false);
      }
    }
  };

  return (
    <div className="min-h-[85vh] py-10 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-surface-border">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sliders className="w-3.5 h-3.5" />
            Preferences & Security
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-content-primary tracking-tight">
            Account & Privacy Settings
          </h1>
          <p className="text-sm text-content-secondary mt-1 max-w-xl">
            Control your visual discovery presence, manage biometric data lifecycle, and review consent guarantees.
          </p>
        </div>

        {/* Enrollment Status Badge */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-card border border-surface-border self-start md:self-auto">
          <div className={`w-3 h-3 rounded-full ${user?.is_enrolled ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" : "bg-amber-400"}`} />
          <div className="text-left">
            <div className="text-xs font-bold text-content-primary">
              {user?.is_enrolled ? "Biometric Index Active" : "Unenrolled Profile"}
            </div>
            <div className="text-[11px] text-content-muted">
              {user?.is_enrolled ? "512-D Cosine Vector Indexed" : "Not searchable in radar"}
            </div>
          </div>
          {!user?.is_enrolled && (
            <Link
              href="/enroll"
              className="ml-2 px-3 py-1 text-xs font-semibold rounded-lg bg-cyan-500 text-surface-background hover:bg-cyan-400 transition-colors"
            >
              Enroll Now
            </Link>
          )}
        </div>
      </div>

      {/* Notice Banners */}
      {successNotice && (
        <div className="p-4 rounded-xl bg-status-success/10 border border-status-success/30 text-status-success text-sm flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {errorNotice && (
        <div className="p-4 rounded-xl bg-status-danger/10 border border-status-danger/30 text-status-danger text-sm flex items-center gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorNotice}</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-surface-border pb-3">
        <button
          onClick={() => setActiveTab("privacy")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === "privacy"
              ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm"
              : "text-content-secondary hover:text-content-primary hover:bg-surface-card"
          }`}
        >
          <Shield className="w-4 h-4" />
          Privacy & Visibility
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === "profile"
              ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm"
              : "text-content-secondary hover:text-content-primary hover:bg-surface-card"
          }`}
        >
          <User className="w-4 h-4" />
          Profile Details
        </button>
        <button
          onClick={() => setActiveTab("charter")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === "charter"
              ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm"
              : "text-content-secondary hover:text-content-primary hover:bg-surface-card"
          }`}
        >
          <Cpu className="w-4 h-4" />
          Biometric Charter
        </button>
        <button
          onClick={() => setActiveTab("danger")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === "danger"
              ? "bg-status-danger/10 text-status-danger border border-status-danger/30 shadow-sm"
              : "text-content-secondary hover:text-status-danger hover:bg-surface-card"
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Danger Zone
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === "privacy" && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div className="p-6 rounded-2xl bg-surface-card border border-surface-border space-y-6 shadow-sm">
            <h2 className="text-lg font-bold text-content-primary flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyan-400" />
              Discovery & Matching Visibility
            </h2>

            {/* Toggle: Discovery Enabled */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-surface-background border border-surface-border/60">
              <div className="space-y-1">
                <div className="text-sm font-semibold text-content-primary flex items-center gap-2">
                  {discoveryEnabled ? <Eye className="w-4 h-4 text-cyan-400" /> : <EyeOff className="w-4 h-4 text-content-muted" />}
                  Global Doppelgänger Discovery
                </div>
                <p className="text-xs text-content-secondary max-w-md">
                  When enabled, your mathematical facial embedding can be matched with visually similar participants across the global network.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  checked={discoveryEnabled}
                  onChange={(e) => setDiscoveryEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
              </label>
            </div>

            {/* Toggle: Allow Contact Requests */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-surface-background border border-surface-border/60">
              <div className="space-y-1">
                <div className="text-sm font-semibold text-content-primary flex items-center gap-2">
                  <Lock className="w-4 h-4 text-cyan-400" />
                  Twin Connection Requests
                </div>
                <p className="text-xs text-content-secondary max-w-md">
                  Allow matched twins to send mutual connection requests and initiate private encrypted direct messaging.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  checked={allowContact}
                  onChange={(e) => setAllowContact(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
              </label>
            </div>

            {/* Toggle & Field: Location / City */}
            <div className="space-y-4 p-4 rounded-xl bg-surface-background border border-surface-border/60">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-content-primary flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-cyan-400" />
                    City-Level Vicinity Display
                  </div>
                  <p className="text-xs text-content-secondary max-w-md">
                    Display your city to matches to discover local doppelgängers. Exact GPS coordinates are never stored or shared.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={showCity}
                    onChange={(e) => setShowCity(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-surface-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                </label>
              </div>

              {showCity && (
                <div className="pt-3 border-t border-surface-border/40">
                  <label className="block text-xs font-medium text-content-secondary mb-1">
                    Your City Name (e.g. San Francisco, CA or London, UK)
                  </label>
                  <input
                    type="text"
                    value={cityName}
                    onChange={(e) => setCityName(e.target.value)}
                    placeholder="Enter city name..."
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-card border border-surface-border text-sm text-content-primary placeholder-content-muted focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-surface-background font-bold text-sm transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${saving ? "animate-spin" : ""}`} />
              {saving ? "Saving Changes..." : "Save Privacy Settings"}
            </button>
          </div>
        </form>
      )}

      {activeTab === "profile" && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div className="p-6 rounded-2xl bg-surface-card border border-surface-border space-y-6 shadow-sm">
            <h2 className="text-lg font-bold text-content-primary flex items-center gap-2">
              <User className="w-5 h-5 text-cyan-400" />
              Public Profile & Introduction
            </h2>

            {/* Readonly Account Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-surface-background border border-surface-border/60">
                <span className="text-xs text-content-muted block mb-1">Username</span>
                <span className="text-sm font-semibold text-content-primary font-mono">{user?.username || "—"}</span>
              </div>
              <div className="p-4 rounded-xl bg-surface-background border border-surface-border/60">
                <span className="text-xs text-content-muted block mb-1">Registered Email</span>
                <span className="text-sm font-semibold text-content-primary">{user?.email || "—"}</span>
              </div>
            </div>

            {/* Bio Field */}
            <div>
              <label className="block text-xs font-semibold text-content-secondary mb-2">
                Discovery Bio & Note to Matches
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                maxLength={300}
                placeholder="Share a short greeting, your passions, or a fun twin curiosity note for people who match with you..."
                className="w-full px-4 py-3 rounded-xl bg-surface-background border border-surface-border text-sm text-content-primary placeholder-content-muted focus:outline-none focus:border-cyan-500/50 resize-none"
              />
              <div className="flex justify-between items-center text-[11px] text-content-muted mt-1">
                <span>Shown to users when they inspect your likeness card.</span>
                <span>{bio.length}/300</span>
              </div>
            </div>

            {/* Re-enrollment CTA */}
            <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-sm font-semibold text-cyan-300 block">Update Facial Portrait</span>
                <span className="text-xs text-content-secondary">
                  Want to refresh your facial embedding with higher lighting or a newer photo?
                </span>
              </div>
              <Link
                href="/enroll"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors whitespace-nowrap"
              >
                Re-take Biometric Scan
              </Link>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-surface-background font-bold text-sm transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${saving ? "animate-spin" : ""}`} />
              {saving ? "Saving Changes..." : "Save Profile Details"}
            </button>
          </div>
        </form>
      )}

      {activeTab === "charter" && (
        <div className="p-6 sm:p-8 rounded-2xl bg-surface-card border border-surface-border space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-surface-border">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-content-primary">The Doppel Biometric Charter</h2>
              <p className="text-xs text-content-secondary">Our cryptographic and consent-first engineering principles</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-surface-background border border-surface-border/60 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 text-sm font-bold">
                <Lock className="w-4 h-4" />
                Mathematical Irreversibility
              </div>
              <p className="text-xs text-content-secondary leading-relaxed">
                Raw facial photographs are transformed into normalized 512-dimensional vector representations. Original images cannot be reverse-engineered from embedding coordinates.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface-background border border-surface-border/60 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 text-sm font-bold">
                <Eye className="w-4 h-4" />
                Zero Surveillance Guarantee
              </div>
              <p className="text-xs text-content-secondary leading-relaxed">
                We never scrape social media, run un-consented facial recognition, or sell biometric datasets to third parties, law enforcement, or advertising brokers.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface-background border border-surface-border/60 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 text-sm font-bold">
                <Trash2 className="w-4 h-4" />
                1-Click Vector Purge
              </div>
              <p className="text-xs text-content-secondary leading-relaxed">
                You retain absolute ownership of your biometric identity. Triggering a vector purge drops your record from the indexing memory instantly and irrevocably.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface-background border border-surface-border/60 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 text-sm font-bold">
                <CheckCircle2 className="w-4 h-4" />
                Explicit Opt-In Only
              </div>
              <p className="text-xs text-content-secondary leading-relaxed">
                Every member on the platform has voluntarily taken a photo and explicitly consented to visual similarity exploration.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "danger" && (
        <div className="p-6 sm:p-8 rounded-2xl bg-surface-card border border-status-danger/30 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-surface-border">
            <div className="w-10 h-10 rounded-xl bg-status-danger/10 border border-status-danger/20 flex items-center justify-center text-status-danger">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-status-danger">Danger Zone & Data Eradication</h2>
              <p className="text-xs text-content-secondary">Irreversible deletion actions for your biometric identity and account</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Purge Biometrics */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-surface-background border border-surface-border/60 gap-4">
              <div>
                <span className="text-sm font-semibold text-content-primary block">Purge Biometric Face Vector</span>
                <span className="text-xs text-content-muted block mt-0.5">
                  Immediately purges your 512-D vector from the discovery index. Your account, username, and message history remain active.
                </span>
              </div>
              <button
                type="button"
                onClick={handleDeleteBiometricProfile}
                disabled={deletingBio || !user?.is_enrolled}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-status-danger/10 text-status-danger border border-status-danger/30 hover:bg-status-danger/20 whitespace-nowrap transition-colors disabled:opacity-40"
              >
                {deletingBio ? "Purging Vector..." : user?.is_enrolled ? "Purge Face Vector" : "No Vector Indexed"}
              </button>
            </div>

            {/* Delete Account */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-status-danger/10 border border-status-danger/30 gap-4">
              <div>
                <span className="text-sm font-semibold text-status-danger block">Permanently Destroy Account</span>
                <span className="text-xs text-content-muted block mt-0.5">
                  Irreversibly erases all credentials, messages, connection logs, discovery history, and biometric records from the system.
                </span>
              </div>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deletingAccount}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-status-danger text-white hover:opacity-90 whitespace-nowrap transition-opacity shadow-sm"
              >
                {deletingAccount ? "Destroying Account..." : "Permanently Destroy Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
