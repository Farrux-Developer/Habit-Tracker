"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useLang, LangSwitcher } from "@/lib/lang";
import {
    useHabitStore,
    useHabits,
    useStreaks,
    useTodayCompleted,
    useCurrentYear,
    useAllYears,
    useMonthlyProgress,
} from "@/lib/store";
import { InstallPWAButton } from "@/components/InstallPWAButton";
import { ChevronDown, Lock, Zap, Flame, Target, Trophy, Chart } from "@/components/icons";

// New Components
import { TrendChart } from "@/components/charts/TrendChart";
import { DonutChartRatio } from "@/components/charts/DonutChartRatio";
import { TopHabitsList } from "@/components/charts/TopHabitsList";
import { HabitMatrix } from "@/components/matrix/HabitMatrix";
import { StatCard } from "@/components/ui/StatCard";

export default function HomePage() {
  const { t } = useLang();
  const currentYear = useCurrentYear();
  const seed = useHabitStore(s => s.seedDefaultTasks);
  const fetchFromSupabase = useHabitStore(s => s.fetchFromSupabase);
  const isLoading = useHabitStore(s => s.isLoading);
  const habits = useHabits();

  const { currentStreak, maxStreak } = useStreaks();
  const { done: todayDone, skipped: todaySkipped, none: todayNone, pct: todayPct } = useTodayCompleted();
  const { done: monthlyDone, skipped: monthlySkipped, none: monthlyNone, total: monthlyTotal, pct: monthlyPct } = useMonthlyProgress();

  const [mounted, setMounted] = useState(false);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(new Date().getMonth());
  const router = useRouter();
  const { logout, user } = useAuth();

  const isArchive = currentYear !== new Date().getFullYear();

  useEffect(() => {
      setMounted(true);
      // Call only once on mount to prevent loops, seed function checks `seededDefaults` internally
      seed();
  }, [seed]);

  useEffect(() => {
      // Only fetch when year changes to prevent infinite loops from object referential inequality
      fetchFromSupabase(currentYear);
  }, [currentYear]); // Removed fetchFromSupabase to prevent loop if reference changes

  const nextMonth = () => setCurrentMonthIndex(prev => Math.min(prev + 1, 11));
  const prevMonth = () => setCurrentMonthIndex(prev => Math.max(prev - 1, 0));

  if (!mounted) return null;

  return (
    <main className="min-h-dvh flex flex-col bg-[var(--background)]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)] text-white shadow-sm shadow-[var(--accent-glow)]">
            <Zap className="h-5 w-5 text-emerald-700" style={{ fill: "currentColor" }} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">{t("appTitle")}</h1>
            <div className="flex items-center gap-2 mt-0.5">
                <button onClick={prevMonth} disabled={currentMonthIndex === 0} className="text-[var(--muted)] hover:text-[var(--foreground)] disabled:opacity-30 disabled:pointer-events-none transition-colors">
                    <ChevronDown size={14} className="rotate-90" />
                </button>
                <span className="text-xs font-bold text-[var(--muted-strong)] uppercase tracking-wider min-w-[100px] text-center">
                    {new Date(currentYear, currentMonthIndex).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </span>
                <button onClick={nextMonth} disabled={currentMonthIndex === 11} className="text-[var(--muted)] hover:text-[var(--foreground)] disabled:opacity-30 disabled:pointer-events-none transition-colors">
                    <ChevronDown size={14} className="-rotate-90" />
                </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <InstallPWAButton />
          <LangSwitcher />
          {user?.email === "admin@admin.com" && (
            <button onClick={() => router.push("/admin/login")} className="flex items-center justify-center h-8 w-8 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors" title="Admin">
              <Lock size={14} />
            </button>
          )}
        </div>
      </header>

      {/* Main Layout - 3 Zones */}
      <div className="flex-1 overflow-auto p-4 sm:p-6 w-full max-w-[1600px] mx-auto flex flex-col lg:flex-row gap-6">

          {/* Left/Center Column (Main Content) */}
          <div className="flex-1 flex flex-col gap-6 min-w-0">

              {/* Quick Stats & Trend Chart Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
                  <StatCard
                      title={t("currentStreak")}
                      value={currentStreak}
                      subtitle={t("days")}
                      icon={<Flame size={20} className="text-orange-500" />}
                      colorClass="bg-[var(--pastel-yellow)]/50 border-yellow-500/20"
                  />

                  <StatCard
                      title={t("monthlyProgress")}
                      value={`${monthlyPct}%`}
                      subtitle={`${monthlyDone} / ${monthlyTotal} tasks`}
                      icon={<Trophy size={20} className="text-purple-500" />}
                      colorClass="bg-[var(--pastel-purple)]/50 border-purple-500/20"
                  />

                  {/* Trend Chart */}
                  <div className="col-span-1 md:col-span-1 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm flex flex-col">
                      <div className="flex items-center justify-between mb-2 shrink-0">
                          <h3 className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-strong)]">{t("activityDynamics")}</h3>
                          <Chart size={16} className="text-[var(--muted)]" />
                      </div>
                      <div className="flex-1 min-h-[60px]">
                          <TrendChart currentMonthIndex={currentMonthIndex} currentYear={currentYear} />
                      </div>
                  </div>
              </div>

              {/* Matrix Table */}
              <div className="flex-1 flex flex-col min-h-[400px]">
                  <HabitMatrix currentYear={currentYear} currentMonthIndex={currentMonthIndex} isArchive={isArchive} />
              </div>
          </div>

          {/* Right Column (Analytics) */}
          <div className="w-full lg:w-[320px] xl:w-[380px] shrink-0 flex flex-col gap-6">

              {/* Today's Donut */}
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-strong)] text-center mb-4">{t("todaysCompletion")}</h3>
                  <DonutChartRatio done={todayDone} skipped={todaySkipped} none={todayNone} pct={todayPct} />

                  <div className="mt-6 flex justify-center gap-4 text-[10px] font-bold text-[var(--muted-strong)]">
                      <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[var(--accent)]"></span> {todayDone}</div>
                      <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-red-500"></span> {todaySkipped}</div>
                      <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[var(--surface-secondary)] border border-[var(--border)]"></span> {todayNone}</div>
                  </div>
              </div>

              {/* Top Habits List */}
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm flex-1">
                  <TopHabitsList limit={5} />
              </div>
          </div>

      </div>
    </main>
  );
}
