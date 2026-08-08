"use client";

import React, { useState } from "react";
import {
  useHabits,
  useCurrentYear,
  useCurrentMonth,
  useViewMode,
  useHabitStore,
  useHabitDayStatus,
  formatDate,
  HabitDayStatus,
  Habit,
} from "@/lib/store";
import { useLang } from "@/lib/lang";
import { Check, Minus, Lock, Trash2, Edit2 } from "@/components/icons";

const WEEK_BG_CLASSES = [
  "bg-sky-500/5 border-sky-500/10",
  "bg-rose-500/5 border-rose-500/10",
  "bg-emerald-500/5 border-emerald-500/10",
  "bg-purple-500/5 border-purple-500/10",
  "bg-amber-500/5 border-amber-500/10",
];

const DAYS_SHORT_RU = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
const DAYS_SHORT_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface DayInfo {
  date: string;
  dayNum: number;
  dayName: string;
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
}

interface WeekGroup {
  weekNum: number;
  days: DayInfo[];
}

export default function HabitMatrix() {
  const { lang, t } = useLang();
  const habits = useHabits();
  const year = useCurrentYear();
  const month = useCurrentMonth();
  const viewMode = useViewMode();
  const deleteHabit = useHabitStore((s) => s.deleteHabit);
  const yearsData = useHabitStore((s) => s.yearsData);
  const yearData = yearsData[year] ?? { habits: [], completedHabitsByDate: {}, habitStatusesByDate: {} };

  const todayStr = formatDate(new Date());

  // Generate days for selected month grouped into weeks
  const weekGroups = React.useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysName = lang === "ru" ? DAYS_SHORT_RU : DAYS_SHORT_EN;

    const weeks: WeekGroup[] = [];
    let currentWeekDays: DayInfo[] = [];
    let weekIndex = 1;

    for (let d = 1; d <= daysInMonth; d++) {
      const dt = new Date(year, month, d);
      const dateStr = formatDate(dt);
      const dayOfWeek = dt.getDay();

      const dayInfo: DayInfo = {
        date: dateStr,
        dayNum: d,
        dayName: daysName[dayOfWeek],
        isToday: dateStr === todayStr,
        isPast: dateStr < todayStr,
        isFuture: dateStr > todayStr,
      };

      currentWeekDays.push(dayInfo);

      // End of week (Sunday) or end of month
      if (dayOfWeek === 0 || d === daysInMonth) {
        weeks.push({
          weekNum: weekIndex++,
          days: currentWeekDays,
        });
        currentWeekDays = [];
      }
    }

    if (viewMode === "week") {
      // Filter to week containing today or first week
      const currentWeek = weeks.find((w) => w.days.some((d) => d.isToday));
      return currentWeek ? [currentWeek] : [weeks[0]];
    }

    return weeks;
  }, [year, month, lang, viewMode, todayStr]);

  const activeHabits = habits.filter((h) => h.is_active);

  if (activeHabits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)]/50 p-12 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
          ✓
        </div>
        <h4 className="text-sm font-bold text-[var(--foreground)]">{t("noTasks")}</h4>
        <p className="text-xs text-[var(--muted)] mt-1">{t("addFirstHabit")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 overflow-hidden rounded-2xl border border-[var(--border)]/60 bg-[var(--surface)]/80 p-4 shadow-sm backdrop-blur-xl">
      {/* Notice Banner */}
      <div className="flex items-center justify-between text-[11px] font-medium text-[var(--muted)] border-b border-[var(--border)]/40 pb-2">
        <span className="flex items-center gap-1">
          <Lock size={12} className="text-amber-500" />
          {t("pastLockedNotice")}
        </span>
        <span className="text-[10px] text-[var(--accent)] font-semibold">
          {t("statusCycleHint")}
        </span>
      </div>

      {/* Matrix Table View */}
      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          {/* Header Row: Habits column header + Week blocks */}
          <div className="flex items-center border-b border-[var(--border)] pb-2 font-bold text-xs">
            <div className="w-[180px] shrink-0 text-[var(--muted)] uppercase tracking-wider text-[10px]">
              {t("tasks")} ({activeHabits.length})
            </div>

            <div className="flex flex-1 gap-2">
              {weekGroups.map((group, wi) => (
                <div
                  key={group.weekNum}
                  className={`flex flex-col rounded-xl border p-1.5 transition-all ${
                    WEEK_BG_CLASSES[wi % WEEK_BG_CLASSES.length]
                  }`}
                  style={{ flex: group.days.length }}
                >
                  <span className="mb-1 text-[9px] font-extrabold uppercase tracking-wider text-[var(--muted)] text-center">
                    {t("week")} {group.weekNum}
                  </span>
                  <div className="grid grid-flow-col auto-cols-fr gap-1">
                    {group.days.map((day) => (
                      <div
                        key={day.date}
                        className={`flex flex-col items-center justify-center rounded-lg p-1 text-[10px] ${
                          day.isToday
                            ? "bg-emerald-500 text-white font-extrabold shadow-sm ring-2 ring-emerald-500/40"
                            : "text-[var(--foreground)]"
                        }`}
                      >
                        <span className="text-[8px] opacity-80">{day.dayName}</span>
                        <span className="text-xs font-bold leading-none">{day.dayNum}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Habit Rows */}
          <div className="divide-y divide-[var(--border)]/40">
            {activeHabits.map((habit) => (
              <HabitRow
                key={habit.id}
                habit={habit}
                weekGroups={weekGroups}
                onDelete={() => deleteHabit(habit.id)}
              />
            ))}
          </div>

          {/* Bottom Summary Calculation Rows (Photo 3) */}
          <div className="border-t-2 border-[var(--border)] pt-2 mt-2 space-y-1">
            {/* DONE ROW */}
            <div className="flex items-center text-[10px] font-extrabold">
              <div className="w-[180px] shrink-0 pr-3 text-emerald-600 dark:text-emerald-400">
                {lang === "ru" ? "ВЫПОЛНЕНЫ" : "DONE"}
              </div>
              <div className="flex flex-1 gap-2">
                {weekGroups.map((group, wi) => (
                  <div
                    key={group.weekNum}
                    className={`grid grid-flow-col auto-cols-fr gap-1 rounded-lg p-1 border text-center font-mono ${
                      WEEK_BG_CLASSES[wi % WEEK_BG_CLASSES.length]
                    }`}
                    style={{ flex: group.days.length }}
                  >
                    {group.days.map((day) => {
                      const statusMap = yearData.habitStatusesByDate?.[day.date];
                      const doneCount = activeHabits.filter((h) => statusMap?.[h.id] === "done").length;
                      return (
                        <div key={day.date} className="text-emerald-500">
                          {doneCount}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* SKIPPED ROW */}
            <div className="flex items-center text-[10px] font-extrabold">
              <div className="w-[180px] shrink-0 pr-3 text-rose-500">
                {lang === "ru" ? "НЕ ВЫПОЛНЕНЫ" : "SKIPPED"}
              </div>
              <div className="flex flex-1 gap-2">
                {weekGroups.map((group, wi) => (
                  <div
                    key={group.weekNum}
                    className={`grid grid-flow-col auto-cols-fr gap-1 rounded-lg p-1 border text-center font-mono ${
                      WEEK_BG_CLASSES[wi % WEEK_BG_CLASSES.length]
                    }`}
                    style={{ flex: group.days.length }}
                  >
                    {group.days.map((day) => {
                      const statusMap = yearData.habitStatusesByDate?.[day.date];
                      const skipCount = activeHabits.filter((h) => statusMap?.[h.id] === "skipped").length;
                      return (
                        <div key={day.date} className="text-rose-500">
                          {skipCount}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* PROGRESS % ROW */}
            <div className="flex items-center text-[10px] font-extrabold">
              <div className="w-[180px] shrink-0 pr-3 text-[var(--accent)]">
                {lang === "ru" ? "ПРОГРЕСС %" : "PROGRESS %"}
              </div>
              <div className="flex flex-1 gap-2">
                {weekGroups.map((group, wi) => (
                  <div
                    key={group.weekNum}
                    className={`grid grid-flow-col auto-cols-fr gap-1 rounded-lg p-1 border text-center font-mono ${
                      WEEK_BG_CLASSES[wi % WEEK_BG_CLASSES.length]
                    }`}
                    style={{ flex: group.days.length }}
                  >
                    {group.days.map((day) => {
                      const statusMap = yearData.habitStatusesByDate?.[day.date];
                      const doneCount = activeHabits.filter((h) => statusMap?.[h.id] === "done").length;
                      const pct = activeHabits.length > 0 ? Math.round((doneCount / activeHabits.length) * 100) : 0;
                      return (
                        <div key={day.date} className="text-[var(--foreground)]">
                          {pct}%
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HabitRow({
  habit,
  weekGroups,
  onDelete,
}: {
  habit: Habit;
  weekGroups: WeekGroup[];
  onDelete: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const habitColor = habit.color || "#10b981";

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete();
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  return (
    <div className="group flex items-center py-2.5 transition-colors hover:bg-[var(--surface-secondary)]/40 rounded-xl px-1">
      {/* Habit Info (Left Column) */}
      <div className="flex w-[180px] shrink-0 items-center justify-between pr-3">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="h-3 w-3 rounded-full shrink-0 shadow-sm"
            style={{ backgroundColor: habitColor }}
          />
          <span className="text-xs font-bold text-[var(--foreground)] truncate">
            {habit.title}
          </span>
        </div>

        <button
          onClick={handleDelete}
          className={`shrink-0 rounded p-1 text-[var(--muted)] opacity-0 group-hover:opacity-100 transition-all ${
            confirmDelete ? "text-red-500 bg-red-500/10 opacity-100" : "hover:text-red-500"
          }`}
          title={confirmDelete ? "Confirm delete" : "Delete habit"}
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Days Grid per Week */}
      <div className="flex flex-1 gap-2">
        {weekGroups.map((group, wi) => (
          <div
            key={group.weekNum}
            className={`grid grid-flow-col auto-cols-fr gap-1 rounded-xl p-1 border ${
              WEEK_BG_CLASSES[wi % WEEK_BG_CLASSES.length]
            }`}
            style={{ flex: group.days.length }}
          >
            {group.days.map((day) => (
              <HabitStatusCell
                key={day.date}
                habitId={habit.id}
                day={day}
                habitColor={habitColor}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function HabitStatusCell({
  habitId,
  day,
  habitColor,
}: {
  habitId: string;
  day: DayInfo;
  habitColor: string;
}) {
  const status = useHabitDayStatus(habitId, day.date);
  const cycleStatus = useHabitStore((s) => s.cycleHabitDayStatus);
  const [animating, setAnimating] = useState(false);

  const isEditable = day.isToday; // Only today is editable as requested

  const handleClick = () => {
    if (!isEditable) return; // Past dates are locked!
    setAnimating(true);
    setTimeout(() => setAnimating(false), 300);
    cycleStatus(habitId, day.date);
  };

  return (
    <div className="flex justify-center items-center">
      <button
        onClick={handleClick}
        disabled={!isEditable}
        className={`relative flex h-7 w-7 items-center justify-center rounded-lg border transition-all duration-200 ${
          animating ? "scale-125" : ""
        } ${
          status === "done"
            ? "bg-emerald-500 border-emerald-500 text-white shadow-sm"
            : status === "skipped"
            ? "bg-orange-500 border-orange-500 text-white shadow-sm"
            : day.isToday
            ? "border-emerald-500/60 bg-emerald-500/10 hover:bg-emerald-500/20"
            : "border-[var(--border)] bg-[var(--surface)]"
        } ${
          isEditable
            ? "cursor-pointer hover:scale-110 active:scale-95"
            : "cursor-not-allowed opacity-80"
        }`}
        title={
          !isEditable
            ? `${day.date}: ${status.toUpperCase()} (View Only)`
            : `${day.date}: Click to cycle state`
        }
      >
        {status === "done" && <Check size={14} className="stroke-[3]" />}
        {status === "skipped" && <Minus size={14} className="stroke-[3]" />}
        {status === "not_done" && !isEditable && (
          <span className="h-1 w-1 rounded-full bg-[var(--muted)]/40" />
        )}
      </button>
    </div>
  );
}
