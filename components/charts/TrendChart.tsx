"use client";

import React from "react";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useHabitStore, formatDate } from "@/lib/store";

export function TrendChart({ currentMonthIndex, currentYear }: { currentMonthIndex: number, currentYear: number }) {
    const yearData = useHabitStore((s) => s.yearsData[currentYear]);

    const data = React.useMemo(() => {
        const map = yearData?.completedHabitsByDate || {};
        const activeHabits = (yearData?.habits || []).filter(h => h.is_active);
        const activeIds = new Set(activeHabits.map(h => h.id));

        const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
        const result = [];
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = formatDate(new Date(currentYear, currentMonthIndex, d));
            const statuses = map[dateStr] || {};
            let doneCount = 0;
            Object.entries(statuses).forEach(([id, status]) => {
                if (activeIds.has(id) && status === "done") {
                    doneCount++;
                }
            });
            result.push({
                day: d,
                date: dateStr,
                completed: doneCount
            });
        }
        return result;
    }, [currentYear, currentMonthIndex, yearData]);

    return (
        <div className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <Tooltip
                        cursor={{ stroke: 'var(--border-strong)', strokeWidth: 1, strokeDasharray: '3 3' }}
                        contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', fontSize: '12px', fontWeight: 'bold' }}
                        labelFormatter={(label) => `Day ${label}`}
                    />
                    <Area type="monotone" dataKey="completed" stroke="var(--accent)" strokeWidth={2} fillOpacity={1} fill="url(#colorCompleted)" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
