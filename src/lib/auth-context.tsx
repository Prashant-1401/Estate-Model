"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  email: string;
  name: string;
  role: string;
  initials: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_CREDENTIALS = {
  email: "admin@estatecrm.com",
  password: "admin123",
};

const ADMIN_USER: User = {
  email: ADMIN_CREDENTIALS.email,
  name: "Admin",
  role: "Administrator",
  initials: "AD",
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("estatecrm_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("estatecrm_user");
      }
    }
    setIsLoaded(true);
  }, []);

  const login = (email: string, password: string): boolean => {
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      setUser(ADMIN_USER);
      localStorage.setItem("estatecrm_user", JSON.stringify(ADMIN_USER));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("estatecrm_user");
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
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
