"use client";

import { useState, useEffect } from "react";
import { useCurrentYear, useCurrentMonth, useHabitStore, useViewMode } from "@/lib/store";
import { useLang, LangSwitcher } from "@/lib/lang";
import ThemeToggle from "@/components/ThemeToggle";
import {
  Zap,
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar,
  Grid,
  Download,
  Laptop,
  ListTodo,
  DollarSign,
} from "@/components/icons";

const MONTH_NAMES_RU = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
];
const MONTH_NAMES_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

interface HeaderProps {
  onOpenAddModal: () => void;
  onOpenDownloadModal?: () => void;
}

export default function Header({ onOpenAddModal, onOpenDownloadModal }: HeaderProps) {
  const { lang, t } = useLang();
  const year = useCurrentYear();
  const month = useCurrentMonth();
  const viewMode = useViewMode();
  const activeTab = useHabitStore((s) => s.activeTab);
  const setActiveTab = useHabitStore((s) => s.setActiveTab);
  const setMonthAndYear = useHabitStore((s) => s.setMonthAndYear);
  const setViewMode = useHabitStore((s) => s.setViewMode);

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallPWA = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => setDeferredPrompt(null));
    }
  };

  const months = lang === "ru" ? MONTH_NAMES_RU : MONTH_NAMES_EN;

  const handlePrevMonth = () => {
    if (month === 0) {
      setMonthAndYear(11, year - 1);
    } else {
      setMonthAndYear(month - 1, year);
    }
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setMonthAndYear(0, year + 1);
    } else {
      setMonthAndYear(month + 1, year);
    }
  };

  const isCurrentMonthYear =
    year === new Date().getFullYear() && month === new Date().getMonth();

  return (
    <header className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)]/60 pb-3.5">
      {/* Brand Logo & Module Tabs */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-transform duration-300 hover:scale-105 hover:rotate-[-6deg]">
            <Zap size={18} className="text-white fill-white" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-[var(--foreground)] leading-none">
              {t("appTitle")}
            </h1>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--accent)]">
              {t("appSub")}
            </span>
          </div>
        </div>

        {/* 3 Module Segmented Navigation Tabs */}
        <nav className="flex overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] p-1 text-xs font-bold shadow-inner">
          <button
            onClick={() => setActiveTab("habits")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
              activeTab === "habits"
                ? "bg-[var(--surface)] text-[var(--foreground)] shadow-sm"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            <Zap size={13} className="text-emerald-500" />
            <span>{t("habitsTab")}</span>
          </button>

          <button
            onClick={() => setActiveTab("tasks")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
              activeTab === "tasks"
                ? "bg-[var(--surface)] text-[var(--foreground)] shadow-sm"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            <ListTodo size={13} className="text-sky-500" />
            <span>{t("tasksTab")}</span>
          </button>

          <button
            onClick={() => setActiveTab("budget")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
              activeTab === "budget"
                ? "bg-[var(--surface)] text-[var(--foreground)] shadow-sm"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            <DollarSign size={13} className="text-amber-500" />
            <span>{t("budgetTab")}</span>
          </button>
        </nav>
      </div>

      {/* Month Switcher Controls (Only in Habits view) */}
      {activeTab === "habits" && (
        <div className="flex items-center gap-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-1 shadow-sm">
          <button
            onClick={handlePrevMonth}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--muted)] transition-colors hover:bg-[var(--surface-secondary)] hover:text-[var(--foreground)]"
            title="Previous Month"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="flex items-center gap-1.5 px-2 text-xs font-bold text-[var(--foreground)] min-w-[120px] justify-center">
            <Calendar size={13} className="text-[var(--accent)]" />
            <span>{months[month]} {year}</span>
            {isCurrentMonthYear && (
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </div>

          <button
            onClick={handleNextMonth}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--muted)] transition-colors hover:bg-[var(--surface-secondary)] hover:text-[var(--foreground)]"
            title="Next Month"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* View Mode & Utility Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        {activeTab === "habits" && (
          <div className="flex overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] p-0.5 text-xs font-semibold">
            <button
              onClick={() => setViewMode("month")}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] transition-all ${
                viewMode === "month"
                  ? "bg-[var(--accent)] text-white shadow-sm"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              <Grid size={12} />
              {t("monthView")}
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] transition-all ${
                viewMode === "week"
                  ? "bg-[var(--accent)] text-white shadow-sm"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              <Calendar size={12} />
              {t("weekView")}
            </button>
          </div>
        )}

        {/* Download Desktop App CTA */}
        {onOpenDownloadModal && (
          <button
            onClick={onOpenDownloadModal}
            className="flex items-center gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-[11px] font-bold text-[var(--foreground)] hover:border-[var(--accent)]/50 transition-all active:scale-95"
            title="Download Native App"
          >
            <Laptop size={13} className="text-[var(--accent)]" />
            <span className="hidden sm:inline">{t("downloadApp")}</span>
          </button>
        )}

        {/* PWA Install Button */}
        {deferredPrompt && (
          <button
            onClick={handleInstallPWA}
            className="flex items-center gap-1 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-[11px] font-bold text-emerald-500 transition-all hover:bg-emerald-500/20 active:scale-95"
            title="Install Web App"
          >
            <Download size={13} />
            <span>{t("installApp")}</span>
          </button>
        )}

        <LangSwitcher />
        <ThemeToggle />

        {/* Add Habit CTA */}
        {activeTab === "habits" && (
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 rounded-xl bg-[var(--accent)] px-3.5 py-1.5 text-xs font-bold text-white shadow-md transition-all duration-200 hover:brightness-110 active:scale-95"
          >
            <Plus size={14} className="stroke-[3]" />
            <span>{t("addHabit")}</span>
          </button>
        )}
      </div>
    </header>
  );
}

