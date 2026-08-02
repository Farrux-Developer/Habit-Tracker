"use client";

import React, { useState } from "react";
import { useTheme } from "@/lib/theme";
import { useDateCompletionCount, useHabits, formatDate, useHabitStore } from "@/lib/store";
import { getHeatmapLevel, getHeatmapColor } from "@/lib/utils";

// ============================================================
// Constants
// ============================================================
const CELL = 14;
const GAP = 4;
const RADIUS = 3;
const TOTAL_DAYS = 365;

const MONTHS_RU = ["Янв","Фев","Мар","Апр","Май","Июн","Июл","Авг","Сен","Окт","Ноя","Дек"];
const DAYS_RU = ["Пн","","Ср","","Пт","",""];

// ============================================================
// Grid builder — LTR: oldest left, newest right
// ============================================================
interface GridCell { date: string; col: number; row: number; }
function buildGrid(): GridCell[] {
  const today = new Date(); today.setHours(0,0,0,0);
  const start = new Date(today); start.setDate(start.getDate() - TOTAL_DAYS);
  const dow = start.getDay(); const off = dow === 0 ? 6 : dow - 1;
  start.setDate(start.getDate() - off);
  const cells: GridCell[] = [];
  const cursor = new Date(start); let col = 0;
  while (cursor <= today) {
    const d = cursor.getDay(); const row = d === 0 ? 6 : d - 1;
    cells.push({ date: formatDate(cursor), col, row });
    cursor.setDate(cursor.getDate() + 1);
    if (row === 6) col++;
  }
  return cells;
}

function groupByWeek(cells: GridCell[]): Map<number, GridCell[]> {
  const m = new Map<number, GridCell[]>();
  for (const c of cells) {
    const a = m.get(c.col) ?? []; a.push(c); m.set(c.col, a);
  }
  for (const [col, week] of m) {
    const filled: GridCell[] = [];
    for (let r = 0; r < 7; r++) filled.push(week.find(c => c.row === r) ?? { date: "", col, row: r });
    m.set(col, filled);
  }
  return m;
}

function monthLabels(cells: GridCell[]): { col: number; label: string }[] {
  const labels: { col: number; label: string }[] = [];
  let last = -1;
  for (const c of cells) {
    if (c.row !== 0) continue;
    const m = new Date(c.date + "T00:00:00").getMonth();
    if (m !== last) { labels.push({ col: c.col, label: MONTHS_RU[m] }); last = m; }
  }
  return labels;
}

// ============================================================
// DayDetail — popup showing tasks for a specific date
// ============================================================
function DayDetail({ date, onClose }: { date: string; onClose: () => void }) {
  const habits = useHabits();
  const active = habits.filter(h => h.is_active);
  if (!date) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
         onClick={onClose}>
      <div className="mx-4 w-full max-w-sm rounded-2xl border border-[var(--border)]
                      bg-[var(--surface)] p-5 shadow-2xl animate-[fadeUp_0.2s_ease-out]"
           onClick={(e) => e.stopPropagation()}
           style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-[var(--foreground)]">{date}</h3>
          <button onClick={onClose}
            className="rounded-lg p-1 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors text-lg leading-none">
            ×
          </button>
        </div>
        <div className="space-y-1.5 max-h-64 overflow-y-auto">
          {active.map(h => (
            <CompletionRow key={h.id} habit={h} date={date} />
          ))}
        </div>
      </div>
    </div>
  );
}

