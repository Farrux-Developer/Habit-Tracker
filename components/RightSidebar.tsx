"use client";

import { useDonutStats, useTopHabits, useStreaks, useTodayStats } from "@/lib/store";
import { useLang } from "@/lib/lang";
import { Trophy, Flame, CheckCircle2, MinusCircle, CircleDot, Award } from "@/components/icons";

export default function RightSidebar() {
  const { t } = useLang();
  const donut = useDonutStats();
  const topHabits = useTopHabits();
  const { currentStreak, maxStreak } = useStreaks();
  const today = useTodayStats();

  return (
    <aside className="flex flex-col gap-4 w-full lg:w-[280px] shrink-0">
      {/* Quick Streak & Today Summary Pill */}
      <div className="flex items-center justify-between rounded-2xl border border-[var(--border)]/60 bg-[var(--surface)]/80 p-3 shadow-sm backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
            <Flame size={18} className="fill-amber-500" />
          </div>
          <div>
            <div className="text-xs font-extrabold text-[var(--foreground)] leading-none">
              {currentStreak} {t("day")}
            </div>
            <span className="text-[10px] font-semibold text-[var(--muted)]">
              {t("streak")} (max {maxStreak})
            </span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-sm font-extrabold text-[var(--accent)] tabular-nums leading-none">
            {today.pct}%
          </div>
          <span className="text-[10px] font-semibold text-[var(--muted)]">
            {t("today")} ({today.done}/{today.total})
          </span>
        </div>
      </div>

      {/* Donut Chart: Done / Skipped / Remaining */}
      <div className="flex flex-col items-center rounded-2xl border border-[var(--border)]/60 bg-[var(--surface)]/80 p-4 shadow-sm backdrop-blur-xl">
        <h3 className="mb-3 w-full text-left text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
          {t("completionOverview")}
        </h3>

        {/* SVG Donut */}
        <div className="relative flex items-center justify-center my-1">
          <svg width={130} height={130} viewBox="0 0 130 130" className="flex-shrink-0">
            {/* Background ring */}
            <circle
              cx={65}
              cy={65}
              r={50}
              fill="none"
              stroke="var(--border)"
              strokeWidth={14}
            />
            {/* Done Segment */}
            {donut.donePct > 0 && (
              <circle
                cx={65}
                cy={65}
                r={50}
                fill="none"
                stroke="#10b981"
                strokeWidth={14}
                strokeDasharray={`${(donut.donePct / 100) * 314} 314`}
                strokeDashoffset={0}
                transform="rotate(-90 65 65)"
                className="transition-[stroke-dasharray] duration-700 ease-out"
              />
            )}
            {/* Skipped Segment */}
            {donut.skippedPct > 0 && (
              <circle
                cx={65}
                cy={65}
                r={50}
                fill="none"
                stroke="#f97316"
                strokeWidth={14}
                strokeDasharray={`${(donut.skippedPct / 100) * 314} 314`}
                strokeDashoffset={-((donut.donePct / 100) * 314)}
                transform="rotate(-90 65 65)"
                className="transition-[stroke-dasharray] duration-700 ease-out"
              />
            )}
          </svg>

          {/* Center Text */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-xl font-extrabold text-[var(--foreground)] tabular-nums leading-none">
              {donut.donePct}%
            </span>
            <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-500 mt-0.5">
              {t("done")}
            </span>
          </div>
        </div>

        {/* Color Code Legend */}
        <div className="mt-4 grid w-full grid-cols-3 gap-2 border-t border-[var(--border)]/60 pt-3 text-[10px] font-semibold">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-1 text-emerald-500">
              <CheckCircle2 size={12} />
              <span>{t("done")}</span>
            </div>
            <span className="font-extrabold text-[var(--foreground)] text-xs mt-0.5">
              {donut.done}
            </span>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-1 text-orange-500">
              <MinusCircle size={12} />
              <span>{t("skipped")}</span>
            </div>
            <span className="font-extrabold text-[var(--foreground)] text-xs mt-0.5">
              {donut.skipped}
            </span>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-1 text-[var(--muted)]">
              <CircleDot size={12} />
              <span>{t("notDone")}</span>
            </div>
            <span className="font-extrabold text-[var(--foreground)] text-xs mt-0.5">
              {donut.notDone}
            </span>
          </div>
        </div>
      </div>

      {/* Top Habits Ranking ("Рейтинг привычек") */}
      <div className="flex flex-col rounded-2xl border border-[var(--border)]/60 bg-[var(--surface)]/80 p-4 shadow-sm backdrop-blur-xl flex-1">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Trophy size={14} className="text-amber-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
              {t("topHabits")}
            </h3>
          </div>
          <span className="text-[10px] font-semibold text-[var(--muted)]">
            {topHabits.length}
          </span>
        </div>

        <div className="space-y-2.5 overflow-y-auto max-h-[320px] pr-0.5">
          {topHabits.length === 0 ? (
            <div className="py-6 text-center text-xs font-medium text-[var(--muted)]">
              {t("noTasks")}
            </div>
          ) : (
            topHabits.map(({ habit, pct }, index) => {
              const rank = index + 1;
              const habitColor = habit.color || "#10b981";

              return (
                <div
                  key={habit.id}
                  className="flex flex-col gap-1 rounded-xl border border-[var(--border)]/40 bg-[var(--surface-secondary)]/50 p-2.5 transition-all hover:bg-[var(--surface-secondary)] hover:border-[var(--accent)]/30"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[10px] font-extrabold ${
                          rank === 1
                            ? "bg-amber-500 text-white shadow-sm"
                            : rank === 2
                            ? "bg-slate-400 text-white"
                            : rank === 3
                            ? "bg-amber-700 text-white"
                            : "bg-[var(--border)] text-[var(--muted)]"
                        }`}
                      >
                        {rank}
                      </span>
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: habitColor }}
                      />
                      <span className="font-semibold text-[var(--foreground)] truncate">
                        {habit.title}
                      </span>
                    </div>

                    <span className="font-extrabold text-[var(--accent)] tabular-nums text-xs ml-2 shrink-0">
                      {pct}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--border)]/60">
                    <div
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: habitColor,
                      }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </aside>
  );
}
