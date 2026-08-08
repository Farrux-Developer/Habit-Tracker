"use client";

import { useState } from "react";
import { useMonthlyTrend } from "@/lib/store";
import { useLang } from "@/lib/lang";
import { TrendingUp, Sparkles } from "@/components/icons";

export default function TrendChart() {
  const { t } = useLang();
  const trendData = useMonthlyTrend();
  const [hoveredDay, setHoveredDay] = useState<typeof trendData[0] | null>(null);

  if (trendData.length === 0) return null;

  const maxPossible = Math.max(...trendData.map((d) => d.totalHabits), 1);
  const width = 800;
  const height = 90;
  const paddingX = 25;
  const paddingY = 15;

  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  const stepX = chartW / Math.max(trendData.length - 1, 1);

  const points = trendData.map((d, i) => {
    const x = paddingX + i * stepX;
    const yRatio = d.totalHabits > 0 ? d.doneCount / maxPossible : 0;
    const y = height - paddingY - yRatio * chartH;
    return { x, y, data: d };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, "");

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  // Calculate average completion rate for badge
  const totalDone = trendData.reduce((acc, d) => acc + d.doneCount, 0);
  const totalPossible = trendData.reduce((acc, d) => acc + d.totalHabits, 0);
  const avgPct = totalPossible > 0 ? Math.round((totalDone / totalPossible) * 100) : 0;

  return (
    <div className="relative mb-4 rounded-2xl border border-[var(--border)]/60 bg-[var(--surface)]/80 p-4 shadow-sm backdrop-blur-xl transition-all duration-300 hover:border-[var(--accent)]/30">
      {/* Header Info */}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
            <TrendingUp size={14} />
          </div>
          <span className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">
            {t("trend")}
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-semibold text-[var(--muted)]">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>{t("done")}</span>
          </div>
          <div className="flex items-center gap-1">
            <Sparkles size={12} className="text-emerald-500" />
            <span className="text-xs font-extrabold text-[var(--accent)]">{avgPct}%</span>
          </div>
        </div>
      </div>

      {/* SVG Area & Line Chart */}
      <div className="relative w-full overflow-visible">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full overflow-visible"
          style={{ maxHeight: "110px" }}
        >
          <defs>
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Area Fill */}
          <path d={areaD} fill="url(#trendGradient)" />

          {/* Line Path */}
          <path
            d={pathD}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Data Points */}
          {points.map((p) => (
            <g key={p.data.date} className="group cursor-pointer">
              {p.data.isToday && (
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="7"
                  fill="#10b981"
                  opacity="0.2"
                />
              )}
              <circle
                cx={p.x}
                cy={p.y}
                r={p.data.isToday ? "4" : "3"}
                fill={p.data.isToday ? "#10b981" : "var(--surface)"}
                stroke="#10b981"
                strokeWidth="2"
                onMouseEnter={() => setHoveredDay(p.data)}
                onMouseLeave={() => setHoveredDay(null)}
                className="transition-transform duration-200 hover:scale-150"
              />
            </g>
          ))}
        </svg>

        {/* Floating Tooltip on Hover */}
        {hoveredDay && (
          <div className="pointer-events-none absolute -top-8 left-1/2 z-20 -translate-x-1/2 rounded-lg border border-[var(--border)] bg-[var(--surface-tertiary)] px-3 py-1 text-[11px] font-bold text-[var(--foreground)] shadow-xl backdrop-blur-md">
            <span>{hoveredDay.date} ({hoveredDay.dayName}): </span>
            <span className="text-emerald-500 font-extrabold ml-1">
              {hoveredDay.doneCount}/{hoveredDay.totalHabits} ({hoveredDay.pct}%)
            </span>
          </div>
        )}
      </div>

      {/* Axis Day Numbers (Bottom) */}
      <div className="mt-1 flex justify-between px-2 text-[9px] font-semibold text-[var(--muted)]/70">
        <span>1</span>
        <span>7</span>
        <span>14</span>
        <span>21</span>
        <span>28</span>
        <span>{trendData.length}</span>
      </div>
    </div>
  );
}
