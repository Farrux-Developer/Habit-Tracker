import React from "react";

export function StatCard({
    title,
    value,
    subtitle,
    icon,
    colorClass = "bg-[var(--surface-secondary)]"
}: {
    title: string;
    value: string | number | React.ReactNode;
    subtitle?: string | React.ReactNode;
    icon?: React.ReactNode;
    colorClass?: string;
}) {
  return (
    <div className={`rounded-2xl border border-[var(--border)] p-5 shadow-sm ${colorClass}`}>
        <div className="flex items-center justify-between mb-2">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-strong)]">{title}</h3>
            {icon && <div>{icon}</div>}
        </div>
        <div className="text-4xl font-black text-[var(--foreground)]">{value}</div>
        {subtitle && <div className="mt-1 text-[10px] font-semibold text-[var(--muted)]">{subtitle}</div>}
    </div>
  );
}
