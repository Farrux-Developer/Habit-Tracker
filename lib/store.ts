import { useMemo } from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from './supabase';
import { sanitize } from './security';

// ============================================================
// Types
// ============================================================
export type HabitDayStatus = 'done' | 'skipped' | 'not_done';

export interface Habit {
  id: string;
  title: string;
  type: 'daily' | 'one_time';
  is_active: boolean;
  sort_order: number;
  created_at: string;
  color?: string;
}

export interface PlannerTask {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  category: string;
  createdAt: string;
}

export interface BudgetItem {
  id: string;
  category: string;
  budget: number;
  actual: number;
  color: string;
}

export interface SubscriptionItem {
  id: string;
  name: string;
  cost: number;
  renewalDate: string;
  category: string;
}

export interface StreakResult {
  currentStreak: number;
  maxStreak: number;
  totalContributions: number;
}

type CompletionMap = Record<string, string[]>; // "YYYY-MM-DD" → habitIds
type StatusMap = Record<string, Record<string, HabitDayStatus>>; // "YYYY-MM-DD" → { habitId: status }

interface YearData {
  habits: Habit[];
  completedHabitsByDate: CompletionMap;
  habitStatusesByDate?: StatusMap;
}

interface HabitState {
  // --- Data ---
  activeTab: 'habits' | 'tasks' | 'budget';
  currentYear: number;
  currentMonth: number; // 0-11
  viewMode: 'month' | 'week';
  yearsData: Record<number, YearData>;
  isLoading: boolean;
  isCompletionsLoading: boolean;
  error: string | null;
  seededDefaults: boolean;

  // Task Planner State
  plannerTasks: PlannerTask[];

  // Budget Planner State
  monthlyIncome: number;
  budgetExpenses: BudgetItem[];
  subscriptions: SubscriptionItem[];

  // --- Actions ---
  setActiveTab: (tab: 'habits' | 'tasks' | 'budget') => void;
  setCurrentYear: (year: number) => void;
  setCurrentMonth: (month: number) => void;
  setMonthAndYear: (month: number, year: number) => void;
  setViewMode: (mode: 'month' | 'week') => void;
  fetchFromSupabase: (year: number) => Promise<void>;
  seedDefaultTasks: () => void;
  addHabit: (data: { title: string; type: 'daily' | 'one_time'; color?: string }) => void;
  updateHabit: (habitId: string, data: { title?: string; type?: 'daily' | 'one_time'; color?: string }) => void;
  deleteHabit: (habitId: string) => void;
  toggleHabitCompletion: (habitId: string, date: string) => void;
  setHabitDayStatus: (habitId: string, date: string, status: HabitDayStatus) => void;
  cycleHabitDayStatus: (habitId: string, date: string) => void;

  // Task Planner Actions
  addPlannerTask: (task: Omit<PlannerTask, 'id' | 'createdAt'>) => void;
  togglePlannerTask: (id: string) => void;
  deletePlannerTask: (id: string) => void;

  // Budget Actions
  setMonthlyIncome: (amount: number) => void;
  addBudgetItem: (item: Omit<BudgetItem, 'id'>) => void;
  updateBudgetItem: (id: string, item: Partial<BudgetItem>) => void;
  deleteBudgetItem: (id: string) => void;
  addSubscription: (sub: Omit<SubscriptionItem, 'id'>) => void;
  deleteSubscription: (id: string) => void;
}

