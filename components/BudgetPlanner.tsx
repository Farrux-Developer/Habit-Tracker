"use client";

import { useState } from "react";
import { useHabitStore, useCurrentYear } from "@/lib/store";
import { useLang } from "@/lib/lang";
import { ChevronLeft, ChevronRight, Plus, Trash, Wallet, DollarSign, PieChart, CreditCard } from "@/components/icons";

interface SubCategoryItem {
  id: string;
  name: string;
  budget: number;
  actual: number;
}

const MONTH_NAMES_RU = [
  "ЯНВАРЬ", "ФЕВРАЛЬ", "МАРТ", "АПРЕЛЬ", "МАЙ", "ИЮНЬ",
  "ИЮЛЬ", "АВГУСТ", "СЕНТЯБРЬ", "ОКТЯБРЬ", "НОЯБРЬ", "ДЕКАБРЬ"
];

const MONTH_NAMES_EN = [
  "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
  "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
];

const CURRENCIES = ["₽", "$", "€", "₸", "Br"];

export default function BudgetPlanner() {
  const { lang } = useLang();
  const currentYear = useCurrentYear();
  const currentMonth = useHabitStore((s) => s.currentMonth);
  const setCurrentMonth = useHabitStore((s) => s.setCurrentMonth);

  // Currency selection
  const [currency, setCurrency] = useState("₽");

  // Subcategory states (Clean Empty State by default)
  const [incomes, setIncomes] = useState<SubCategoryItem[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubCategoryItem[]>([]);
  const [recurringPayments, setRecurringPayments] = useState<SubCategoryItem[]>([]);
  const [generalExpenses, setGeneralExpenses] = useState<SubCategoryItem[]>([]);
  const [savings, setSavings] = useState<SubCategoryItem[]>([]);
  const [debts, setDebts] = useState<SubCategoryItem[]>([]);

  // Form states for adding items
  const [incName, setIncName] = useState("");
  const [incBud, setIncBud] = useState("");
  const [incAct, setIncAct] = useState("");

  const [subName, setSubName] = useState("");
  const [subBud, setSubBud] = useState("");
  const [subAct, setSubAct] = useState("");

  const [recName, setRecName] = useState("");
  const [recBud, setRecBud] = useState("");
  const [recAct, setRecAct] = useState("");

  // Category Totals Calculations
  const sumItems = (items: SubCategoryItem[]) => ({
    budget: items.reduce((acc, i) => acc + i.budget, 0),
    actual: items.reduce((acc, i) => acc + i.actual, 0),
  });

  const totalIncome = sumItems(incomes);
  const totalSubs = sumItems(subscriptions);
  const totalRecurring = sumItems(recurringPayments);
  const totalExpenses = sumItems(generalExpenses);
  const totalSavings = sumItems(savings);
  const totalDebts = sumItems(debts);

  const totalOutflowBudget =
    totalSubs.budget +
    totalRecurring.budget +
    totalExpenses.budget +
    totalSavings.budget +
    totalDebts.budget;

  const totalOutflowActual =
    totalSubs.actual +
    totalRecurring.actual +
    totalExpenses.actual +
    totalSavings.actual +
    totalDebts.actual;

  const remainingBudget = totalIncome.budget - totalOutflowBudget;
  const remainingActual = totalIncome.actual - totalOutflowActual;

  const monthLabel =
    lang === "ru"
      ? MONTH_NAMES_RU[currentMonth]
      : MONTH_NAMES_EN[currentMonth];

  const handlePrevMonth = () => {
    setCurrentMonth((currentMonth - 1 + 12) % 12);
  };
  const handleNextMonth = () => {
    setCurrentMonth((currentMonth + 1) % 12);
  };

  // Add Item Handlers
  const addIncome = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incName.trim()) return;
    setIncomes((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: incName.trim(),
        budget: parseFloat(incBud) || 0,
        actual: parseFloat(incAct) || 0,
      },
    ]);
    setIncName("");
    setIncBud("");
    setIncAct("");
  };

  const addSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName.trim()) return;
    setSubscriptions((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: subName.trim(),
        budget: parseFloat(subBud) || 0,
        actual: parseFloat(subAct) || 0,
      },
    ]);
    setSubName("");
    setSubBud("");
    setSubAct("");
  };

  const addRecurring = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recName.trim()) return;
    setRecurringPayments((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: recName.trim(),
        budget: parseFloat(recBud) || 0,
        actual: parseFloat(recAct) || 0,
      },
    ]);
    setRecName("");
    setRecBud("");
    setRecAct("");
  };

  const deleteIncome = (id: string) => setIncomes(prev => prev.filter(i => i.id !== id));
  const deleteSub = (id: string) => setSubscriptions(prev => prev.filter(s => s.id !== id));
  const deleteRec = (id: string) => setRecurringPayments(prev => prev.filter(r => r.id !== id));

  // Data for Category Overview
  const overviewRows = [
    { name: lang === "ru" ? "Доход" : "Income", ...totalIncome, color: "#3b82f6" },
    { name: lang === "ru" ? "Подписки" : "Subscriptions", ...totalSubs, color: "#8b5cf6" },
    { name: lang === "ru" ? "Регулярные платежи" : "Recurring Payments", ...totalRecurring, color: "#06b6d4" },
    { name: lang === "ru" ? "Траты" : "General Expenses", ...totalExpenses, color: "#f59e0b" },
    { name: lang === "ru" ? "Накопления" : "Savings", ...totalSavings, color: "#10b981" },
    { name: lang === "ru" ? "Долги" : "Debts", ...totalDebts, color: "#ec4899" },
  ];

  const pieCategories = overviewRows.slice(1).filter((r) => r.actual > 0);
  const pieTotal = pieCategories.reduce((acc, c) => acc + c.actual, 0);

  return (
    <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
      {/* Top Header Banner: MONTH NAME & Currency Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-gradient-to-r from-sky-500/10 via-indigo-500/5 to-purple-500/10 p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrevMonth}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--surface-secondary)] transition-all active:scale-95"
          >
            <ChevronLeft size={16} />
          </button>
          <h2 className="text-xl font-black tracking-wider text-[var(--foreground)]">
            {monthLabel} {currentYear}
          </h2>
          <button
            onClick={handleNextMonth}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--surface-secondary)] transition-all active:scale-95"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Currency Switcher Pill */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[var(--muted)]">
            {lang === "ru" ? "Валюта:" : "Currency:"}
          </span>
          <div className="flex items-center gap-1 rounded-xl bg-[var(--surface)] p-1 border border-[var(--border)]">
            {CURRENCIES.map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={`rounded-lg px-2.5 py-1 text-xs font-extrabold transition-all ${
                  currency === c
                    ? "bg-[var(--accent)] text-white shadow-sm"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-4 text-xs font-bold">
          <div className="rounded-xl bg-emerald-500/10 px-3 py-1.5 text-emerald-500">
            {lang === "ru" ? "Доход" : "Income"}: {totalIncome.actual.toLocaleString()} {currency}
          </div>
          <div className="rounded-xl bg-rose-500/10 px-3 py-1.5 text-rose-500">
            {lang === "ru" ? "Расход" : "Outflow"}: {totalOutflowActual.toLocaleString()} {currency}
          </div>
        </div>
      </div>

      {/* TOP ROW GRID (3 CARDS MATCHING PHOTO 2 & PHOTO 4) */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* CARD 1: OVERVIEW TABLE */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-sky-500">
              {lang === "ru" ? "ОБЗОР" : "OVERVIEW"}
            </h3>
            <span className="text-[10px] font-bold text-[var(--muted)]">
              {lang === "ru" ? "Сводная таблица" : "Summary Table"}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--border)] text-[10px] uppercase font-extrabold text-[var(--muted)]">
                  <th className="pb-2">{lang === "ru" ? "Категория" : "Category"}</th>
                  <th className="pb-2 text-right">{lang === "ru" ? "Бюджет" : "Budget"}</th>
                  <th className="pb-2 text-right">{lang === "ru" ? "Факт" : "Actual"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] font-semibold">
                {overviewRows.map((row) => (
                  <tr key={row.name} className="hover:bg-[var(--surface-secondary)]/50 transition-colors">
                    <td className="py-2 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: row.color }} />
                      <span className="text-[var(--foreground)]">{row.name}</span>
                    </td>
                    <td className="py-2 text-right text-[var(--muted)]">
                      {row.budget.toLocaleString()} {currency}
                    </td>
                    <td className="py-2 text-right text-[var(--foreground)] font-extrabold">
                      {row.actual.toLocaleString()} {currency}
                    </td>
                  </tr>
                ))}
                {/* Highlight Summary Row: Осталось */}
                <tr className="border-t-2 border-[var(--border)] bg-emerald-500/5 font-extrabold text-emerald-600 dark:text-emerald-400">
                  <td className="py-2.5 pl-1">{lang === "ru" ? "Осталось" : "Remaining"}</td>
                  <td className="py-2.5 text-right">{remainingBudget.toLocaleString()} {currency}</td>
                  <td className="py-2.5 text-right">{remainingActual.toLocaleString()} {currency}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* CARD 2: BUDGET VS ACTUAL EXPENSES */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-500">
              {lang === "ru" ? "РАСХОДЫ БЮДЖЕТ VS ФАКТ" : "BUDGET VS ACTUAL EXPENSES"}
            </h3>
            <div className="flex items-center gap-3 text-[10px] font-extrabold">
              <span className="flex items-center gap-1 text-sky-500">
                <span className="h-2 w-2 rounded-full bg-sky-500" /> {lang === "ru" ? "Бюджет" : "Budget"}
              </span>
              <span className="flex items-center gap-1 text-rose-500">
                <span className="h-2 w-2 rounded-full bg-rose-500" /> {lang === "ru" ? "Факт" : "Actual"}
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {overviewRows.slice(1).map((row) => {
              const maxVal = Math.max(row.budget, row.actual, 1);
              const bPct = Math.round((row.budget / maxVal) * 100);
              const aPct = Math.round((row.actual / maxVal) * 100);

              return (
                <div key={row.name} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-[var(--foreground)]">{row.name}</span>
                    <span className="text-[10px] text-[var(--muted)]">
                      {row.actual.toLocaleString()} {currency} / {row.budget.toLocaleString()} {currency}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[var(--surface-secondary)] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-sky-500 transition-all duration-500"
                      style={{ width: `${bPct}%` }}
                    />
                  </div>
                  <div className="h-2 w-full rounded-full bg-[var(--surface-secondary)] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-rose-500 transition-all duration-500"
                      style={{ width: `${aPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CARD 3: ACTUAL EXPENSES PIE CHART */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-purple-500">
              {lang === "ru" ? "ФАКТИЧЕСКИЕ РАСХОДЫ" : "ACTUAL EXPENSES SPLIT"}
            </h3>
            <PieChart size={16} className="text-purple-500" />
          </div>

          {pieTotal === 0 ? (
            <div className="py-12 text-center text-xs font-semibold text-[var(--muted)]">
              {lang === "ru" ? "Добавьте операции для отображения диаграммы" : "No expense data to display"}
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="relative h-40 w-40 mb-4">
                <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90 transform">
                  {(() => {
                    let accumulatedAngle = 0;
                    return pieCategories.map((c) => {
                      const pct = c.actual / pieTotal;
                      const strokeDasharray = `${pct * 283} 283`;
                      const strokeDashoffset = -accumulatedAngle * 283;
                      accumulatedAngle += pct;

                      return (
                        <circle
                          key={c.name}
                          cx="50"
                          cy="50"
                          r="45"
                          fill="transparent"
                          stroke={c.color}
                          strokeWidth="10"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          className="transition-all duration-500 hover:opacity-80"
                        />
                      );
                    });
                  })()}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-bold text-[var(--muted)]">
                    {lang === "ru" ? "Всего" : "Total"}
                  </span>
                  <span className="text-sm font-extrabold text-[var(--foreground)]">
                    {pieTotal.toLocaleString()} {currency}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 w-full text-[11px] font-bold">
                {pieCategories.map((c) => (
                  <div key={c.name} className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="truncate text-[var(--foreground)]">{c.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM ROW GRID (3 SUBCATEGORY DETAIL TABLES) */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* TABLE 1: INCOME */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-500 flex items-center gap-2">
              <Wallet size={14} /> {lang === "ru" ? "ДОХОДЫ" : "INCOME"}
            </h3>
            <span className="text-xs font-black text-emerald-500">
              {totalIncome.actual.toLocaleString()} {currency}
            </span>
          </div>

          <form onSubmit={addIncome} className="mb-3 flex gap-2">
            <input
              type="text"
              value={incName}
              onChange={(e) => setIncName(e.target.value)}
              placeholder={lang === "ru" ? "Подкатегория..." : "Subcategory..."}
              className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] px-2.5 py-1.5 text-xs font-semibold text-[var(--foreground)] outline-none"
            />
            <input
              type="number"
              value={incBud}
              onChange={(e) => setIncBud(e.target.value)}
              placeholder={lang === "ru" ? "Бюджет" : "Budget"}
              className="w-16 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] px-2.5 py-1.5 text-xs font-semibold text-[var(--foreground)] outline-none"
            />
            <input
              type="number"
              value={incAct}
              onChange={(e) => setIncAct(e.target.value)}
              placeholder={lang === "ru" ? "Факт" : "Actual"}
              className="w-16 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] px-2.5 py-1.5 text-xs font-semibold text-[var(--foreground)] outline-none"
            />
            <button
              type="submit"
              className="rounded-xl bg-emerald-500 px-2.5 py-1.5 text-xs font-bold text-white shadow-sm hover:brightness-110 active:scale-95"
            >
              <Plus size={14} />
            </button>
          </form>

          <table className="w-full text-left text-xs font-semibold">
            <thead>
              <tr className="border-b border-[var(--border)] text-[10px] uppercase text-[var(--muted)]">
                <th className="pb-1.5">{lang === "ru" ? "Подкатегория" : "Subcategory"}</th>
                <th className="pb-1.5 text-right">{lang === "ru" ? "Бюджет" : "Budget"}</th>
                <th className="pb-1.5 text-right">{lang === "ru" ? "Факт" : "Actual"}</th>
                <th className="pb-1.5 w-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {incomes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-xs text-[var(--muted)]">
                    {lang === "ru" ? "Нет записей" : "No entries yet"}
                  </td>
                </tr>
              ) : (
                incomes.map((item) => (
                  <tr key={item.id} className="hover:bg-[var(--surface-secondary)]/50">
                    <td className="py-2 text-[var(--foreground)]">{item.name}</td>
                    <td className="py-2 text-right text-[var(--muted)]">{item.budget.toLocaleString()} {currency}</td>
                    <td className="py-2 text-right font-extrabold text-emerald-500">{item.actual.toLocaleString()} {currency}</td>
                    <td className="py-2 text-right">
                      <button onClick={() => deleteIncome(item.id)} className="text-[var(--muted)] hover:text-red-500">
                        <Trash size={12} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* TABLE 2: SUBSCRIPTIONS */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-purple-500 flex items-center gap-2">
              <CreditCard size={14} /> {lang === "ru" ? "ПОДПИСКИ" : "SUBSCRIPTIONS"}
            </h3>
            <span className="text-xs font-black text-purple-500">
              {totalSubs.actual.toLocaleString()} {currency}
            </span>
          </div>

          <form onSubmit={addSubscription} className="mb-3 flex gap-2">
            <input
              type="text"
              value={subName}
              onChange={(e) => setSubName(e.target.value)}
              placeholder={lang === "ru" ? "Подкатегория..." : "Subcategory..."}
              className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] px-2.5 py-1.5 text-xs font-semibold text-[var(--foreground)] outline-none"
            />
            <input
              type="number"
              value={subBud}
              onChange={(e) => setSubBud(e.target.value)}
              placeholder={lang === "ru" ? "Бюджет" : "Budget"}
              className="w-16 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] px-2.5 py-1.5 text-xs font-semibold text-[var(--foreground)] outline-none"
            />
            <input
              type="number"
              value={subAct}
              onChange={(e) => setSubAct(e.target.value)}
              placeholder={lang === "ru" ? "Факт" : "Actual"}
              className="w-16 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] px-2.5 py-1.5 text-xs font-semibold text-[var(--foreground)] outline-none"
            />
            <button
              type="submit"
              className="rounded-xl bg-purple-500 px-2.5 py-1.5 text-xs font-bold text-white shadow-sm hover:brightness-110 active:scale-95"
            >
              <Plus size={14} />
            </button>
          </form>

          <table className="w-full text-left text-xs font-semibold">
            <thead>
              <tr className="border-b border-[var(--border)] text-[10px] uppercase text-[var(--muted)]">
                <th className="pb-1.5">{lang === "ru" ? "Подкатегория" : "Subcategory"}</th>
                <th className="pb-1.5 text-right">{lang === "ru" ? "Бюджет" : "Budget"}</th>
                <th className="pb-1.5 text-right">{lang === "ru" ? "Факт" : "Actual"}</th>
                <th className="pb-1.5 w-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-xs text-[var(--muted)]">
                    {lang === "ru" ? "Нет записей" : "No entries yet"}
                  </td>
                </tr>
              ) : (
                subscriptions.map((item) => (
                  <tr key={item.id} className="hover:bg-[var(--surface-secondary)]/50">
                    <td className="py-2 text-[var(--foreground)]">{item.name}</td>
                    <td className="py-2 text-right text-[var(--muted)]">{item.budget.toLocaleString()} {currency}</td>
                    <td className="py-2 text-right font-extrabold text-purple-500">{item.actual.toLocaleString()} {currency}</td>
                    <td className="py-2 text-right">
                      <button onClick={() => deleteSub(item.id)} className="text-[var(--muted)] hover:text-red-500">
                        <Trash size={12} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* TABLE 3: RECURRING PAYMENTS */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-cyan-500 flex items-center gap-2">
              <DollarSign size={14} /> {lang === "ru" ? "РЕГУЛЯРНЫЕ ПЛАТЕЖИ" : "RECURRING PAYMENTS"}
            </h3>
            <span className="text-xs font-black text-cyan-500">
              {totalRecurring.actual.toLocaleString()} {currency}
            </span>
          </div>

          <form onSubmit={addRecurring} className="mb-3 flex gap-2">
            <input
              type="text"
              value={recName}
              onChange={(e) => setRecName(e.target.value)}
              placeholder={lang === "ru" ? "Подкатегория..." : "Subcategory..."}
              className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] px-2.5 py-1.5 text-xs font-semibold text-[var(--foreground)] outline-none"
            />
            <input
              type="number"
              value={recBud}
              onChange={(e) => setRecBud(e.target.value)}
              placeholder={lang === "ru" ? "Бюджет" : "Budget"}
              className="w-16 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] px-2.5 py-1.5 text-xs font-semibold text-[var(--foreground)] outline-none"
            />
            <input
              type="number"
              value={recAct}
              onChange={(e) => setRecAct(e.target.value)}
              placeholder={lang === "ru" ? "Факт" : "Actual"}
              className="w-16 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] px-2.5 py-1.5 text-xs font-semibold text-[var(--foreground)] outline-none"
            />
            <button
              type="submit"
              className="rounded-xl bg-cyan-500 px-2.5 py-1.5 text-xs font-bold text-white shadow-sm hover:brightness-110 active:scale-95"
            >
              <Plus size={14} />
            </button>
          </form>

          <table className="w-full text-left text-xs font-semibold">
            <thead>
              <tr className="border-b border-[var(--border)] text-[10px] uppercase text-[var(--muted)]">
                <th className="pb-1.5">{lang === "ru" ? "Подкатегория" : "Subcategory"}</th>
                <th className="pb-1.5 text-right">{lang === "ru" ? "Бюджет" : "Budget"}</th>
                <th className="pb-1.5 text-right">{lang === "ru" ? "Факт" : "Actual"}</th>
                <th className="pb-1.5 w-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {recurringPayments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-xs text-[var(--muted)]">
                    {lang === "ru" ? "Нет записей" : "No entries yet"}
                  </td>
                </tr>
              ) : (
                recurringPayments.map((item) => (
                  <tr key={item.id} className="hover:bg-[var(--surface-secondary)]/50">
                    <td className="py-2 text-[var(--foreground)]">{item.name}</td>
                    <td className="py-2 text-right text-[var(--muted)]">{item.budget.toLocaleString()} {currency}</td>
                    <td className="py-2 text-right font-extrabold text-cyan-500">{item.actual.toLocaleString()} {currency}</td>
                    <td className="py-2 text-right">
                      <button onClick={() => deleteRec(item.id)} className="text-[var(--muted)] hover:text-red-500">
                        <Trash size={12} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
