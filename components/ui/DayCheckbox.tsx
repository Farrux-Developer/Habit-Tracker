"use client";

import React from "react";
import { HabitStatus, useHabitStore } from "@/lib/store";

interface DayCheckboxProps {
    habitId: string;
    date: string;
    isArchive: boolean;
    color: string;
    isToday: boolean;
    status: HabitStatus;
}

export function DayCheckbox({ habitId, date, isArchive, color, isToday, status }: DayCheckboxProps) {
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
                {status === "done" ? (
                    <div className="h-full w-full rounded-[4px] shadow-sm border border-black/5 animate-[scaleIn_0.2s_ease-out] flex items-center justify-center" style={{ backgroundColor: color }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                ) : status === "skipped" ? (
                    <div className="h-full w-full rounded-[4px] shadow-sm border border-red-500/20 bg-red-100 animate-[scaleIn_0.2s_ease-out] flex items-center justify-center">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </div>
                ) : (
                    <div className={`h-full w-full rounded-[4px] border border-transparent transition-colors ${isToday ? 'hover:border-[var(--accent)]/30 hover:bg-[var(--accent)]/10' : 'hover:border-[var(--border-strong)] hover:bg-[var(--surface-tertiary)]'}`} />
                )}
            </button>
        </td>
    );
}
