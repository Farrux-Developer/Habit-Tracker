"use client";

import React, { useMemo, useState } from "react";
import { useHabitStore, useHabits, formatDate } from "@/lib/store";
import { useLang } from "@/lib/lang";
import { DayCheckbox } from "@/components/ui/DayCheckbox";
import { Target, Plus } from "@/components/icons";
import AddHabitInline from "@/components/AddHabitInline";
import { EmptyState } from "@/components/ui/EmptyState";

const THEME_COLORS = [
    "#10b981", "#3b82f6", "#f59e0b", "#8b5cf6",
    "#ec4899", "#06b6d4", "#f97316", "#84cc16",
];

const WEEK_COLORS = [
    "bg-[var(--pastel-blue)]/30",
    "bg-[var(--pastel-purple)]/30",
    "bg-[var(--pastel-mint)]/30",
    "bg-[var(--pastel-yellow)]/30",
    "bg-[var(--pastel-blue)]/30"
];

function getDaysInMonth(year: number, monthIndex: number) {
    const date = new Date(year, monthIndex, 1);
    const days = [];
    const todayStr = formatDate(new Date());

    let weekIndex = 0;
    while (date.getMonth() === monthIndex) {
        const dayOfWeek = date.getDay();
        // Start new week on Monday (1)
        if (dayOfWeek === 1 && days.length > 0) {
            weekIndex++;
        }

        days.push({
            date: formatDate(date),
            day: date.getDate(),
            dayName: date.toLocaleDateString("en-US", { weekday: "short" }).charAt(0),
            isToday: formatDate(date) === todayStr,
            weekIndex
        });
        date.setDate(date.getDate() + 1);
    }
    return days;
}

