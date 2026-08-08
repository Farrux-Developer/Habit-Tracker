"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export type Lang = "en" | "ru";

const translations: Record<Lang, Record<string, string>> = {
  en: {
    appTitle: "Habit Tracker",
    appSub: "Dashboard",
    habitTracker: "Habit Tracker",
    activity: "Activity",
    days: "days",
    today: "Today",
    tasks: "Habits",
    stats: "Statistics",
    settings: "Settings",
    home: "Home",
    addHabit: "Add Habit",
    newHabit: "New habit title...",
    cancel: "Cancel",
    add: "Create Habit",
    daily: "Daily",
    once: "Once",
    less: "Less",
    more: "More",
    done: "Done",
    skipped: "Skipped",
    notDone: "Remaining",
    total: "Total",
    streak: "day streak",
    record: "record",
    noTasks: "No habits added yet.",
    addFirstHabit: "Add First Habit",
    allDone: "ALL DONE TODAY",
    day: "days",
    archive: "Archive",
    readOnly: "view-only",
    manageTasks: "Manage your daily habits & targets",
    topHabits: "Top Habits Ranking",
    completionOverview: "Completion Overview",
    monthView: "Month",
    weekView: "Current Week",
    week: "Week",
    pastLockedNotice: "Past days are view-only. Click today's cells to toggle status.",
    trend: "Completion Trend",
    statusCycleHint: "Click today's cell to toggle: Done → Skipped → Empty",
    delete: "Delete",
    confirmDelete: "Confirm Delete",
    areYouAdmin: "Are you admin?",
    installApp: "Install App",
    adminModalTitle: "Admin Authorization",
    username: "Username",
    password: "Password",
    login: "Sign In",
    invalidAdmin: "Invalid admin credentials",
    tooManyAttempts: "Too many failed attempts. Please wait 1 minute.",
    tasksTab: "Task Planner",
    habitsTab: "Habits",
    budgetTab: "Yearly Budget",
    aiSummaryTitle: "AI Monthly Insights",
    getAiSummary: "Generate AI Summary",
    downloadApp: "Download App",
    priorityLow: "Low",
    priorityMed: "Medium",
    priorityHigh: "High",
    income: "Income",
    expenses: "Expenses",
    remaining: "Net Remaining",
    budgetVsActual: "Budget vs. Actual",
    subscriptions: "Subscriptions & Recurring",
  },
  ru: {
    appTitle: "Трекер привычек",
    appSub: "Дашборд",
    habitTracker: "Трекер привычек",
    activity: "Активность",
    days: "дней",
    today: "Сегодня",
    tasks: "Привычки",
    stats: "Статистика",
    settings: "Настройки",
    home: "Главная",
    addHabit: "Добавить привычку",
    newHabit: "Название привычки...",
    cancel: "Отмена",
    add: "Создать привычку",
    daily: "Ежедневно",
    once: "Разово",
    less: "Меньше",
    more: "Больше",
    done: "Сделано",
    skipped: "Пропущено",
    notDone: "Осталось",
    total: "Всего",
    streak: "дней подряд",
    record: "рекорд",
    noTasks: "У вас пока нет привычек.",
    addFirstHabit: "Добавить первую привычку",
    allDone: "ВСЁ СДЕЛАНО СЕГОДНЯ",
    day: "дней",
    archive: "Архив",
    readOnly: "только просмотр",
    manageTasks: "Управление привычками и целями",
    topHabits: "Рейтинг привычек",
    completionOverview: "Анализ выполнения",
    monthView: "Месяц",
    weekView: "Текущая неделя",
    week: "Неделя",
    pastLockedNotice: "Прошлые дни доступно только просмотр. Кликайте по ячейкам за 'Сегодня'.",
    trend: "Динамика выполнения",
    statusCycleHint: "Клик по сегодня: Сделано → Пропущено → Не отмечено",
    delete: "Удалить",
    confirmDelete: "Подтвердить",
    areYouAdmin: "Вы админ?",
    installApp: "Установить приложение",
    adminModalTitle: "Авторизация Администратора",
    username: "Имя пользователя",
    password: "Пароль",
    login: "Войти",
    invalidAdmin: "Неверное имя пользователя или пароль",
    tooManyAttempts: "Слишком много неудачных попыток. Подождите 1 минуту.",
    tasksTab: "Планер задач",
    habitsTab: "Привычки",
    budgetTab: "Годовой бюджет",
    aiSummaryTitle: "AI-Сводка месяца",
    getAiSummary: "Сформировать AI-анализ",
    downloadApp: "Скачать приложение",
    priorityLow: "Низкий",
    priorityMed: "Средний",
    priorityHigh: "Высокий",
    income: "Доходы",
    expenses: "Расходы",
    remaining: "Остаток",
    budgetVsActual: "Бюджет vs План",
    subscriptions: "Подписки и платежи",
  },
};

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const LangContext = createContext<LangCtx>({
  lang: "en", setLang: () => {}, t: (k) => k,
});

const STORAGE_KEY = "life-is-a-game-lang";

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return "en";
    return (localStorage.getItem(STORAGE_KEY) as Lang) ?? "en";
  });

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem(STORAGE_KEY, l);
  }, []);

  const t = useCallback(
    (key: string) => translations[lang]?.[key] ?? key,
    [lang],
  );

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}

// Clear Segmented EN | RU Switcher
export function LangSwitcher() {
  const { lang, setLang } = useLang();
  return (
    <div className="flex overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] p-0.5 text-[10px] font-bold">
      <button
        onClick={() => setLang("en")}
        className={`rounded-lg px-2 py-0.5 transition-all ${
          lang === "en"
            ? "bg-[var(--accent)] text-white shadow-sm"
            : "text-[var(--muted)] hover:text-[var(--foreground)]"
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLang("ru")}
        className={`rounded-lg px-2 py-0.5 transition-all ${
          lang === "ru"
            ? "bg-[var(--accent)] text-white shadow-sm"
            : "text-[var(--muted)] hover:text-[var(--foreground)]"
        }`}
      >
        RU
      </button>
    </div>
  );
}
