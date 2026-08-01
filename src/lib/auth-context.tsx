"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { AuthUser, Role } from "@/lib/types";
import { api } from "@/lib/api";

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  hasRole: (...roles: Role[]) => boolean;
}

interface LoginResponse {
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: Role;
    status: string;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    localStorage.removeItem("estatecrm_token");
    let cancelled = false;
    (async () => {
      try {
        const u = await api.get<LoginResponse["user"]>("/api/auth/me");
        if (!cancelled) setUser({ ...u, initials: getInitials(u.name) });
      } catch {
        if (!cancelled) setUser(null);
      }
      if (!cancelled) setIsLoaded(true);
    })();
    return () => { cancelled = true; };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await api.post<LoginResponse>("/api/auth/login", { email, password });
      setUser({ ...res.user, initials: getInitials(res.user.name) });
      return true;
    } catch {
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await api.post("/api/auth/logout");
    } catch {}
    setUser(null);
  };

  const hasRole = (...roles: Role[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, hasRole }}>
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
