"use client";

const TOKEN_KEY = "admin-auth-token";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  ip: string;
  country: string;
  status: "active" | "banned";
  banUntil?: string;
  createdAt: string;
}

// ============================================================
// Auth
// ============================================================
export function adminLogin(name: string, password: string): boolean {
  if (name === "admin" && password === "admin12345") {
    sessionStorage.setItem(TOKEN_KEY, btoa(`admin:${Date.now()}`));
    return true;
  }
  return false;
}

export function isAdminAuth(): boolean {
  if (typeof window === "undefined") return false;
  return !!sessionStorage.getItem(TOKEN_KEY);
}

export function adminLogout() {
  sessionStorage.removeItem(TOKEN_KEY);
}

// ============================================================
// Mock users DB (localStorage)
// ============================================================
const USERS_KEY = "admin-mock-users";

function getDefaultUsers(): AdminUser[] {
  return [
    { id: "u1", name: "Alice", email: "alice@example.com", ip: "192.168.1.10", country: "Russia", status: "active", createdAt: "2026-01-15" },
    { id: "u2", name: "Bob", email: "bob@example.com", ip: "10.0.0.5", country: "USA", status: "active", createdAt: "2026-03-22" },
    { id: "u3", name: "Charlie", email: "charlie@example.com", ip: "172.16.0.1", country: "Germany", status: "banned", banUntil: "2027-01-01", createdAt: "2026-05-10" },
    { id: "u4", name: "Diana", email: "diana@example.com", ip: "192.168.2.20", country: "France", status: "active", createdAt: "2026-07-01" },
  ];
}

function readUsers(): AdminUser[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : getDefaultUsers();
  } catch {
    return getDefaultUsers();
  }
}

function writeUsers(users: AdminUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getUsers(): AdminUser[] {
  return readUsers();
}

export function deleteUser(id: string) {
  const users = readUsers().filter((u) => u.id !== id);
  writeUsers(users);
}

export function banUser(id: string, days: number) {
  const until = new Date();
  until.setDate(until.getDate() + days);
  const users = readUsers().map((u) =>
    u.id === id
      ? { ...u, status: "banned" as const, banUntil: until.toISOString().split("T")[0] }
      : u,
  );
  writeUsers(users);
}

export function unbanUser(id: string) {
  const users = readUsers().map((u) =>
    u.id === id ? { ...u, status: "active" as const, banUntil: undefined } : u,
  );
  writeUsers(users);
}
