"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export function DonutChartRatio({ done, skipped, none, pct }: { done: number, skipped: number, none: number, pct: number }) {
    const data = [
        { name: "Done", value: done, color: "var(--accent)" },
        { name: "Skipped", value: skipped, color: "#ef4444" },
        { name: "Not Done", value: none, color: "var(--surface-secondary)" }
    ];

    // Filter out zero values to avoid tiny slices if not strictly needed,
    // but recharts handles 0 fine.

    return (
        <div className="relative h-32 w-32 mx-auto">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie data={data} innerRadius={35} outerRadius={55} paddingAngle={2} dataKey="value" stroke="none">
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                </PieChart>
             </ResponsiveContainer>
             <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black text-[var(--foreground)]">{pct}%</span>
             </div>
        </div>
    );
}
