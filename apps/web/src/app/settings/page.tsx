"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { SettingsService } from "@/services/settings.service";
import { 
  Shield, CheckCircle2, AlertCircle, RefreshCw, 
  MapPin, Eye, Lock, AlertTriangle, Trash2
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const { user, refreshUser, logout } = useAuth();

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
    if (confirm("PERMANENT ACTION: Are you sure you want to delete your entire Doppel account? All credentials, discovery history, and biometric vectors will be permanently destroyed.")) {
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
    <div className="min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-10">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-content-primary tracking-tight">
          Privacy & Profile Preferences
        </h1>
        <p className="text-xs text-content-secondary mt-1">
          Manage your biometric consent, discovery visibility, and irreversible vector deletion controls.
        </p>
      </div>

      {successNotice && (
        <div className="p-4 rounded-xl bg-status-success/10 border border-status-success/30 text-status-success text-xs flex items-center gap-3">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {errorNotice && (
        <div className="p-4 rounded-xl bg-status-danger/10 border border-status-danger/30 text-status-danger text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorNotice}</span>
        </div>
      )}

      {/* Discovery & Privacy Controls */}
      <form onSubmit={handleSaveSettings} className="surface-card rounded-2xl p-6 sm:p-8 border border-surface-border space-y-6 shadow-panel">
        <h2 className="text-base font-bold text-content-primary flex items-center gap-2 border-b border-surface-border pb-4">
          <Shield className="w-4 h-4 text-brand-cyan" />
          Discovery & Visibility Controls
        </h2>

        <div className="space-y-4 text-xs">
          {/* Discovery Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-surface-elevated border border-surface-border">
            <div>
              <span className="text-sm font-semibold text-content-primary block">Active Discovery Participation</span>
              <span className="text-content-muted text-[11px]">
                Allow your face embedding to be matched by other consenting participants.
              </span>
            </div>
            <input
              type="checkbox"
              checked={discoveryEnabled}
              onChange={(e) => setDiscoveryEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-brand-cyan bg-surface-main border-surface-border cursor-pointer"
            />
          </div>

          {/* Contact Requests Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-surface-elevated border border-surface-border">
            <div>
              <span className="text-sm font-semibold text-content-primary block">Allow Connection Notes</span>
              <span className="text-content-muted text-[11px]">
                Permit discovered visual twins to send you notes and contact invitations.
              </span>
            </div>
            <input
              type="checkbox"
              checked={allowContact}
              onChange={(e) => setAllowContact(e.target.checked)}
              className="w-4 h-4 rounded text-brand-cyan bg-surface-main border-surface-border cursor-pointer"
            />
          </div>

          {/* City Location Toggle */}
          <div className="p-4 rounded-xl bg-surface-elevated border border-surface-border space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-content-primary block">Display General Location</span>
                <span className="text-content-muted text-[11px]">
                  Share your approximate metropolitan area with discovered matches.
                </span>
              </div>
              <input
                type="checkbox"
                checked={showCity}
                onChange={(e) => setShowCity(e.target.checked)}
                className="w-4 h-4 rounded text-brand-cyan bg-surface-main border-surface-border cursor-pointer"
              />
            </div>
            {showCity && (
              <input
                type="text"
                value={cityName}
                onChange={(e) => setCityName(e.target.value)}
                placeholder="e.g. London, UK or Seattle, WA"
                className="w-full px-3.5 py-2 rounded-lg bg-surface-main border border-surface-border text-content-primary text-xs focus:border-brand-cyan focus:outline-none"
              />
            )}
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-semibold text-content-secondary mb-1">Public Bio (Optional)</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Share a short bio with your visual twins..."
              className="w-full px-3.5 py-2 rounded-lg bg-surface-elevated border border-surface-border text-content-primary text-xs focus:border-brand-cyan focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 rounded-lg text-xs font-bold bg-brand-cyan text-black hover:bg-brand-cyanHover transition-colors"
        >
          {saving ? "Saving Changes..." : "Save Privacy Preferences"}
        </button>
      </form>

      {/* Danger Zone: Biometric Purge & Deletion */}
      <div className="surface-card rounded-2xl p-6 sm:p-8 border border-status-danger/30 space-y-6 shadow-panel">
        <h2 className="text-base font-bold text-status-danger flex items-center gap-2 border-b border-status-danger/20 pb-4">
          <AlertTriangle className="w-4 h-4 text-status-danger" />
          Biometric Data Deletion & Account Erasure
        </h2>

        <div className="space-y-4 text-xs">
          {/* Purge Biometrics */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-status-danger/5 border border-status-danger/20 gap-4">
            <div>
              <span className="text-sm font-semibold text-content-primary block">Purge Biometric Embedding Only</span>
              <span className="text-content-muted text-[11px]">
                Immediately drops your 512-D vector from the vector store. Your account stays active.
              </span>
            </div>
            <button
              type="button"
              onClick={handleDeleteBiometricProfile}
              disabled={deletingBio}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-status-danger/10 text-status-danger border border-status-danger/30 hover:bg-status-danger/20 whitespace-nowrap transition-colors"
            >
              {deletingBio ? "Purging..." : "Purge Face Vector"}
            </button>
          </div>

          {/* Delete Account */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-status-danger/10 border border-status-danger/30 gap-4">
            <div>
              <span className="text-sm font-semibold text-status-danger block">Permanently Delete Account</span>
              <span className="text-content-muted text-[11px]">
                Irreversibly erases all credentials, discovery logs, settings, and biometric records.
              </span>
            </div>
            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={deletingAccount}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-status-danger text-white hover:opacity-90 whitespace-nowrap transition-opacity"
            >
              {deletingAccount ? "Deleting..." : "Permanently Delete Account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
