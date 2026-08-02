"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { Lock, Zap } from "@/components/icons";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = login(email.trim(), password);
    if (err) setError(err);
  };

  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl
                          bg-[var(--accent)] shadow-[0_0_30px_var(--accent-glow)]">
            <Zap size={22} className="text-white" />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-[var(--foreground)]">
            Life is a Game
          </h1>
          <p className="text-[11px] text-[var(--muted)]">Sign in to continue</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}
          className="rounded-2xl border border-[var(--border)]/60 bg-[var(--surface)]/80
                     backdrop-blur-xl p-6" style={{ boxShadow: "var(--shadow-md)" }}>
          {error && (
            <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2
                            text-[11px] font-medium text-red-500">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <input value={email} onChange={e => setEmail(e.target.value)}
              type="email" placeholder="Email" autoComplete="email"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)]
                         px-4 py-3 text-sm font-medium text-[var(--foreground)]
                         placeholder:text-[var(--muted)] outline-none focus:border-[var(--accent)]
                         transition-colors" />
            <input value={password} onChange={e => setPassword(e.target.value)}
              type="password" placeholder="Password" autoComplete="current-password"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)]
                         px-4 py-3 text-sm font-medium text-[var(--foreground)]
                         placeholder:text-[var(--muted)] outline-none focus:border-[var(--accent)]
                         transition-colors" />
            <button type="submit"
              className="w-full rounded-xl bg-[var(--accent)] py-3 text-sm font-bold text-white
                         transition-all hover:brightness-110 active:scale-[0.98]
                         shadow-[0_4px_20px_var(--accent-glow)]">
              Sign In
            </button>
          </div>

          <p className="mt-4 text-center text-[11px] text-[var(--muted)]">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="font-semibold text-[var(--accent)] hover:underline">
              Register
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