// ============================================================
// Helpers
// ============================================================
export function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function dateRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const cursor = new Date(start + 'T00:00:00');
  const last = new Date(end + 'T00:00:00');
  while (cursor <= last) {
    dates.push(formatDate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

function computeStreaks(map: CompletionMap, statusMap?: StatusMap): StreakResult {
  const today = formatDate(new Date());
  const yesterday = formatDate(new Date(Date.now() - 86400000));

  const activeDates = new Set<string>();
  Object.entries(map).forEach(([date, ids]) => {
    if (ids.length > 0) activeDates.add(date);
  });
  if (statusMap) {
    Object.entries(statusMap).forEach(([date, statuses]) => {
      if (Object.values(statuses).some((s) => s === 'done')) activeDates.add(date);
    });
  }

  const total = activeDates.size;
  if (activeDates.size === 0) {
    return { currentStreak: 0, maxStreak: 0, totalContributions: 0 };
  }

  let currentStreak = 0;
  const startFrom = activeDates.has(today) ? today : activeDates.has(yesterday) ? yesterday : null;

  if (startFrom) {
    const cursor = new Date(startFrom + 'T00:00:00');
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
    const curr = new Date(dateStr + 'T00:00:00');
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
    return { habits: [], completedHabitsByDate: {}, habitStatusesByDate: {} };
  }
  return state.yearsData[year];
}

export function getAvailableYears(data: Record<number, YearData>): number[] {
  const years = new Set(Object.keys(data).map(Number));
  years.add(new Date().getFullYear());
  return [...years].sort((a, b) => b - a);
}

const DEFAULT_HABIT_COLORS = [
  '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#f59e0b', '#06b6d4', '#f97316'
];

const dummyStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

const safeStorage = createJSONStorage(() =>
  typeof window !== 'undefined' ? localStorage : dummyStorage
);

// ============================================================
// Store
// ============================================================
export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      activeTab: 'habits',
      currentYear: new Date().getFullYear(),
      currentMonth: new Date().getMonth(),
      viewMode: 'month',
      yearsData: {},
      isLoading: false,
      isCompletionsLoading: false,
      error: null,
      seededDefaults: false,

      // Task Planner Initial State
      plannerTasks: [],

      // Budget Planner Initial State (Clean Empty State by default)
      monthlyIncome: 0,
      budgetExpenses: [],
      subscriptions: [],

      // ------------------------------------------------------
      setActiveTab: (tab) => set({ activeTab: tab }),

      // ------------------------------------------------------
      seedDefaultTasks: () => {
        if (get().seededDefaults) return;
        set({ seededDefaults: true });
      },

      // ------------------------------------------------------
      setCurrentYear: (year) => set({ currentYear: year }),
      setCurrentMonth: (month) => set({ currentMonth: (month + 12) % 12 }),
      setMonthAndYear: (month, year) => set({ currentMonth: (month + 12) % 12, currentYear: year }),
      setViewMode: (mode) => set({ viewMode: mode }),

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
            .from('habits')
            .select('*')
            .eq('user_id', user.id)
            .order('sort_order', { ascending: true });

          const startOfYear = `${year}-01-01`;
          const endOfYear = `${year}-12-31`;
          const { data: completions } = await supabase
            .from('habit_completions')
            .select('habit_id, completed_date')
            .eq('user_id', user.id)
            .gte('completed_date', startOfYear)
            .lte('completed_date', endOfYear);

          const map: CompletionMap = {};
          if (completions) {
            for (const row of completions as { habit_id: string; completed_date: string }[]) {
              if (!map[row.completed_date]) map[row.completed_date] = [];
              map[row.completed_date].push(row.habit_id);
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
                habitStatusesByDate: state.yearsData[year]?.habitStatusesByDate ?? {},
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

        const habitColor = data.color || DEFAULT_HABIT_COLORS[yearData.habits.length % DEFAULT_HABIT_COLORS.length];

        const habit: Habit = {
          id,
          title: cleanTitle,
          type: data.type,
          is_active: true,
          sort_order: yearData.habits.length,
          created_at: now,
          color: habitColor,
        };

        set((state) => ({
          yearsData: {
            ...state.yearsData,
            [year]: {
              habits: [...yearData.habits, habit],
              completedHabitsByDate: yearData.completedHabitsByDate,
              habitStatusesByDate: yearData.habitStatusesByDate ?? {},
            },
          },
        }));

        supabase.auth.getUser().then(({ data: authData }) => {
          if (!authData.user) return;
          supabase
            .from('habits')
            .insert({
              id,
              user_id: authData.user.id,
              title: cleanTitle,
              type: data.type,
              sort_order: yearData.habits.length,
            })
            .then(({ error }) => {
              if (error) console.warn('[supabase] habit insert failed:', error.message);
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
                    ? {
                        ...h,
                        ...(data.title !== undefined ? { title: sanitize(data.title) } : {}),
                        ...(data.type !== undefined ? { type: data.type } : {}),
                        ...(data.color !== undefined ? { color: data.color } : {}),
                      }
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
              [year]: {
                ...yd,
                habits: yd.habits.map((h) =>
                  h.id === habitId ? { ...h, is_active: false } : h
                ),
              },
            },
          };
        });
      },

      // ------------------------------------------------------
      toggleHabitCompletion: (habitId, date) => {
        get().cycleHabitDayStatus(habitId, date);
      },

      setHabitDayStatus: (habitId, date, status) => {
        const year = parseInt(date.split('-')[0], 10) || get().currentYear;
        set((state) => {
          const yd = ensureYear(state, year);
          const currentStatuses = { ...(yd.habitStatusesByDate ?? {}) };
          const dateStatuses = { ...(currentStatuses[date] ?? {}) };

          if (status === 'not_done') {
            delete dateStatuses[habitId];
          } else {
            dateStatuses[habitId] = status;
          }

          if (Object.keys(dateStatuses).length === 0) {
            delete currentStatuses[date];
          } else {
            currentStatuses[date] = dateStatuses;
          }

          const currentDoneIds = yd.completedHabitsByDate[date] ?? [];
          const isDone = status === 'done';
          const newDoneIds = isDone
            ? Array.from(new Set([...currentDoneIds, habitId]))
            : currentDoneIds.filter((id) => id !== habitId);

          return {
            yearsData: {
              ...state.yearsData,
              [year]: {
                ...yd,
                habitStatusesByDate: currentStatuses,
                completedHabitsByDate: {
                  ...yd.completedHabitsByDate,
                  [date]: newDoneIds,
                },
              },
            },
          };
        });
      },

      cycleHabitDayStatus: (habitId, date) => {
        const year = parseInt(date.split('-')[0], 10) || get().currentYear;
        const yd = ensureYear(get(), year);
        const statusMap = yd.habitStatusesByDate?.[date];
        const legacyArray = yd.completedHabitsByDate[date] ?? [];

        let currentStatus: HabitDayStatus = 'not_done';
        if (statusMap && statusMap[habitId]) {
          currentStatus = statusMap[habitId];
        } else if (legacyArray.includes(habitId)) {
          currentStatus = 'done';
        }

        const nextStatus: HabitDayStatus =
          currentStatus === 'not_done' ? 'done' : currentStatus === 'done' ? 'skipped' : 'not_done';

        get().setHabitDayStatus(habitId, date, nextStatus);
      },

      // ------------------------------------------------------
      // Task Planner Actions
      // ------------------------------------------------------
      addPlannerTask: (task) => {
        const newTask: PlannerTask = {
          ...task,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          plannerTasks: [newTask, ...state.plannerTasks],
        }));
      },

      togglePlannerTask: (id) => {
        set((state) => ({
          plannerTasks: state.plannerTasks.map((t) =>
            t.id === id ? { ...t, completed: !t.completed } : t
          ),
        }));
      },

      deletePlannerTask: (id) => {
        set((state) => ({
          plannerTasks: state.plannerTasks.filter((t) => t.id !== id),
        }));
      },

      // ------------------------------------------------------
      // Budget Actions
      // ------------------------------------------------------
      setMonthlyIncome: (amount) => set({ monthlyIncome: amount }),

      addBudgetItem: (item) => {
        const newItem: BudgetItem = {
          ...item,
          id: crypto.randomUUID(),
        };
        set((state) => ({
          budgetExpenses: [...state.budgetExpenses, newItem],
        }));
      },

      updateBudgetItem: (id, item) => {
        set((state) => ({
          budgetExpenses: state.budgetExpenses.map((b) =>
            b.id === id ? { ...b, ...item } : b
          ),
        }));
      },

      deleteBudgetItem: (id) => {
        set((state) => ({
          budgetExpenses: state.budgetExpenses.filter((b) => b.id !== id),
        }));
      },

      addSubscription: (sub) => {
        const newSub: SubscriptionItem = {
          ...sub,
          id: crypto.randomUUID(),
        };
        set((state) => ({
          subscriptions: [...state.subscriptions, newSub],
        }));
      },

      deleteSubscription: (id) => {
        set((state) => ({
          subscriptions: state.subscriptions.filter((s) => s.id !== id),
        }));
      },
    }),
    {
      name: 'life-is-a-game-v5',
      storage: safeStorage,
      skipHydration: true,
      partialize: (state) => ({
        activeTab: state.activeTab,
        currentYear: state.currentYear,
        currentMonth: state.currentMonth,
        viewMode: state.viewMode,
        yearsData: state.yearsData,
        seededDefaults: state.seededDefaults,
        plannerTasks: state.plannerTasks,
        monthlyIncome: state.monthlyIncome,
        budgetExpenses: state.budgetExpenses,
        subscriptions: state.subscriptions,
      }),
    },
  ),
);

