"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { ApiClient } from "./api";

export interface User {
  id: string;
  email: string;
  display_name: string;
  username: string;
  avatar?: string;
  is_admin: boolean;
  has_biometric_consent: boolean;
  has_discovery_consent: boolean;
  is_enrolled: boolean;
  settings?: {
    profile_visibility: string;
    discovery_enabled: boolean;
    allow_contact_requests: boolean;
    show_city: boolean;
    city_name: string;
    bio: string;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (tokens: { access_token: string; refresh_token: string; user: any }) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem("doppel_access_token");
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      const profile = await ApiClient.getMe();
      setUser(profile);
    } catch {
      localStorage.removeItem("doppel_access_token");
      localStorage.removeItem("doppel_refresh_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = (data: { access_token: string; refresh_token: string; user: any }) => {
    localStorage.setItem("doppel_access_token", data.access_token);
    localStorage.setItem("doppel_refresh_token", data.refresh_token);
    setUser(data.user);
    refreshUser();
  };

  const logout = () => {
    localStorage.removeItem("doppel_access_token");
    localStorage.removeItem("doppel_refresh_token");
    setUser(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
