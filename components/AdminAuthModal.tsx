"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminLogin } from "@/lib/admin-auth";
import { checkRateLimit } from "@/lib/security";
import { useLang } from "@/lib/lang";
import { Lock, X, ShieldAlert, KeyRound, User } from "@/components/icons";

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminAuthModal({ isOpen, onClose }: AdminAuthModalProps) {
  const { t } = useLang();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Rate limiting check: max 5 attempts per 60 seconds
    const allowed = checkRateLimit("admin-login", 5, 60000);
    if (!allowed) {
      setError(t("tooManyAttempts"));
      return;
    }

    const success = adminLogin(username.trim(), password.trim());
    if (success) {
      setUsername("");
      setPassword("");
      onClose();
      router.push("/admin/dashboard");
    } else {
      setError(t("invalidAdmin"));
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-[fadeIn_0.2s_ease-out]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.25)] backdrop-blur-2xl transition-all animate-[scaleIn_0.2s_ease-out]"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow:
            "0 20px 40px -15px rgba(16,185,129,0.15), inset 0 1px 0 rgba(255,255,255,0.1)",
        }}
      >
        {/* Modal Header */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 shadow-inner">
              <Lock size={18} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[var(--foreground)] leading-none">
                {t("adminModalTitle")}
              </h3>
              <span className="text-[10px] font-semibold text-[var(--muted)]">
                Access Level 1
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-[var(--muted)] hover:bg-[var(--surface-secondary)] hover:text-[var(--foreground)] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-semibold text-red-500">
            <ShieldAlert size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-[var(--foreground)]">
              <User size={13} className="text-[var(--muted)]" />
              {t("username")}
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] px-3.5 py-2.5 text-sm font-medium text-[var(--foreground)] placeholder:text-[var(--muted)] outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-[var(--foreground)]">
              <KeyRound size={13} className="text-[var(--muted)]" />
              {t("password")}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] px-3.5 py-2.5 text-sm font-medium text-[var(--foreground)] placeholder:text-[var(--muted)] outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              required
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full rounded-xl bg-emerald-500 py-2.5 text-xs font-bold text-white shadow-lg transition-all hover:bg-emerald-600 active:scale-95"
              style={{
                boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)",
              }}
            >
              {t("login")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