function CompletionRow({ habit, date }: { habit: { id: string; title: string; type: string }; date: string }) {
  const isCompleted = useHabitStore(s => {
    const yd = s.yearsData[s.currentYear];
    return yd?.completedHabitsByDate[date]?.includes(habit.id) ?? false;
  });
  return (
    <div className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
      isCompleted ? "bg-emerald-500/10 text-emerald-500" : "bg-[var(--surface-secondary)] text-[var(--muted)]"
    }`}>
      <span className={`h-2 w-2 rounded-full flex-shrink-0 ${isCompleted ? "bg-emerald-500" : "bg-[var(--border)]"}`} />
      {habit.title}
      {isCompleted && <span className="ml-auto text-[10px]">✓</span>}
    </div>
  );
}

// ============================================================
// HeatmapCell — кликабельная ячейка
// ============================================================
function HeatmapCell({
  date, totalHabits, isDark, isToday, onClick,
}: {
  date: string; totalHabits: number; isDark: boolean; isToday: boolean;
  onClick: (date: string) => void;
}) {
  const count = date ? useDateCompletionCount(date) : 0;
  const level = date ? getHeatmapLevel(count, totalHabits) : 0;
  const color = date ? getHeatmapColor(level, isDark) : "transparent";
  const allDone = level >= 4 && totalHabits > 0;

  return (
    <div className="relative group/cell">
      <div
        onClick={() => date && onClick(date)}
        className="cursor-pointer transition-all duration-200 ease-out
                   hover:scale-[1.4] hover:z-10"
        style={{
          width: CELL, height: CELL, borderRadius: RADIUS,
          backgroundColor: color,
          boxShadow: allDone
            ? "0 0 10px rgba(16,185,129,0.55)"
            : count > 0
              ? "0 0 0 1px rgba(16,185,129,0.15)"
              : "inset 0 0 0 1px rgba(128,128,128,0.08)",
          outline: isToday ? "2px solid var(--accent)" : "none",
          outlineOffset: 1,
        }}
        title={date ? `${date}: ${count}/${totalHabits} задач${count !== 1 ? "и" : "а"}` : ""}
        role="gridcell"
        aria-label={date ? `${count} of ${totalHabits} on ${date}` : "empty"}
      />

      {/* Tooltip */}
      {date && totalHabits > 0 && (
        <div className="pointer-events-none absolute left-1/2 bottom-full z-20 mb-1.5
                        -translate-x-1/2 whitespace-nowrap rounded-md
                        bg-[var(--surface-tertiary)] px-2 py-1 text-[10px] font-medium
                        text-[var(--foreground)] opacity-0 transition-opacity duration-150
                        group-hover/cell:opacity-100 shadow-lg border border-[var(--border)]">
          {date} — {count}/{totalHabits}
          {allDone && <span className="ml-1 text-[var(--accent)]">★</span>}
        </div>
      )}
    </div>
  );
}

// ============================================================
// Heatmap
// ============================================================
interface HeatmapProps { totalHabits: number }

export default function Heatmap({ totalHabits }: HeatmapProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const todayStr = formatDate(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const grid = React.useMemo(() => buildGrid(), []);
  const weeks = React.useMemo(() => groupByWeek(grid), [grid]);
  const labels = React.useMemo(() => monthLabels(grid), [grid]);
  const maxCol = Math.max(...grid.map(c => c.col), 0);

  return (
    <div className="overflow-x-auto" style={{ padding: 20 }}>
      {/* Заголовок */}
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wide text-[var(--muted)] uppercase">Активность</span>
        <span className="text-[9px] font-medium text-[var(--muted)]">{TOTAL_DAYS} дней</span>
      </div>

      {/* Месяцы сверху */}
      <div className="mb-1 ml-[30px] flex" style={{ gap: GAP }}>
        {Array.from({ length: maxCol + 1 }, (_, ci) => {
          const label = labels.find(l => l.col === ci);
          return <div key={ci} className="flex-shrink-0 text-[9px] leading-none text-[var(--muted)]"
                      style={{ width: CELL }}>{label?.label ?? ""}</div>;
        })}
      </div>

      {/* Сетка: дни слева + колонки */}
      <div className="flex">
        <div className="mr-[6px] flex flex-col flex-shrink-0" style={{ gap: GAP }}>
          {DAYS_RU.map((day, i) => (
            <div key={i} className="flex items-center text-[9px] text-[var(--muted)]"
                 style={{ height: CELL, width: 22 }}>{day}</div>
          ))}
        </div>
        <div className="flex" style={{ gap: GAP }}>
          {Array.from({ length: maxCol + 1 }, (_, ci) => {
            const week = weeks.get(ci) ?? [];
            return (
              <div key={ci} className="flex flex-col" style={{ gap: GAP }}>
                {week.map((cell, ri) => (
                  <HeatmapCell
                    key={`${ci}-${ri}`} date={cell.date}
                    totalHabits={totalHabits} isDark={isDark}
                    isToday={cell.date === todayStr}
                    onClick={setSelectedDate}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Легенда */}
      <div className="mt-3 flex items-center justify-end gap-1.5">
        <span className="text-[9px] text-[var(--muted)]">0%</span>
        {[0,1,2,3,4].map(lvl => (
          <div key={lvl} className="flex-shrink-0" style={{
            width:10,height:10,borderRadius:2,
            backgroundColor:getHeatmapColor(lvl, isDark),
            boxShadow: lvl===0?"inset 0 0 0 1px rgba(128,128,128,0.12)":"none",
          }} />
        ))}
        <span className="text-[9px] text-[var(--accent)] font-semibold">100% ★</span>
      </div>

      {/* Day detail popup */}
      {selectedDate && <DayDetail date={selectedDate} onClose={() => setSelectedDate(null)} />}
    </div>
  );
}
