"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { useHabitStore, useHabits, useCurrentYear, formatDate, useStreaks, useTodayCompleted, useMonthlyProgress } from "@/lib/store";
import { useLang } from "@/lib/lang";
import { Settings, LogOut, ChevronLeft, ChevronRight, Zap, Target, TrendingUp, Calendar as CalIcon, Flame } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import InstallPWAButton from "@/components/InstallPWAButton";
import AddHabitInline from "@/components/AddHabitInline";
import { PieChart, Pie, Cell, BarChart, Bar, ResponsiveContainer, XAxis, Tooltip } from "recharts";

const THEME_COLORS = [
  "var(--pastel-mint)", "var(--pastel-peach)", "var(--pastel-blue)",
  "var(--pastel-yellow)", "var(--pastel-purple)", "var(--pastel-pink)",
];

// Helper to get all days in current view month
function getDaysArray(year: number, monthIndex: number) {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, i) => {
    const d = new Date(year, monthIndex, i + 1);
    return {
      date: formatDate(d),
      day: d.getDate(),
      dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
      isToday: formatDate(d) === formatDate(new Date())
    };
  });
}

export default function HomePage() {
  const { t } = useLang();
  const currentYear = useCurrentYear();
  const seed = useHabitStore(s => s.seedDefaultTasks);
  const fetchFromSupabase = useHabitStore(s => s.fetchFromSupabase);
  const isLoading = useHabitStore(s => s.isLoading);
  const habits = useHabits();

  const { currentStreak, maxStreak, totalContributions } = useStreaks();
  const { done, total: totalHabits, pct } = useTodayCompleted();
  const { activeDays, totalDays } = useMonthlyProgress();

  const [mounted, setMounted] = useState(false);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(new Date().getMonth());
  const router = useRouter();
  const { logout, user } = useAuth();

  const isArchive = currentYear !== new Date().getFullYear();
  const activeHabits = habits.filter(h => h.is_active);

  useEffect(() => { setMounted(true); seed(); }, [seed]);
  useEffect(() => { fetchFromSupabase(currentYear); }, [currentYear, fetchFromSupabase]);

  const days = useMemo(() => getDaysArray(currentYear, currentMonthIndex), [currentYear, currentMonthIndex]);

  const nextMonth = () => setCurrentMonthIndex(prev => Math.min(prev + 1, 11));
  const prevMonth = () => setCurrentMonthIndex(prev => Math.max(prev - 1, 0));

  // Chart Data preparation
  const donutData = [
    { name: 'Done', value: done, color: 'var(--accent)' },
    { name: 'Remaining', value: Math.max(0, totalHabits - done), color: 'var(--border)' }
  ];

  // Dummy activity data for the bar chart based on the current month's days
  const barData = useMemo(() => {
     return days.map(d => ({
         name: d.day.toString(),
         completed: Math.floor(Math.random() * activeHabits.length) // placeholder for real historical data
     }));
  }, [days, activeHabits.length]);

  if (!mounted || isLoading) {
    return (
      <main className="flex h-screen items-center justify-center bg-[var(--background)]">
        <div className="flex items-center gap-3">
            <div className="skeleton h-8 w-32 rounded-lg" />
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--accent-soft)]">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)]/90 px-6 py-4 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--pastel-mint)] border border-[var(--accent)] shadow-sm">
            <Zap className="h-5 w-5 text-emerald-700" fill="currentColor" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">{t("appTitle")}</h1>
            <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider">
               {new Date(currentYear, currentMonthIndex).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-xl bg-[var(--surface-secondary)] p-1 border border-[var(--border)]">
            <button onClick={prevMonth} disabled={currentMonthIndex === 0} className="rounded-md p-1.5 hover:bg-[var(--border)] disabled:opacity-30 transition-colors">
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-mono font-bold px-2 text-[var(--muted-strong)]">{currentMonthIndex + 1}/12</span>
            <button onClick={nextMonth} disabled={currentMonthIndex === 11} className="rounded-md p-1.5 hover:bg-[var(--border)] disabled:opacity-30 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>

          <InstallPWAButton />

          <button onClick={() => router.push("/settings")} className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] hover:bg-[var(--border)] transition-all text-[var(--muted-strong)]">
             <Settings size={16} />
          </button>
          <button onClick={logout} className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 border border-red-100 hover:bg-red-100 transition-all text-red-500">
             <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <div className="flex-1 overflow-auto p-6 space-y-6 max-w-[1600px] mx-auto w-full">

        {/* Top Summary Section */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">

            {/* Key Metrics */}
            <div className="col-span-1 flex flex-col gap-4">
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--pastel-blue)] p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-[11px] font-bold uppercase tracking-wider text-blue-800">Current Streak</h3>
                        <Flame size={16} className="text-orange-500" />
                    </div>
                    <div className="text-4xl font-black text-blue-900">{currentStreak} <span className="text-sm font-bold text-blue-700 opacity-70">days</span></div>
                </div>
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--pastel-yellow)] p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-[11px] font-bold uppercase tracking-wider text-yellow-800">Monthly Progress</h3>
                        <TrendingUp size={16} className="text-yellow-700" />
                    </div>
                    <div className="text-4xl font-black text-yellow-900">{Math.round((activeDays / Math.max(1, totalDays)) * 100)}<span className="text-2xl">%</span></div>
                    <div className="mt-1 text-[10px] font-semibold text-yellow-800/70">{activeDays} / {totalDays} days</div>
                </div>
            </div>

            {/* Charts Panel */}
            <div className="col-span-1 md:col-span-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm flex flex-col md:flex-row gap-6">

                {/* Donut Chart - Today's Progress */}
                <div className="flex-1 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-[var(--border)] pb-6 md:pb-0 md:pr-6">
                     <h3 className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-strong)] w-full text-left mb-2">Today's Completion</h3>
                     <div className="relative h-32 w-32 mt-2">
                         <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={donutData} innerRadius={35} outerRadius={55} paddingAngle={2} dataKey="value" stroke="none">
                                    {donutData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                            </PieChart>
                         </ResponsiveContainer>
                         <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-xl font-black text-[var(--foreground)]">{pct}%</span>
                         </div>
                     </div>
                     <div className="mt-3 flex gap-4 text-[10px] font-bold text-[var(--muted)]">
                         <div className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[var(--accent)]"></span> Done: {done}</div>
                         <div className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[var(--border-strong)]"></span> Left: {Math.max(0, totalHabits - done)}</div>
                     </div>
                </div>

                {/* Bar Chart - Month Activity */}
                <div className="flex-[2] flex flex-col">
                     <h3 className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-strong)] mb-4">Activity Dynamics</h3>
                     <div className="flex-1 min-h-[140px] w-full">
                         <ResponsiveContainer width="100%" height="100%">
                             <BarChart data={barData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                 <Tooltip cursor={{fill: 'var(--surface-secondary)'}} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', fontSize: '12px', fontWeight: 'bold' }} />
                                 <Bar dataKey="completed" fill="var(--pastel-mint)" radius={[4, 4, 0, 0]} />
                                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--muted)', fontWeight: 600 }} dy={10} />
                             </BarChart>
                         </ResponsiveContainer>
                     </div>
                </div>
            </div>
        </section>


        {/* Spreadsheet Section */}
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-md overflow-hidden">
            <div className="bg-[var(--pastel-purple)] p-3 border-b border-[var(--border)] flex justify-between items-center">
                <h2 className="text-xs font-black uppercase tracking-widest text-purple-900 flex items-center gap-2">
                    <Target size={14} /> {t("habitTracker")} Matrix
                </h2>
                {!isArchive && (
                    <div className="w-48"><AddHabitInline /></div>
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr>
                            <th className="sticky left-0 z-20 min-w-[220px] bg-[var(--surface-secondary)] p-3 text-left font-bold text-[var(--muted-strong)] uppercase tracking-wider text-[10px] border-b border-r border-[var(--border)] shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                                Habit / Task
                            </th>
                            <th className="min-w-[70px] bg-[var(--surface-secondary)] p-3 text-center font-bold text-[var(--muted-strong)] uppercase tracking-wider text-[10px] border-b border-r border-[var(--border)]">
                                % Done
                            </th>
                            {days.map((d) => (
                                <th key={d.date} className={`min-w-[42px] p-2 text-center border-b border-[var(--border)] ${d.isToday ? 'bg-[var(--accent-soft)]' : 'bg-[var(--surface)]'}`}>
                                    <div className="flex flex-col items-center gap-0.5">
                                        <span className={`text-[9px] font-bold uppercase tracking-wider ${d.isToday ? 'text-[var(--accent)]' : 'text-[var(--muted)]'}`}>
                                            {d.dayName}
                                        </span>
                                        <div className={`flex h-6 w-6 items-center justify-center rounded text-[11px] font-black ${d.isToday ? 'bg-[var(--accent)] text-white shadow-sm' : 'text-[var(--foreground)]'}`}>
                                            {d.day}
                                        </div>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {activeHabits.length === 0 ? (
                             <tr>
                                 <td colSpan={days.length + 2} className="p-12 text-center text-[var(--muted)] border-b border-[var(--border)] font-medium text-xs">
                                     No habits found. Add one above!
                                 </td>
                             </tr>
                        ) : (
                            activeHabits.map((habit, i) => (
                                <HabitRow
                                    key={habit.id}
                                    habit={habit}
                                    days={days}
                                    colorIndex={i}
                                    isArchive={isArchive}
                                />
                            ))
                        )}

                    </tbody>
                </table>
            </div>
        </section>
      </div>
    </main>
  );
}

// ============================================================
// Habit Row Component
// ============================================================
function HabitRow({ habit, days, colorIndex, isArchive }: { habit: any, days: any[], colorIndex: number, isArchive: boolean }) {
    const color = THEME_COLORS[colorIndex % THEME_COLORS.length];

    // Calculate row completion %
    const yearsData = useHabitStore((s) => s.yearsData);
    const currentYear = useHabitStore((s) => s.currentYear);

    const rowPct = useMemo(() => {
        let rowDone = 0;
        const yearData = yearsData[currentYear] || {};
        const map = yearData.completedHabitsByDate || {};

        days.forEach(d => {
            const ids = map[d.date] || [];
            if (ids.includes(habit.id)) rowDone++;
        });
        return days.length > 0 ? Math.round((rowDone / days.length) * 100) : 0;
    }, [yearsData, currentYear, days, habit.id]);

    return (
        <tr className="group hover:bg-[var(--surface-secondary)] transition-colors">
            <td className="sticky left-0 z-10 bg-[var(--surface)] group-hover:bg-[var(--surface-secondary)] p-3 border-b border-r border-[var(--border)] shadow-[2px_0_5px_rgba(0,0,0,0.02)] transition-colors">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded shadow-sm border border-black/10" style={{ backgroundColor: color }} />
                        <span className="font-bold text-[12px] text-[var(--foreground)] truncate">{habit.title}</span>
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--muted)] pl-4.5">
                        {habit.type}
                    </span>
                </div>
            </td>
            <td className="p-3 border-b border-r border-[var(--border)] text-center font-mono text-xs font-bold text-[var(--muted-strong)]">
                {rowPct}%
            </td>
            {days.map((d) => (
                <DayCell
                    key={d.date}
                    habitId={habit.id}
                    date={d.date}
                    isArchive={isArchive}
                    color={color}
                    isToday={d.isToday}
                />
            ))}
        </tr>
    );
}

// ============================================================
// Day Cell Component
// ============================================================
function DayCell({ habitId, date, isArchive, color, isToday }: { habitId: string, date: string, isArchive: boolean, color: string, isToday: boolean }) {
    const isCompleted = useHabitStore((s) => {
      const yearData = s.yearsData[s.currentYear] || {};
      const map = yearData.completedHabitsByDate || {};
      const ids = map[date] || [];
      return ids.includes(habitId);
    });

    const toggleCompletion = useHabitStore(s => s.toggleHabitCompletion);

    const handleToggle = () => {
        if (isArchive) return;
        toggleCompletion(habitId, date);
    };

    return (
        <td className={`p-1.5 border-b border-r border-[var(--border)] text-center transition-colors ${isToday ? 'bg-[var(--accent-soft)]/50' : ''}`}>
            <button
                onClick={handleToggle}
                disabled={isArchive}
                className="mx-auto flex h-full w-full min-h-[28px] items-center justify-center rounded transition-all focus:outline-none"
            >
                {isCompleted ? (
                    <div className="h-full w-full rounded-[4px] shadow-sm border border-black/5 animate-[scaleIn_0.2s_ease-out]" style={{ backgroundColor: color }}>
                        {/* Optional subtle checkmark icon can go here, but colors often suffice for heatmap style */}
                    </div>
                ) : (
                    <div className={`h-full w-full rounded-[4px] border border-transparent transition-colors ${isToday ? 'hover:border-[var(--accent)]/30 hover:bg-[var(--accent)]/10' : 'hover:border-[var(--border-strong)] hover:bg-[var(--surface-tertiary)]'}`} />
                )}
            </button>
        </td>
    );
}
