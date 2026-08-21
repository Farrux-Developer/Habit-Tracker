import { useMemo } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { supabase } from "./supabase";
import { sanitize } from "./security";

// ============================================================
// Types
// ============================================================
export interface Habit {
  id: string;
  title: string;
  type: "daily" | "one_time";
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface StreakResult {
  currentStreak: number;
  maxStreak: number;
  totalContributions: number;
}

export type HabitStatus = "done" | "skipped" | "none";
type StatusMap = Record<string, Record<string, HabitStatus>>; // "YYYY-MM-DD" → { [habitId]: HabitStatus }

interface YearData {
  habits: Habit[];
  completedHabitsByDate: StatusMap;
}

interface HabitState {
  // --- Data ---
  currentYear: number;
  yearsData: Record<number, YearData>;
  isLoading: boolean;
  isCompletionsLoading: boolean;
  error: string | null;
  seededDefaults: boolean;

  // --- Actions ---
  setCurrentYear: (year: number) => void;
  fetchFromSupabase: (year: number) => Promise<void>;
  seedDefaultTasks: () => void;
  addHabit: (data: { title: string; type: "daily" | "one_time" }) => void;
  updateHabit: (habitId: string, data: { title?: string; type?: "daily" | "one_time" }) => void;
  deleteHabit: (habitId: string) => void;
  toggleHabitCompletion: (habitId: string, date: string) => void;
}

// ============================================================
// Helpers
// ============================================================
export function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function dateRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const cursor = new Date(start + "T00:00:00");
  const last = new Date(end + "T00:00:00");
  while (cursor <= last) {
    dates.push(formatDate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

function computeStreaks(map: StatusMap): StreakResult {
  const today = formatDate(new Date());
  const yesterday = formatDate(new Date(Date.now() - 86400000));

  const activeDates = new Set(
    Object.entries(map)
      .filter(([, statuses]) => Object.values(statuses).some(status => status === "done"))
      .map(([date]) => date),
  );

  const total = Object.values(map).reduce((sum, statuses) => {
    return sum + Object.values(statuses).filter(status => status === "done").length;
  }, 0);

  if (activeDates.size === 0) {
    return { currentStreak: 0, maxStreak: 0, totalContributions: 0 };
  }

  let currentStreak = 0;
  const startFrom = activeDates.has(today)
    ? today
    : activeDates.has(yesterday)
      ? yesterday
      : null;

  if (startFrom) {
    const cursor = new Date(startFrom + "T00:00:00");
    while (activeDates.has(formatDate(cursor))) {
      currentStreak++;
      cursor.setDate(cursor.getDate() - 1);
    }
  }

  const sorted = [...activeDates].sort();
  let maxStreak = 0;
  let run = 0;
  let prev: Date | null = null;

  for (const dateStr of sorted) {
    const curr = new Date(dateStr + "T00:00:00");
    if (prev) {
      const diff = (curr.getTime() - prev.getTime()) / 86400000;
      run = diff === 1 ? run + 1 : 1;
    } else {
      run = 1;
    }
    if (run > maxStreak) maxStreak = run;
    prev = curr;
  }

  return { currentStreak, maxStreak, totalContributions: total };
}

function ensureYear(state: HabitState, year: number): YearData {
  if (!state.yearsData[year]) {
    return { habits: [], completedHabitsByDate: {} };
  }
  return state.yearsData[year];
}

// ============================================================
// Available years helper
// ============================================================
export function getAvailableYears(data: Record<number, YearData>): number[] {
  const years = new Set(Object.keys(data).map(Number));
  years.add(new Date().getFullYear());
  return [...years].sort((a, b) => b - a);
}

// ============================================================
// Store
// ============================================================
export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      currentYear: new Date().getFullYear(),
      yearsData: {},
      isLoading: false,
      isCompletionsLoading: false,
      error: null,
      seededDefaults: false,

      // ------------------------------------------------------
      seedDefaultTasks: () => {
        if (get().seededDefaults) return;
        const year = get().currentYear;
        const yd = ensureYear(get(), year);
        if (yd.habits.length > 0) { set({ seededDefaults: true }); return; }
        const defaults = [
          { title: "10 отжиманий / 10 push-ups", type: "daily" as const },
          { title: "10 пресс / 10 crunches", type: "daily" as const },
          { title: "10 подтягиваний / 10 pull-ups", type: "daily" as const },
        ];
        const now = new Date().toISOString();
        const habits = defaults.map((d, i) => ({
          id: crypto.randomUUID(), title: d.title, type: d.type,
          is_active: true, sort_order: i, created_at: now,
        }));
        set((state) => ({
          seededDefaults: true,
          yearsData: {
            ...state.yearsData,
            [year]: { habits, completedHabitsByDate: yd.completedHabitsByDate },
          },
        }));
      },

      // ------------------------------------------------------
      setCurrentYear: (year) => set({ currentYear: year }),

      // ------------------------------------------------------
      fetchFromSupabase: async (year) => {
        set({ isLoading: true, error: null });
        try {
          const user = (await supabase.auth.getUser()).data.user;
          if (!user) {
            set({ isLoading: false });
            return;
          }

          const { data: habits } = await supabase
            .from("habits")
            .select("*")
            .eq("user_id", user.id)
            .order("sort_order", { ascending: true });

          const startOfYear = `${year}-01-01`;
          const endOfYear = `${year}-12-31`;
          const { data: completions } = await supabase
            .from("habit_completions")
            .select("habit_id, completed_date, status")
            .eq("user_id", user.id)
            .gte("completed_date", startOfYear)
            .lte("completed_date", endOfYear);

          const map: StatusMap = {};
          if (completions) {
            for (const row of completions as { habit_id: string; completed_date: string; status?: HabitStatus }[]) {
              if (!map[row.completed_date]) map[row.completed_date] = {};
              // Fallback to "done" if status column doesn't exist yet to maintain backward compatibility
              map[row.completed_date][row.habit_id] = row.status || "done";
            }
          }

          set((state) => ({
            yearsData: {
              ...state.yearsData,
              [year]: {
                habits: (habits as Habit[]) ?? [],
                completedHabitsByDate: {
                  ...(state.yearsData[year]?.completedHabitsByDate ?? {}),
                  ...map,
                },
              },
            },
            isLoading: false,
          }));
        } catch (err) {
          set({ isLoading: false, error: String(err) });
        }
      },

      // ------------------------------------------------------
      addHabit: (data) => {
        const id = crypto.randomUUID();
        const year = get().currentYear;
        const yearData = ensureYear(get(), year);
        const now = new Date().toISOString();
        const cleanTitle = sanitize(data.title);
        if (!cleanTitle) return;

        const habit: Habit = {
          id, title: cleanTitle, type: data.type,
          is_active: true, sort_order: yearData.habits.length, created_at: now,
        };

        set((state) => ({
          yearsData: {
            ...state.yearsData,
            [year]: {
              habits: [...yearData.habits, habit],
              completedHabitsByDate: yearData.completedHabitsByDate,
            },
          },
        }));

        supabase.auth.getUser().then(({ data: authData }) => {
          if (!authData.user) return;
          supabase.from("habits").insert({
            id, user_id: authData.user.id, title: cleanTitle,
            type: data.type, sort_order: yearData.habits.length,
          }).then(({ error }) => {
            if (error) console.warn("[supabase] habit insert failed:", error.message);
          });
        });
      },

      // ------------------------------------------------------
      updateHabit: (habitId, data) => {
        const year = get().currentYear;
        set((state) => {
          const yd = ensureYear(state, year);
          return {
            yearsData: {
              ...state.yearsData,
              [year]: {
                ...yd,
                habits: yd.habits.map((h) =>
                  h.id === habitId
                    ? { ...h, ...(data.title !== undefined ? { title: sanitize(data.title) } : {}), ...(data.type !== undefined ? { type: data.type } : {}) }
                    : h,
                ),
              },
            },
          };
        });
      },

      // ------------------------------------------------------
      deleteHabit: (habitId) => {
        const year = get().currentYear;
        set((state) => {
          const yd = ensureYear(state, year);
          return {
            yearsData: {
              ...state.yearsData,
              [year]: { ...yd, habits: yd.habits.filter((h) => h.id !== habitId) },
            },
          };
        });
        supabase.from("habits").delete().eq("id", habitId).then(({ error }) => {
          if (error) console.warn("[supabase] habit delete failed:", error.message);
        });
      },

      // ------------------------------------------------------
      toggleHabitCompletion: (habitId, date) => {
        const year = get().currentYear;
        const yd = ensureYear(get(), year);
        const currentStatuses = yd.completedHabitsByDate[date] || {};
        const currentStatus = currentStatuses[habitId] || "none";

        let nextStatus: HabitStatus;
        if (currentStatus === "none") nextStatus = "done";
        else if (currentStatus === "done") nextStatus = "skipped";
        else nextStatus = "none";

        set((state) => {
          const yd2 = ensureYear(state, year);
          const newStatuses = { ...yd2.completedHabitsByDate[date] };

          if (nextStatus === "none") {
              delete newStatuses[habitId];
          } else {
              newStatuses[habitId] = nextStatus;
          }

          return {
            yearsData: {
              ...state.yearsData,
              [year]: {
                ...yd2,
                completedHabitsByDate: {
                  ...yd2.completedHabitsByDate,
                  [date]: newStatuses,
                },
              },
            },
          };
        });

        if (nextStatus === "none") {
          supabase.from("habit_completions").delete()
            .eq("habit_id", habitId).eq("completed_date", date)
            .then(({ error }) => {
              if (error) console.warn("[supabase] completion delete failed:", error.message);
            });
        } else {
          supabase.auth.getUser().then(({ data: authData }) => {
            if (!authData.user) return;
            // Use upsert to handle updates from "done" to "skipped" and inserts for new records
            supabase.from("habit_completions").upsert({
              habit_id: habitId, user_id: authData.user.id, completed_date: date, status: nextStatus
            }, { onConflict: 'habit_id, completed_date' }).then(({ error }) => {
              if (error) console.warn("[supabase] completion upsert failed:", error.message);
            });
          });
        }
      },
    }),
    {
      name: "life-is-a-game-v2",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentYear: state.currentYear,
        yearsData: state.yearsData,
        seededDefaults: state.seededDefaults,
      }),
    },
  ),
);

