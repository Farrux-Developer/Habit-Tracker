"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { sanitize, isValidEmail, isValidPassword, checkRateLimit, getRateRemaining } from "./security";

// ============================================================
// Types
// ============================================================
export interface DeviceInfo {
  userAgent: string;
  platform: string;
  screen: string;
  language: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  lastLogin: string;
  loginCount: number;
  device: DeviceInfo;
  ip: string;
  geo?: { country: string; city: string; region: string; org: string };
}

interface AuthCtx {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => string | null;
  register: (name: string, email: string, password: string) => Promise<string | null>;
  logout: () => void;
  allUsers: () => AuthUser[];
}

const AuthContext = createContext<AuthCtx>({
  user: null, loading: true,
  login: () => "not ready",
  register: async () => "not ready",
  logout: () => {},
  allUsers: () => [],
});

const STORAGE_USERS = "auth-users";
const STORAGE_SESSION = "auth-session";

// ============================================================
// Helpers
// ============================================================
function readUsers(): Record<string, AuthUser> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(STORAGE_USERS) ?? "{}"); }
  catch { return {}; }
}
function writeUsers(u: Record<string, AuthUser>) {
  localStorage.setItem(STORAGE_USERS, JSON.stringify(u));
}

function hash(pw: string): string {
  // simple hash for demo — NOT production crypto
  let h = 0;
  for (let i = 0; i < pw.length; i++) {
    h = ((h << 5) - h) + pw.charCodeAt(i); h |= 0;
  }
  return h.toString(36) + pw.length.toString(36);
}

// ============================================================
// Provider
// ============================================================
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Hydrate session on mount
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_SESSION);
      if (raw) setUser(JSON.parse(raw));
    } catch {}
    setLoading(false);
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (loading) return;
    const isAuthPage = pathname.startsWith("/auth/");
    if (!user && !isAuthPage) {
      router.replace("/auth/login");
    }
  }, [user, loading, pathname, router]);

  const login = useCallback((email: string, password: string): string | null => {
    const e = sanitize(email);
    if (!isValidEmail(e)) return "Invalid email format";
    if (!isValidPassword(password)) return "Invalid password";
    if (!checkRateLimit(`login:${e.toLowerCase()}`, 5, 60000, 120000))
      return "Too many attempts. Wait 2 minutes.";

    const users = readUsers();
    const found = Object.values(users).find(
      u => u.email.toLowerCase() === e.toLowerCase(),
    );
    if (!found) return "Account not found";
    const pwKey = `${e}:${hash(password)}`;
    const stored = users[pwKey];
    if (!stored) return "Wrong password";

    const updated: AuthUser = {
      ...found,
      lastLogin: new Date().toISOString(),
      loginCount: found.loginCount + 1,
    };
    // Update user in storage
    users[pwKey] = updated;
    const emailKey = `email:${e.toLowerCase()}`;
    users[emailKey] = updated;
    writeUsers(users);
    sessionStorage.setItem(STORAGE_SESSION, JSON.stringify(updated));
    setUser(updated);
    router.replace("/");
    return null;
  }, [router]);

  const register = useCallback(async (name: string, email: string, password: string): Promise<string | null> => {
    const n = sanitize(name);
    const e = sanitize(email);
    if (!n || n.length < 2) return "Name must be at least 2 characters";
    if (!isValidEmail(e)) return "Invalid email format";
    if (!isValidPassword(password)) return "Password must be 4-128 characters, no HTML";
    if (!checkRateLimit(`register:${e.toLowerCase()}`, 3, 300000, 600000))
      return "Too many attempts. Wait 10 minutes.";

    const users = readUsers();
    const emailKey = `email:${e.toLowerCase()}`;
    if (users[emailKey]) return "Email already registered";

    // Capture device info
    const device: DeviceInfo = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      screen: `${window.screen.width}x${window.screen.height}`,
      language: navigator.language,
    };

    // Fetch IP
    let ip = "unknown";
    try {
      const res = await fetch("https://api.ipify.org?format=json");
      const data = await res.json();
      ip = data.ip;
    } catch {}

    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const newUser: AuthUser = {
      id, email: e, name: n, createdAt: now, lastLogin: now, loginCount: 1,
      device, ip,
    };
    const pwKey = `${e}:${hash(password)}`;
    users[pwKey] = newUser;
    users[emailKey] = newUser;
    writeUsers(users);
    sessionStorage.setItem(STORAGE_SESSION, JSON.stringify(newUser));
    setUser(newUser);
    router.replace("/");
    return null;
  }, [router]);

  const logout = useCallback(() => {
    sessionStorage.removeItem(STORAGE_SESSION);
    setUser(null);
    router.replace("/auth/login");
  }, [router]);

  const allUsers = useCallback((): AuthUser[] => {
    const users = readUsers();
    const seen = new Set<string>();
    const list: AuthUser[] = [];
    for (const [key, u] of Object.entries(users)) {
      if (key.startsWith("email:") && !seen.has(u.id)) {
        seen.add(u.id); list.push(u);
      }
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, allUsers }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