// ============================================================
// Selectors
// ============================================================
const EMPTY_YEAR: YearData = Object.freeze({ habits: [], completedHabitsByDate: {}, habitStatusesByDate: {} });

const currentYearData = (s: HabitState): YearData => s.yearsData[s.currentYear] ?? EMPTY_YEAR;

export const useHabits = () => useHabitStore((s) => currentYearData(s).habits);
export const useCurrentYear = () => useHabitStore((s) => s.currentYear);
export const useCurrentMonth = () => useHabitStore((s) => s.currentMonth);
export const useViewMode = () => useHabitStore((s) => s.viewMode);

export const useAllYears = (): number[] => {
  const data = useHabitStore((s) => s.yearsData);
  return useMemo(() => getAvailableYears(data), [data]);
};

export const useHabitDayStatus = (habitId: string, date: string): HabitDayStatus =>
  useHabitStore((s) => {
    const yd = currentYearData(s);
    const statusMap = yd.habitStatusesByDate?.[date];
    if (statusMap && statusMap[habitId]) {
      return statusMap[habitId];
    }
    if (yd.completedHabitsByDate[date]?.includes(habitId)) {
      return 'done';
    }
    return 'not_done';
  });

export const useDateCompletionCount = (date: string): number =>
  useHabitStore((s) => {
    const yd = currentYearData(s);
    const statusMap = yd.habitStatusesByDate?.[date];
    if (statusMap) {
      return Object.values(statusMap).filter((st) => st === 'done').length;
    }
    return yd.completedHabitsByDate[date]?.length ?? 0;
  });