// ============================================================
// Selectors
// ============================================================
const EMPTY_YEAR: YearData = Object.freeze({ habits: [], completedHabitsByDate: {} });

const currentYearData = (s: HabitState): YearData =>
  s.yearsData[s.currentYear] ?? EMPTY_YEAR;

export const useHabits = () => useHabitStore((s) => currentYearData(s).habits);

export const useDateCompletionCount = (date: string): number =>
  useHabitStore((s) => {
      const statuses = currentYearData(s).completedHabitsByDate[date] || {};
      return Object.values(statuses).filter(status => status === "done").length;
  });

export const useHabitStatus = (habitId: string, date: string): HabitStatus =>
  useHabitStore((s) => currentYearData(s).completedHabitsByDate[date]?.[habitId] ?? "none");

export const useStreaks = (): StreakResult => {
  const map = useHabitStore((s) => currentYearData(s).completedHabitsByDate);
  return useMemo(() => computeStreaks(map), [map]);
};

export const useCurrentYear = () => useHabitStore((s) => s.currentYear);

export const useAllYears = (): number[] => {
  const data = useHabitStore((s) => s.yearsData);
  return useMemo(() => getAvailableYears(data), [data]);
};

export const useTodayCompleted = (): { done: number; skipped: number; none: number; total: number; pct: number } => {
  const yd = useHabitStore(s => currentYearData(s));

  return useMemo(() => {
    const today = formatDate(new Date());
    const activeIds = new Set(yd.habits.filter((h) => h.is_active).map((h) => h.id));
    const statuses = yd.completedHabitsByDate[today] || {};

    let done = 0;
    let skipped = 0;

    Object.entries(statuses).forEach(([id, status]) => {
        if (activeIds.has(id)) {
            if (status === "done") done++;
            if (status === "skipped") skipped++;
        }
    });

    const total = activeIds.size;
    const none = Math.max(0, total - done - skipped);

    return {
      done, skipped, none, total,
      pct: total > 0 ? Math.round((done / total) * 100) : 0,
    };
  }, [yd]);
};

