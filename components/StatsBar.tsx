"use client";

import React from "react";
import { useStreaks, useTodayCompleted, useMonthlyProgress } from "@/lib/store";
import { Flame, Trophy, TrendingUp } from "@/components/icons";

// ============================================================
// Streak tier
// ============================================================
type StreakTier = "cold" | "warming" | "fire" | "blaze" | "legend";
function getStreakTier(days: number): StreakTier {
  if (days >= 30) return "legend"; if (days >= 14) return "blaze";
  if (days >= 7) return "fire"; if (days >= 3) return "warming"; return "cold";
}
const TIER_META: Record<StreakTier, { colorVar: string; glow: string; scale: number }> = {
  cold:    { colorVar: "--muted",         glow: "none", scale: 1 },
  warming: { colorVar: "--streak-warm",   glow: "0 0 6px var(--streak-warm)", scale: 1 },
  fire:    { colorVar: "--streak-fire",   glow: "0 0 10px var(--streak-fire)", scale: 1.05 },
  blaze:   { colorVar: "--streak-blaze",  glow: "0 0 14px var(--streak-blaze), 0 0 4px var(--streak-blaze)", scale: 1.08 },
  legend:  { colorVar: "--streak-legend", glow: "0 0 16px var(--streak-legend), 0 0 32px var(--streak-legend)", scale: 1.1 },
};

function StreakFlame({ days }: { days: number }) {
  const tier = getStreakTier(days);
  const meta = TIER_META[tier];
  const style: React.CSSProperties = {
    color: `var(${meta.colorVar})`,
    filter: meta.glow !== "none" ? `drop-shadow(${meta.glow})` : "none",
  };
  return (
    <div className="relative flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
         style={{ transform: `scale(${meta.scale})` }}>
      <Flame size={22} className="flex-shrink-0 transition-all duration-700" style={style} />
      {tier === "legend" && (
        <div className="absolute inset-0 -z-10 animate-[legendPulse_2s_ease-in-out_infinite]">
          <Flame size={22} style={{ color: `var(${meta.colorVar})`, filter: "blur(6px)", opacity: 0.4 }} />
        </div>
      )}
    </div>
  );
}

// ============================================================
// CircularProgress
// ============================================================
function CircularProgress({ pct }: { pct: number }) {
  const r = 16; const c = 2 * Math.PI * r;
  const clamped = Math.min(100, Math.max(0, pct));
  const offset = c - (clamped / 100) * c;
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" className="flex-shrink-0"
         aria-label={`${clamped}% completed today`}>
      <circle cx="22" cy="22" r={r} fill="none" stroke="var(--border)" strokeWidth="2.5" />
      <circle cx="22" cy="22" r={r} fill="none" stroke="var(--accent)" strokeWidth="2.5"
              strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
              transform="rotate(-90 22 22)"
              className="transition-[stroke-dashoffset]" style={{
                transitionDuration: "0.8s", transitionTimingFunction: "cubic-bezier(0.4,0,0.2,1)",
                filter: clamped >= 100 ? "drop-shadow(0 0 4px var(--accent-glow))" : "none",
              }} />
      <text x="22" y="22" textAnchor="middle" dominantBaseline="central"
            className="fill-[var(--foreground)] font-extrabold tabular-nums select-none" style={{ fontSize: "9px" }}>
        {clamped}%
      </text>
    </svg>
  );
}

function CompactStat({ icon, value, label, accent }: {
  icon: React.ReactNode; value: string; label: string; accent?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <div className="flex items-baseline gap-1">
        <span className={`text-[15px] font-extrabold tabular-nums leading-none ${accent ? "text-[var(--accent)]" : "text-[var(--foreground)]"}`}>
          {value}
        </span>
        <span className="text-[10px] font-medium leading-none text-[var(--muted)]">{label}</span>
      </div>
    </div>
  );
}

// ============================================================
// StatsBar
// ============================================================
export default React.memo(function StatsBar() {
  const { currentStreak, maxStreak } = useStreaks();
  const { done, total, pct } = useTodayCompleted();
  const { activeDays, totalDays } = useMonthlyProgress();
  const monthPct = totalDays > 0 ? Math.round((activeDays / totalDays) * 100) : 0;

  return (
    <div className="grid grid-cols-[auto_1fr] gap-3 rounded-2xl p-4
                    bg-[var(--surface)] border border-[var(--border)]"
         style={{ boxShadow: "var(--shadow-sm)" }}>
      {/* Left: ring + count */}
      <div className="flex items-center gap-3">
        <CircularProgress pct={pct} />
        <div className="flex flex-col">
          <span className="text-base font-extrabold tabular-nums leading-none text-[var(--foreground)]">
            {done}<span className="font-medium text-[var(--muted)]">/{total}</span>
          </span>
          <span className="text-[10px] font-medium tracking-wide uppercase text-[var(--muted)]">Today</span>
        </div>
      </div>

      {/* Right: streak + record */}
      <div className="flex flex-col justify-center gap-1.5">
        <CompactStat icon={<StreakFlame days={currentStreak} />}
                     value={`${currentStreak}`} label="day streak" accent={currentStreak >= 7} />
        <CompactStat icon={<Trophy size={16} className="flex-shrink-0 text-[var(--accent-secondary)]" />}
                     value={`${maxStreak}`} label="record" />
      </div>

      {/* Bottom: monthly bar */}
      <div className="col-span-2 flex items-center gap-2.5 border-t border-[var(--border)] pt-3">
        <TrendingUp size={14} className="flex-shrink-0 text-[var(--muted)]" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
          {activeDays}/{totalDays} days
        </span>
        <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-[var(--border)]">
          <div className="h-full rounded-full transition-all duration-800 ease-[cubic-bezier(0.4,0,0.2,1)]"
               style={{ width: `${monthPct}%`, backgroundColor: "var(--accent)",
                        transitionDuration: "0.8s", transitionTimingFunction: "cubic-bezier(0.4,0,0.2,1)" }} />
        </div>
        <span className="text-[10px] font-extrabold tabular-nums text-[var(--accent)]">{monthPct}%</span>
      </div>
    </div>
  );
});