export const useIsHabitCompleted = (habitId: string, date: string): boolean =>
  useHabitStore((s) => {
    const status = s.yearsData[s.currentYear]?.habitStatusesByDate?.[date]?.[habitId];
    if (status) return status === 'done';
    return s.yearsData[s.currentYear]?.completedHabitsByDate[date]?.includes(habitId) ?? false;
  });

export const useStreaks = (): StreakResult => {
  const map = useHabitStore((s) => currentYearData(s).completedHabitsByDate);
  const statusMap = useHabitStore((s) => currentYearData(s).habitStatusesByDate);
  return useMemo(() => computeStreaks(map, statusMap), [map, statusMap]);
};

const EMPTY_COMPLETION_MAP: CompletionMap = Object.freeze({});
const EMPTY_STATUS_MAP: StatusMap = Object.freeze({});

export const useTodayStats = (): { done: number; skipped: number; total: number; pct: number } => {
  const habits = useHabits();
  const year = useCurrentYear();
  const statusMap = useHabitStore((s) => s.yearsData[year]?.habitStatusesByDate ?? EMPTY_STATUS_MAP);
  const legacyMap = useHabitStore((s) => s.yearsData[year]?.completedHabitsByDate ?? EMPTY_COMPLETION_MAP);

  return useMemo(() => {
    const today = formatDate(new Date());
    const activeHabits = habits.filter((h) => h.is_active);
    const total = activeHabits.length;

    let done = 0;
    let skipped = 0;

    activeHabits.forEach((h) => {
      const st = statusMap[today]?.[h.id] ?? (legacyMap[today]?.includes(h.id) ? 'done' : 'not_done');
      if (st === 'done') done++;
      if (st === 'skipped') skipped++;
    });

    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    return { done, skipped, total, pct };
  }, [habits, statusMap, legacyMap]);
};

export const useTodayCompleted = useTodayStats;

export const useMonthlyProgress = (): { activeDays: number; totalDays: number; pct: number } => {
  const year = useCurrentYear();
  const month = useCurrentMonth();
  const map = useHabitStore((s) => s.yearsData[year]?.completedHabitsByDate ?? EMPTY_COMPLETION_MAP);
  const statusMap = useHabitStore((s) => s.yearsData[year]?.habitStatusesByDate ?? EMPTY_STATUS_MAP);

  return useMemo(() => {
    const totalDays = new Date(year, month + 1, 0).getDate();
    let activeDays = 0;
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = formatDate(new Date(year, month, d));
      const hasDoneStatus = Object.values(statusMap[dateStr] ?? {}).some((s) => s === 'done');
      const hasLegacyDone = (map[dateStr]?.length ?? 0) > 0;
      if (hasDoneStatus || hasLegacyDone) activeDays++;
    }
    return {
      activeDays,
      totalDays,
      pct: totalDays > 0 ? Math.round((activeDays / totalDays) * 100) : 0,
    };
  }, [map, statusMap, year, month]);
};