export const useMonthlyProgress = (): { done: number; skipped: number; none: number; total: number; pct: number } => {
  const map = useHabitStore((s) => currentYearData(s).completedHabitsByDate);
  const habitsCount = useHabitStore((s) => currentYearData(s).habits.filter(h => h.is_active).length);

  return useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();

    let done = 0;
    let skipped = 0;
    const total = totalDays * habitsCount;

    for (let d = 1; d <= totalDays; d++) {
        const statuses = map[formatDate(new Date(year, month, d))] || {};
        Object.values(statuses).forEach(status => {
            if (status === "done") done++;
            if (status === "skipped") skipped++;
        });
    }

    const none = Math.max(0, total - done - skipped);

    return { done, skipped, none, total, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
  }, [map, habitsCount]);
};

export const useTopHabits = (limit = 3) => {
    const { habits, completedHabitsByDate } = useHabitStore(s => currentYearData(s));

    return useMemo(() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const totalDays = new Date(year, month + 1, 0).getDate();

        const activeHabits = habits.filter(h => h.is_active);
        const stats = activeHabits.map(habit => {
            let done = 0;
            for (let d = 1; d <= totalDays; d++) {
                const date = formatDate(new Date(year, month, d));
                if (completedHabitsByDate[date]?.[habit.id] === "done") {
                    done++;
                }
            }
            return {
                ...habit,
                done,
                pct: Math.round((done / totalDays) * 100)
            };
        });

        return stats.sort((a, b) => b.pct - a.pct).slice(0, limit);
    }, [habits, completedHabitsByDate]);
}

/** Max completions across last 180 days (for heatmap scale) */
export const useMaxCompletions = (): number =>
  useHabitStore((s) => {
    const map = currentYearData(s).completedHabitsByDate;
    let max = 0;
    const now = new Date();
    for (let i = 0; i < 180; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const statuses = map[formatDate(d)] || {};
      const c = Object.values(statuses).filter(status => status === "done").length;
      if (c > max) max = c;
    }
    return max;
  });
