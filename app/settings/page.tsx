"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useHabits, useHabitStore } from "@/lib/store";
import { Plus, Trash } from "@/components/icons";

const TASK_COLORS = [
  "#10b981", "#3b82f6", "#f59e0b", "#8b5cf6",
  "#ec4899", "#06b6d4", "#f97316", "#84cc16",
];

export default function SettingsPage() {
  const router = useRouter();
  const habits = useHabits();
  const addHabit = useHabitStore((s) => s.addHabit);
  const updateHabit = useHabitStore((s) => s.updateHabit);
  const deleteHabit = useHabitStore((s) => s.deleteHabit);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"daily" | "one_time">("daily");

  const activeHabits = habits.filter((h) => h.is_active);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    addHabit({ title: t, type });
    setTitle("");
  };

  return (
    <main className="mx-auto min-h-dvh max-w-[1400px] px-6 py-6 pb-20">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-extrabold tracking-tight text-[var(--foreground)]">Tasks</h1>
          <p className="mt-1 text-[11px] text-[var(--muted)]">Manage your habits & one-time tasks</p>
        </div>
        <button onClick={() => router.push("/admin/login")}
          className="rounded-xl border border-[var(--border)] bg-[var(--surface)]
                     px-4 py-2 text-[10px] font-semibold text-[var(--muted)]
                     hover:text-[var(--accent)] hover:border-[var(--accent)]
                     transition-all">
          Are you admin?
        </button>
      </header>

      {/* Add form */}
      <form onSubmit={submit} className="mb-4 flex gap-2">
        <input value={title} onChange={(e) => setTitle(e.target.value)}
          placeholder="New habit..."
          className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface)]
                     px-3.5 py-2.5 text-sm font-medium text-[var(--foreground)]
                     placeholder:text-[var(--muted)] outline-none focus:border-[var(--accent)]" />
        <select value={type} onChange={(e) => setType(e.target.value as "daily" | "one_time")}
          className="rounded-xl border border-[var(--border)] bg-[var(--surface)]
                     px-3 py-2.5 text-xs font-semibold text-[var(--foreground)] outline-none
                     cursor-pointer">
          <option value="daily">Daily</option>
          <option value="one_time">Once</option>
        </select>
        <button type="submit" disabled={!title.trim()}
          className="flex items-center gap-1.5 rounded-xl bg-[var(--accent)] px-4 py-2.5
                     text-xs font-semibold text-white transition-all hover:brightness-110
                     active:scale-[0.97] disabled:opacity-30">
          <Plus size={14} /> Add
        </button>
      </form>

      {/* Task list */}
      <section className="space-y-1.5">
        {activeHabits.length === 0 && (
          <p className="py-8 text-center text-xs text-[var(--muted)]">No tasks yet</p>
        )}
        {activeHabits.map((h, i) => {
          const color = TASK_COLORS[i % TASK_COLORS.length];
          return (
            <div key={h.id}
              className="flex items-center gap-3 rounded-xl border border-[var(--border)]
                         bg-[var(--surface)] px-3.5 py-3 transition-all hover:border-[var(--accent)]/20">
              <div className="h-3 w-3 flex-shrink-0 rounded-full"
                   style={{ backgroundColor: color }} />
              <input
                defaultValue={h.title}
                onBlur={(e) => {
                  const v = e.target.value.trim();
                  if (v && v !== h.title) updateHabit(h.id, { title: v });
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                }}
                className="flex-1 min-w-0 bg-transparent text-sm font-medium
                           text-[var(--foreground)] outline-none border-b border-transparent
                           focus:border-[var(--accent)] transition-colors"
              />
              <select
                defaultValue={h.type}
                onChange={(e) => updateHabit(h.id, { type: e.target.value as "daily" | "one_time" })}
                className="rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)]
                           px-2 py-1 text-[9px] font-semibold text-[var(--foreground)] outline-none">
                <option value="daily">Daily</option>
                <option value="one_time">Once</option>
              </select>
              <button onClick={() => deleteHabit(h.id)}
                className="rounded-lg p-1.5 text-[var(--muted)] hover:text-red-500 hover:bg-red-500/10
                           transition-all active:scale-90">
                <Trash size={14} />
              </button>
            </div>
          );
        })}
      </section>
    </main>
  );
}
