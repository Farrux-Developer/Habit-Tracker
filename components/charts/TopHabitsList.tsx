"use client";

import React from "react";
import { useTopHabits } from "@/lib/store";
import { useLang } from "@/lib/lang";

const TASK_COLORS = [
  "#10b981", "#3b82f6", "#f59e0b", "#8b5cf6",
  "#ec4899", "#06b6d4", "#f97316", "#84cc16",
];

export function TopHabitsList({ limit = 4 }: { limit?: number }) {
    const { t } = useLang();
    const topHabits = useTopHabits(limit);

    if (topHabits.length === 0) return null;

    return (
        <div className="mt-6">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-strong)] mb-3 border-b border-[var(--border)] pb-1">
                {t("topHabits")}
            </h3>
            <div className="space-y-2">
                {topHabits.map((habit, index) => {
                    const color = TASK_COLORS[index % TASK_COLORS.length];
                    return (
                        <div key={habit.id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-[var(--surface-secondary)]/50 hover:bg-[var(--surface-secondary)] transition-colors">
                            <div className="flex items-center gap-2 max-w-[70%]">
                                <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }}></span>
                                <span className="font-semibold text-[var(--foreground)] truncate">{habit.title}</span>
                            </div>
                            <div className="flex items-center gap-1.5 font-mono font-bold text-[10px]">
                                <span className="text-[var(--muted)]">{habit.done}d</span>
                                <span className="bg-[var(--surface)] text-[var(--accent)] px-1.5 py-0.5 rounded shadow-sm border border-[var(--border)]">{habit.pct}%</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