export const useTopHabits = () => {
  const year = useCurrentYear();
  const month = useCurrentMonth();
  const habits = useHabits();
  const statusMap = useHabitStore((s) => s.yearsData[year]?.habitStatusesByDate ?? EMPTY_STATUS_MAP);
  const legacyMap = useHabitStore((s) => s.yearsData[year]?.completedHabitsByDate ?? EMPTY_COMPLETION_MAP);

  return useMemo(() => {
    const activeHabits = habits.filter((h) => h.is_active);
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

    const ranked = activeHabits.map((habit) => {
      let doneCount = 0;
      let skippedCount = 0;

      for (let d = 1; d <= totalDaysInMonth; d++) {
        const dateStr = formatDate(new Date(year, month, d));
        const st = statusMap[dateStr]?.[habit.id] ?? (legacyMap[dateStr]?.includes(habit.id) ? 'done' : 'not_done');
        if (st === 'done') doneCount++;
        if (st === 'skipped') skippedCount++;
      }

      const pct = totalDaysInMonth > 0 ? Math.round((doneCount / totalDaysInMonth) * 100) : 0;
      return { habit, doneCount, skippedCount, totalDays: totalDaysInMonth, pct };
    });

    return ranked.sort((a, b) => b.pct - a.pct);
  }, [habits, statusMap, legacyMap, year, month]);
};

export const useDonutStats = () => {
  const year = useCurrentYear();
  const month = useCurrentMonth();
  const habits = useHabits();
  const statusMap = useHabitStore((s) => s.yearsData[year]?.habitStatusesByDate ?? EMPTY_STATUS_MAP);
  const legacyMap = useHabitStore((s) => s.yearsData[year]?.completedHabitsByDate ?? EMPTY_COMPLETION_MAP);

  return useMemo(() => {
    const activeHabits = habits.filter((h) => h.is_active);
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const totalCells = activeHabits.length * totalDaysInMonth;

    let done = 0;
    let skipped = 0;

    activeHabits.forEach((habit) => {
      for (let d = 1; d <= totalDaysInMonth; d++) {
        const dateStr = formatDate(new Date(year, month, d));
        const st = statusMap[dateStr]?.[habit.id] ?? (legacyMap[dateStr]?.includes(habit.id) ? 'done' : 'not_done');
        if (st === 'done') done++;
        if (st === 'skipped') skipped++;
      }
    });

    const notDone = Math.max(0, totalCells - done - skipped);
    const donePct = totalCells > 0 ? Math.round((done / totalCells) * 100) : 0;
    const skippedPct = totalCells > 0 ? Math.round((skipped / totalCells) * 100) : 0;
    const notDonePct = Math.max(0, 100 - donePct - skippedPct);

    return { done, skipped, notDone, totalCells, donePct, skippedPct, notDonePct };
  }, [habits, statusMap, legacyMap, year, month]);
};

export const useMonthlyTrend = () => {
  const year = useCurrentYear();
  const month = useCurrentMonth();
  const habits = useHabits();
  const statusMap = useHabitStore((s) => s.yearsData[year]?.habitStatusesByDate ?? EMPTY_STATUS_MAP);
  const legacyMap = useHabitStore((s) => s.yearsData[year]?.completedHabitsByDate ?? EMPTY_COMPLETION_MAP);
  const todayStr = formatDate(new Date());

  return useMemo(() => {
    const activeHabits = habits.filter((h) => h.is_active);
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const daysNameRU = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

    const result = [];
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const dt = new Date(year, month, d);
      const dateStr = formatDate(dt);
      let done = 0;
      let skipped = 0;

      activeHabits.forEach((h) => {
        const st = statusMap[dateStr]?.[h.id] ?? (legacyMap[dateStr]?.includes(h.id) ? 'done' : 'not_done');
        if (st === 'done') done++;
        if (st === 'skipped') skipped++;
      });

      const total = activeHabits.length;
      const pct = total > 0 ? Math.round((done / total) * 100) : 0;

      result.push({
        date: dateStr,
        dayNum: d,
        dayName: daysNameRU[dt.getDay()],
        doneCount: done,
        skippedCount: skipped,
        totalHabits: total,
        pct,
        isToday: dateStr === todayStr,
        isPast: dateStr < todayStr,
      });
    }

    return result;
  }, [habits, statusMap, legacyMap, year, month, todayStr]);
};

export const useMaxCompletions = (): number =>
  useHabitStore((s) => {
    const map = currentYearData(s).completedHabitsByDate;
    let max = 0;
    const now = new Date();
    for (let i = 0; i < 180; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const c = map[formatDate(d)]?.length ?? 0;
      if (c > max) max = c;
    }
    return max;
  });
