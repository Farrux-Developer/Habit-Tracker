"use client";

import {
  useHabits,
  useStreaks,
  useTodayCompleted,
  useMonthlyProgress,
  useDateCompletionCount,
  useHabitStore,
  formatDate,
} from "@/lib/store";
import { Flame, Trophy, TrendingUp, Sparkles } from "@/components/icons";

// ============================================================
// DonutRing — SVG circular progress
// ============================================================
function DonutRing({
  pct, size, stroke, color, bg, label, sub,
}: {
  pct: number; size: number; stroke: number; color: string;
  bg: string; label: string; sub: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.min(100, Math.max(0, pct));
  const offset = c - (clamped / 100) * c;
  const cx = size / 2;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cx} r={r} fill="none" stroke={bg} strokeWidth={stroke} />
        <circle cx={cx} cy={cx} r={r} fill="none" stroke={color} strokeWidth={stroke}
                strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
                transform={`rotate(-90 ${cx} ${cx})`}
                className="transition-[stroke-dashoffset]"
                style={{ transitionDuration: "1s", transitionTimingFunction: "cubic-bezier(0.4,0,0.2,1)" }} />
        <text x={cx} y={cx - 4} textAnchor="middle" dominantBaseline="central"
              className="fill-[var(--foreground)] font-extrabold tabular-nums"
              style={{ fontSize: size * 0.22 }}>
          {clamped}%
        </text>
        <text x={cx} y={cx + 10} textAnchor="middle" dominantBaseline="central"
              className="fill-[var(--muted)] font-medium"
              style={{ fontSize: size * 0.1 }}>
          {sub}
        </text>
      </svg>
      <span className="text-[10px] font-semibold tracking-wide text-[var(--muted)] uppercase">{label}</span>
    </div>
  );
}

// ============================================================
// StatsPage
// ============================================================
export default function StatsPage() {
  const habits = useHabits();
  const { currentStreak, maxStreak, totalContributions } = useStreaks();
  const { done, total, pct } = useTodayCompleted();
  const { done: monthlyDone, total: monthlyTotal, pct: monthlyPct } = useMonthlyProgress();

  // Weekly activity — reactive via selector
  const weeklyActive = useHabitStore((s) => {
    const map = s.yearsData[s.currentYear]?.completedHabitsByDate ?? {};
    let active = 0;
    const now = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const statuses = map[formatDate(d)] || {};
      const c = Object.values(statuses).filter(status => status === "done").length;
      if (c > 0) active++;
    }
    return active;
  });

  const todayStr = formatDate(new Date());
  const todayCount = useDateCompletionCount(todayStr);
  const weeklyPct = Math.round((weeklyActive / 7) * 100);

  return (
    <main className="mx-auto flex min-h-dvh max-w-[1400px] flex-col px-6 py-6 pb-20">
      {/* Header */}
      <header className="mb-6 flex flex-col items-center gap-2">
        <h1 className="text-lg font-extrabold tracking-tight text-[var(--foreground)]">Statistics</h1>
        <p className="text-[11px] font-medium text-[var(--muted)]">
          Your habit journey at a glance
        </p>
      </header>

      {/* Rings row — 3 donuts */}
      <section className="mb-6 grid grid-cols-3 gap-4">
        <DonutRing pct={pct} size={100} stroke={8}
                   color="var(--accent)" bg="var(--border)"
                   label="Today" sub={`${done}/${total}`} />
        <DonutRing pct={weeklyPct} size={100} stroke={8}
                   color="var(--accent-secondary)" bg="var(--border)"
                   label="Week" sub={`${weeklyActive}/7`} />
        <DonutRing pct={monthlyPct} size={100} stroke={8}
                   color="#a855f7" bg="var(--border)"
                   label="Month" sub={`${monthlyDone}/${monthlyTotal}`} />
      </section>

      {/* Big stat cards */}
      <section className="mb-4 grid grid-cols-2 gap-3">
        <StatCard
          icon={<Flame size={20} className="text-[var(--streak-fire)]" />}
          value={currentStreak}
          label="Current Streak"
          accent
        />
        <StatCard
          icon={<Trophy size={20} className="text-[var(--accent-secondary)]" />}
          value={maxStreak}
          label="Best Streak"
        />
        <StatCard
          icon={<TrendingUp size={20} className="text-[var(--accent)]" />}
          value={totalContributions}
          label="Total Tasks"
        />
        <StatCard
          icon={<Sparkles size={20} className="text-purple-400" />}
          value={habits.filter((h) => h.is_active).length}
          label="Active Habits"
        />
      </section>

      {/* Today breakdown */}
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4"
               style={{ boxShadow: "var(--shadow-sm)" }}>
        <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
          Today — {todayStr}
        </h2>
        <div className="space-y-1.5">
          {habits.filter((h) => h.is_active).map((h) => (
            <TodayHabitRow key={h.id} habitId={h.id} title={h.title} date={todayStr} />
          ))}
        </div>
      </section>
    </main>
  );
}

// ============================================================
// Helpers
// ============================================================
function StatCard({ icon, value, label, accent }: {
  icon: React.ReactNode; value: number; label: string; accent?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[var(--border)]
                    bg-[var(--surface)] p-3.5" style={{ boxShadow: "var(--shadow-sm)" }}>
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg
                      bg-[var(--surface-secondary)]">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className={`text-xl font-extrabold tabular-nums leading-none ${accent ? "text-[var(--accent)]" : "text-[var(--foreground)]"}`}>
          {value.toLocaleString()}
        </span>
        <span className="text-[10px] font-medium text-[var(--muted)]">{label}</span>
      </div>
    </div>
  );
}

function TodayHabitRow({ habitId, title, date }: { habitId: string; title: string; date: string }) {
  const status = useHabitStore((s) => {
    const yd = s.yearsData[s.currentYear];
    const statuses = yd?.completedHabitsByDate[date] || {};
    return statuses[habitId] || "none";
  });
  const isCompleted = status === "done";
  return (
    <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
      isCompleted ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "bg-[var(--surface-secondary)] text-[var(--muted)]"
    }`}>
      <span className={`h-2 w-2 rounded-full flex-shrink-0 ${isCompleted ? "bg-[var(--accent)]" : "bg-[var(--border)]"}`} />
      {title}
      {isCompleted && <span className="ml-auto text-[9px]">✓</span>}
    </div>
  );
}

function useStoreSelector<T>(selector: (s: ReturnType<typeof useHabitStore.getState>) => T): T {
  return useHabitStore(selector);
}
