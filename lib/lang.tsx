"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export type Lang = "en" | "ru";

const translations: Record<Lang, Record<string, string>> = {
  en: {
    appTitle: "Life is a Game",
    appSub: "Dashboard",
    habitTracker: "Habit Tracker",
    activity: "Activity",
    days: "days",
    today: "Today",
    tasks: "Tasks",
    stats: "Statistics",
    settings: "Settings",
    home: "Home",
    addHabit: "Add habit",
    newHabit: "New habit...",
    cancel: "Cancel",
    add: "Add",
    daily: "Daily",
    once: "Once",
    less: "Less",
    more: "More",
    done: "Done",
    total: "Total",
    streak: "day streak",
    record: "record",
    noTasks: "No tasks. Go to Tasks tab to create.",
    allDone: "ALL DONE",
    day: "days",
    archive: "Archive",
    readOnly: "read-only",
    manageTasks: "Manage your habits & one-time tasks",
    areYouAdmin: "Are you admin?",
    monthly: "Monthly",
    weekly: "Weekly",
    pushups: "10 push-ups",
    crunches: "10 crunches",
    pullups: "10 pull-ups",
    delete: "Delete",
    confirmDelete: "Confirm delete",
  },
  ru: {
    appTitle: "Life is a Game",
    appSub: "Дашборд",
    habitTracker: "Трекер привычек",
    activity: "Активность",
    days: "дней",
    today: "Сегодня",
    tasks: "Задачи",
    stats: "Статистика",
    settings: "Настройки",
    home: "Главная",
    addHabit: "Добавить",
    newHabit: "Новая привычка...",
    cancel: "Отмена",
    add: "Добавить",
    daily: "Ежедневно",
    once: "Разово",
    less: "Меньше",
    more: "Больше",
    done: "Сделано",
    total: "Всего",
    streak: "дней подряд",
    record: "рекорд",
    noTasks: "Нет задач. Добавь во вкладке Задачи.",
    allDone: "ВСЁ ГОТОВО",
    day: "дней",
    archive: "Архив",
    readOnly: "только чтение",
    manageTasks: "Управление привычками и задачами",
    areYouAdmin: "Вы админ?",
    monthly: "За месяц",
    weekly: "За неделю",
    pushups: "10 отжиманий",
    crunches: "10 пресс",
    pullups: "10 подтягиваний",
    delete: "Удалить",
    confirmDelete: "Подтвердить",
  },
};

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const LangContext = createContext<LangCtx>({
  lang: "ru", setLang: () => {}, t: (k) => k,
});

const STORAGE_KEY = "life-is-a-game-lang";

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return "ru";
    return (localStorage.getItem(STORAGE_KEY) as Lang) ?? "ru";
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

// Quick switcher component
export function LangSwitcher() {
  const { lang, setLang } = useLang();
  return (
    <button
      onClick={() => setLang(lang === "ru" ? "en" : "ru")}
      className="rounded-full border border-[var(--border)] bg-[var(--surface-secondary)]
                 px-2.5 py-1 text-[10px] font-bold tracking-wide
                 text-[var(--foreground)] transition-all hover:border-[var(--accent)]"
    >
      {lang === "ru" ? "EN" : "RU"}
    </button>
  );
}
