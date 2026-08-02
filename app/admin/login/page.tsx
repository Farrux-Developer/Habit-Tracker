"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminLogin } from "@/lib/admin-auth";
import { Lock } from "@/components/icons";

export default function AdminLoginPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminLogin(name.trim(), password)) {
      router.push("/admin/dashboard");
    } else {
      setError("Invalid credentials");
    }
  };

  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <form onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-[var(--border)]
                   bg-[var(--surface)] p-8" style={{ boxShadow: "var(--shadow-md)" }}>
        <div className="mb-6 flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent-soft)]">
            <Lock size={22} className="text-[var(--accent)]" />
          </div>
          <h1 className="text-lg font-extrabold text-[var(--foreground)]">Admin Panel</h1>
          <p className="text-[11px] text-[var(--muted)]">Enter credentials to continue</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-500">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <input value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)]
                       px-4 py-3 text-sm font-medium text-[var(--foreground)]
                       placeholder:text-[var(--muted)] outline-none focus:border-[var(--accent)]" />
          <input value={password} onChange={(e) => setPassword(e.target.value)}
            type="password" placeholder="Password"
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)]
                       px-4 py-3 text-sm font-medium text-[var(--foreground)]
                       placeholder:text-[var(--muted)] outline-none focus:border-[var(--accent)]" />
          <button type="submit"
            className="w-full rounded-xl bg-[var(--accent)] py-3 text-sm font-bold text-white
                       transition-all hover:brightness-110 active:scale-[0.98]">
            Sign In
          </button>
        </div>
      </form>
    </main>
  );
}