export function HabitMatrix({ currentYear, currentMonthIndex, isArchive }: { currentYear: number, currentMonthIndex: number, isArchive: boolean }) {
    const { t } = useLang();
    const habits = useHabits();
    const activeHabits = habits.filter(h => h.is_active);
    const [viewMode, setViewMode] = useState<"week" | "month">("week");

    const allDays = useMemo(() => getDaysInMonth(currentYear, currentMonthIndex), [currentYear, currentMonthIndex]);

    // Determine which days to show based on view mode
    const displayedDays = useMemo(() => {
        if (viewMode === "month") return allDays;

        // For week view, find the current week or default to week 0
        const todayStr = formatDate(new Date());
        const currentMonthMatches = new Date().getFullYear() === currentYear && new Date().getMonth() === currentMonthIndex;

        if (currentMonthMatches) {
            const todayItem = allDays.find(d => d.isToday);
            if (todayItem) {
                return allDays.filter(d => d.weekIndex === todayItem.weekIndex);
            }
        }
        // If not current month, just show first week
        return allDays.filter(d => d.weekIndex === 0);
    }, [allDays, viewMode, currentYear, currentMonthIndex]);

    return (
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-md overflow-hidden flex flex-col h-full">
            <div className="bg-[var(--pastel-purple)] p-3 border-b border-[var(--border)] flex flex-wrap gap-3 justify-between items-center shrink-0">
                <h2 className="text-xs font-black uppercase tracking-widest text-purple-900 flex items-center gap-2">
                    <Target size={14} /> {t("habitTracker")}
                </h2>

                <div className="flex items-center gap-3">
                    <div className="flex bg-[var(--surface)]/50 rounded-lg p-0.5 border border-purple-900/10">
                        <button
                            onClick={() => setViewMode("week")}
                            className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${viewMode === 'week' ? 'bg-white text-purple-900 shadow-sm' : 'text-purple-900/60 hover:text-purple-900'}`}
                        >
                            {t("weekView")}
                        </button>
                        <button
                            onClick={() => setViewMode("month")}
                            className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${viewMode === 'month' ? 'bg-white text-purple-900 shadow-sm' : 'text-purple-900/60 hover:text-purple-900'}`}
                        >
                            {t("monthView")}
                        </button>
                    </div>

                    {!isArchive && (
                        <div className="w-40 sm:w-48"><AddHabitInline /></div>
                    )}
                </div>
            </div>

            <div className="overflow-x-auto flex-1">
                {activeHabits.length === 0 ? (
                     <EmptyState onAdd={() => document.getElementById("add-habit-input")?.focus()} />
                ) : (
                    <table className="w-full border-collapse text-sm min-w-max">
                        <thead>
                            <tr>
                                <th className="sticky left-0 z-20 min-w-[200px] bg-[var(--surface-secondary)] p-3 text-left font-bold text-[var(--muted-strong)] uppercase tracking-wider text-[10px] border-b border-r border-[var(--border)] shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                                    Habit / Task
                                </th>
                                <th className="min-w-[60px] bg-[var(--surface-secondary)] p-3 text-center font-bold text-[var(--muted-strong)] uppercase tracking-wider text-[10px] border-b border-r border-[var(--border)]">
                                    %
                                </th>
                                {displayedDays.map((d) => {
                                    const weekBg = viewMode === "month" ? WEEK_COLORS[d.weekIndex % WEEK_COLORS.length] : 'bg-[var(--surface)]';
                                    return (
                                        <th key={d.date} className={`min-w-[42px] p-2 text-center border-b border-[var(--border)] ${d.isToday ? 'bg-[var(--accent-soft)]' : weekBg}`}>
                                            <div className="flex flex-col items-center gap-0.5">
                                                <span className={`text-[9px] font-bold uppercase tracking-wider ${d.isToday ? 'text-[var(--accent)]' : 'text-[var(--muted)]'}`}>
                                                    {d.dayName}
                                                </span>
                                                <div className={`flex h-6 w-6 items-center justify-center rounded text-[11px] font-black ${d.isToday ? 'bg-[var(--accent)] text-white shadow-sm' : 'text-[var(--foreground)]'}`}>
                                                    {d.day}
                                                </div>
                                            </div>
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {activeHabits.map((habit, i) => (
                                <HabitMatrixRow
                                    key={habit.id}
                                    habit={habit}
                                    days={displayedDays}
                                    colorIndex={i}
                                    isArchive={isArchive}
                                    viewMode={viewMode}
                                />
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </section>
    );
}

function HabitMatrixRow({ habit, days, colorIndex, isArchive, viewMode }: { habit: any, days: any[], colorIndex: number, isArchive: boolean, viewMode: string }) {
    const color = THEME_COLORS[colorIndex % THEME_COLORS.length];

    const yearsData = useHabitStore((s) => s.yearsData);
    const currentYear = useHabitStore((s) => s.currentYear);

    // Calculate row completion % strictly for the displayed days
    const rowPct = useMemo(() => {
        let rowDone = 0;
        const yearData = yearsData[currentYear] || {};
        const map = yearData.completedHabitsByDate || {};

        days.forEach(d => {
            const statuses = map[d.date] || {};
            if (statuses[habit.id] === "done") rowDone++;
        });
        return days.length > 0 ? Math.round((rowDone / days.length) * 100) : 0;
    }, [yearsData, currentYear, days, habit.id]);

    const statuses = useHabitStore(s => s.yearsData[currentYear]?.completedHabitsByDate || {});

    return (
        <tr className="group hover:bg-[var(--surface-secondary)] transition-colors">
            <td className="sticky left-0 z-10 bg-[var(--surface)] group-hover:bg-[var(--surface-secondary)] p-3 border-b border-r border-[var(--border)] shadow-[2px_0_5px_rgba(0,0,0,0.02)] transition-colors">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded shadow-sm border border-black/10 shrink-0" style={{ backgroundColor: color }} />
                        <span className="font-bold text-[12px] text-[var(--foreground)] truncate max-w-[160px]">{habit.title}</span>
                    </div>
                </div>
            </td>
            <td className="p-3 border-b border-r border-[var(--border)] text-center font-mono text-xs font-bold text-[var(--muted-strong)]">
                {rowPct}%
            </td>
            {days.map((d) => {
                const weekBg = viewMode === "month" ? WEEK_COLORS[d.weekIndex % WEEK_COLORS.length] : '';
                return (
                    <DayCheckbox
                        key={d.date}
                        habitId={habit.id}
                        date={d.date}
                        isArchive={isArchive}
                        color={color}
                        isToday={d.isToday}
                        status={statuses[d.date]?.[habit.id] || "none"}
                    />
                );
            })}
        </tr>
    );
}
