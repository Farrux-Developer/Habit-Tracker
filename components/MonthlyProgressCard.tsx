"use client";

import { useHabitStore, useCurrentYear } from "@/lib/store";
import { useLang } from "@/lib/lang";

export default function MonthlyProgressCard() {
  const { lang, t } = useLang();
  const currentYear = useCurrentYear();
  const currentMonth = useHabitStore((s) => s.currentMonth);
  const yearsData = useHabitStore((s) => s.yearsData);

  const yearData = yearsData[currentYear] ?? {
    habits: [],
    completedHabitsByDate: {},
    habitStatusesByDate: {},
  };

  const activeHabits = yearData.habits.filter((h) => h.is_active);

  // Total days in current month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const totalPossible = activeHabits.length * daysInMonth;

  // Calculate per-habit monthly stats
  let totalDoneCount = 0;
  const habitStats = activeHabits.map((habit) => {
    let habitDoneDays = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const statusMap = yearData.habitStatusesByDate?.[dateStr];
      const legacyDone = yearData.completedHabitsByDate?.[dateStr]?.includes(habit.id);

      if (statusMap && statusMap[habit.id] === "done") {
        habitDoneDays++;
      } else if (!statusMap && legacyDone) {
        habitDoneDays++;
      }
    }

    totalDoneCount += habitDoneDays;
    const pct = daysInMonth > 0 ? Math.round((habitDoneDays / daysInMonth) * 100) : 0;
    return {
      habit,
      doneDays: habitDoneDays,
      pct,
    };
  });

  const overallPct = totalPossible > 0 ? Math.min(Math.round((totalDoneCount / totalPossible) * 100), 100) : 0;

  return (
    <div className="mb-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
      {/* Header (Photo 1) */}
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-3 mb-4">
        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--foreground)]">
            {lang === "ru" ? "ПРОГРЕСС ЗА МЕСЯЦ" : "MONTHLY PROGRESS"}
          </h3>
          <span className="text-[10px] font-semibold text-[var(--muted)]">
            {lang === "ru" ? "Выполнение целей по привычкам" : "Monthly habit goals completion"}
          </span>
        </div>

        {/* Counter Badge (Photo 1) */}
        <div className="flex items-baseline gap-1 rounded-xl bg-rose-500/10 px-3 py-1 text-rose-500 font-extrabold text-sm">
          <span>{totalDoneCount}</span>
          <span className="text-xs font-normal text-[var(--muted)]">/ {totalPossible > 0 ? totalPossible : daysInMonth}</span>
        </div>
      </div>

      {/* Main Total Progress Bar (Photo 1) */}
      <div className="mb-5">
        <div className="mb-1.5 flex items-center justify-between text-xs font-extrabold">
          <span className="text-[var(--foreground)]">{overallPct}%</span>
          <span className="text-[10px] font-semibold text-[var(--muted)]">Overall Completion</span>
        </div>
        <div className="h-3 w-full rounded-full bg-[var(--surface-secondary)] overflow-hidden p-0.5 border border-[var(--border)]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 transition-all duration-500"
            style={{ width: `${overallPct}%` }}
          />
        </div>
      </div>

      {/* Per-Habit Monthly Progress Bars (Photo 1) */}
      {habitStats.length === 0 ? (
        <div className="py-6 text-center text-xs font-semibold text-[var(--muted)]">
          {lang === "ru" ? "Добавьте привычки для отслеживания прогресса за месяц" : "Add habits to view monthly progress"}
        </div>
      ) : (
        <div className="space-y-3">
          {habitStats.map(({ habit, pct }) => (
            <div key={habit.id} className="flex items-center gap-3">
              {/* Percentage Label Box (Photo 1) */}
              <div className="w-12 text-right text-xs font-extrabold text-[var(--foreground)]">
                {pct}%
              </div>

              {/* Progress Bar Container (Photo 1) */}
              <div className="flex-1">
                <div className="mb-1 flex items-center justify-between text-[11px] font-bold text-[var(--foreground)] truncate">
                  <span>{habit.title}</span>
                </div>
                <div className="h-4.5 w-full rounded-lg bg-rose-500/10 p-0.5 border border-rose-500/20 overflow-hidden">
                  <div
                    className="h-full rounded-md bg-rose-400/80 transition-all duration-300"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: habit.color || "#f43f5e",
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
