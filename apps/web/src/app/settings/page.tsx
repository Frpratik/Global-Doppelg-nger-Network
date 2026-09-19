"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ApiClient } from "@/lib/api";
import { 
  Settings, Shield, Trash2, CheckCircle2, AlertCircle, 
  RefreshCw, MapPin, Eye, MessageSquare, Lock, AlertTriangle
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
      await ApiClient.updateSettings({
        discovery_enabled: discoveryEnabled,
        show_city: showCity,
        city_name: cityName,
        allow_contact_requests: allowContact,
        bio: bio
      });
      await refreshUser();
      setSuccessNotice("Privacy preferences updated successfully.");
    } catch (err: any) {
      setErrorNotice(err.message || "Failed to update preferences.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBiometricProfile = async () => {
    if (confirm("Are you sure you want to delete your biometric face profile? Your 512-d embedding vector will be permanently purged from the vector index and you will no longer appear in Doppel searches.")) {
      setDeletingBio(true);
      setErrorNotice(null);
      try {
        await ApiClient.deleteBiometricProfile();
        await refreshUser();
        setSuccessNotice("Biometric profile and facial embedding permanently purged from the index.");
      } catch (err: any) {
        setErrorNotice(err.message || "Failed to delete biometric profile.");
      } finally {
        setDeletingBio(false);
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm("PERMANENT ACTION: Are you sure you want to delete your entire Doppel account? All profile data, history, and biometric records will be permanently erased.")) {
      setDeletingAccount(true);
      try {
        await ApiClient.deleteAccount();
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
        <h1 className="text-3xl font-extrabold text-white">Privacy & Profile Settings</h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage your biometric consent, discovery visibility, and irreversible data deletion controls.
        </p>
      </div>

      {successNotice && (
        <div className="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {errorNotice && (
        <div className="p-4 rounded-2xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <span>{errorNotice}</span>
        </div>
      )}

      {/* Discovery & Privacy Preferences Form */}
      <form onSubmit={handleSaveSettings} className="glass-panel rounded-3xl p-8 border border-cyan-500/20 space-y-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-4">
          <Shield className="w-5 h-5 text-cyan-400" />
          Discovery & Visibility Controls
        </h2>

        <div className="space-y-4 text-xs">
          {/* Discovery Toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div>
              <span className="text-sm font-semibold text-white block">Participate in Discovery</span>
              <span className="text-slate-400 text-[11px]">
                Allow your face embedding to be matched by other consenting Doppel participants.
              </span>
            </div>
            <input
              type="checkbox"
              checked={discoveryEnabled}
              onChange={(e) => setDiscoveryEnabled(e.target.checked)}
              className="w-5 h-5 rounded text-cyan-500 focus:ring-cyan-400 bg-slate-800 border-slate-700 cursor-pointer"
            />
          </div>

          {/* Contact Requests Toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div>
              <span className="text-sm font-semibold text-white block">Allow Connection Requests</span>
              <span className="text-slate-400 text-[11px]">
                Permit discovered visual twins to send you notes and contact invitations.
              </span>
            </div>
            <input
              type="checkbox"
              checked={allowContact}
              onChange={(e) => setAllowContact(e.target.checked)}
              className="w-5 h-5 rounded text-cyan-500 focus:ring-cyan-400 bg-slate-800 border-slate-700 cursor-pointer"
            />
          </div>

          {/* City Location Toggle */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-white block">Display Approximate City</span>
                <span className="text-slate-400 text-[11px]">
                  Share your general metropolitan area with discovered matches.
                </span>
              </div>
              <input
                type="checkbox"
                checked={showCity}
                onChange={(e) => setShowCity(e.target.checked)}
                className="w-5 h-5 rounded text-cyan-500 focus:ring-cyan-400 bg-slate-800 border-slate-700 cursor-pointer"
              />
            </div>
            {showCity && (
              <input
                type="text"
                value={cityName}
                onChange={(e) => setCityName(e.target.value)}
                placeholder="e.g. San Francisco, CA"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-cyan-400 focus:outline-none"
              />
            )}
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Public Bio (Optional)</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell your visual twins a bit about your creative passions or hobbies..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-cyan-400 focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#00F0FF] text-black shadow-md shadow-cyan-500/20 hover:opacity-90 transition-all"
        >
          {saving ? "Saving Changes..." : "Save Privacy Preferences"}
        </button>
      </form>

      {/* Danger Zone: Biometric Purge & Account Deletion */}
      <div className="glass-panel rounded-3xl p-8 border border-rose-500/30 space-y-6">
        <h2 className="text-lg font-bold text-rose-400 flex items-center gap-2 border-b border-rose-500/20 pb-4">
          <AlertTriangle className="w-5 h-5 text-rose-400" />
          Biometric Data Deletion & Account Purge
        </h2>

        <div className="space-y-4 text-xs">
          {/* Delete Biometric Profile */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-rose-950/20 border border-rose-500/20 gap-4">
            <div>
              <span className="text-sm font-semibold text-white block">Delete Biometric Profile Only</span>
              <span className="text-slate-400 text-[11px]">
                Immediately removes your 512-d vector from the vector database. Keeps your account active.
              </span>
            </div>
            <button
              type="button"
              onClick={handleDeleteBiometricProfile}
              disabled={deletingBio}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 whitespace-nowrap"
            >
              {deletingBio ? "Purging..." : "Purge Biometrics"}
            </button>
          </div>

          {/* Delete Account */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-rose-950/30 border border-rose-500/30 gap-4">
            <div>
              <span className="text-sm font-semibold text-rose-300 block">Delete Entire Account</span>
              <span className="text-slate-400 text-[11px]">
                Irreversibly deletes all account credentials, match histories, and facial embeddings.
              </span>
            </div>
            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={deletingAccount}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white shadow-lg shadow-rose-600/30 hover:bg-rose-700 whitespace-nowrap"
            >
              {deletingAccount ? "Deleting..." : "Permanently Delete Account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
