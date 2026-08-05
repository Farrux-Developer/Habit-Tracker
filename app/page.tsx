"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  useHabitStore, useHabits, useStreaks, useCurrentYear,
  useTodayCompleted, formatDate, useMonthlyProgress,
} from "@/lib/store";
import { useLang, LangSwitcher } from "@/lib/lang";
import { useAuth } from "@/lib/auth";
import Heatmap from "@/components/Heatmap";
import TaskCard from "@/components/TaskCard";
import YearPicker from "@/components/YearPicker";
import ThemeToggle from "@/components/ThemeToggle";
import InstallPWAButton from "@/components/InstallPWAButton";
import { Plus, Sparkles, Archive, Lock, Zap, Flame, Trophy, TrendingUp } from "@/components/icons";

const CURRENT_YEAR = new Date().getFullYear();

// ============================================================
// Streak tier system — visual fire stages
// ============================================================
type StreakTier = "cold" | "warming" | "fire" | "blaze" | "legend";
function getStreakTier(days: number): StreakTier {
  if (days >= 30) return "legend"; if (days >= 14) return "blaze";
  if (days >= 7) return "fire"; if (days >= 3) return "warming"; return "cold";
}
const STREAK_GLOW: Record<StreakTier, string> = {
  cold: "none", warming: "0 0 6px var(--streak-warm)",
  fire: "0 0 10px var(--streak-fire)",
  blaze: "0 0 16px var(--streak-blaze), 0 0 4px var(--streak-blaze)",
  legend: "0 0 18px var(--streak-legend), 0 0 36px var(--streak-legend)",
};
const STREAK_COLOR: Record<StreakTier, string> = {
  cold: "var(--muted)", warming: "var(--streak-warm)", fire: "var(--streak-fire)",
  blaze: "var(--streak-blaze)", legend: "var(--streak-legend)",
};

function StreakFlame({ days }: { days: number }) {
  const tier = getStreakTier(days);
  const glow = STREAK_GLOW[tier];
  const color = STREAK_COLOR[tier];
  return (
    <div className="relative flex items-center justify-center"
         style={{ transform: `scale(${tier === "legend" ? 1.1 : tier === "blaze" ? 1.06 : 1})` }}>
      <Flame size={18} className="flex-shrink-0 transition-all duration-700"
             style={{ color, filter: glow !== "none" ? `drop-shadow(${glow})` : "none" }} />
      {tier === "legend" && (
        <Flame size={18} className="absolute inset-0 -z-10 animate-[legendPulse_2s_ease-in-out_infinite]"
               style={{ color, filter: "blur(6px)", opacity: 0.35 }} />
      )}
    </div>
  );
}

// ============================================================
// Logo — fluid typography + hover
// ============================================================
function Logo() {
  const { t } = useLang();
  return (
    <div className="group flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl
                      bg-[var(--accent)] shadow-[0_0_20px_var(--accent-glow)]
                      transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                      group-hover:rotate-[-8deg] group-hover:scale-110 group-hover:shadow-[0_0_30px_var(--accent-glow)]">
        <Zap size={16} className="text-white drop-shadow-[0_0_4px_rgba(255,255,255,0.5)]" />
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-[15px] font-extrabold tracking-[-0.02em] text-[var(--foreground)]
                         transition-transform duration-300 group-hover:translate-x-0.5">
          {t("appTitle")}
        </span>
        <span className="text-[9px] font-semibold tracking-[0.2em] uppercase text-[var(--accent)]/70">
          {t("appSub")}
        </span>
      </div>
    </div>
  );
}

// ============================================================
// Logout button
// ============================================================
function LogoutBtn() {
  const { logout } = useAuth();
  return (
    <button onClick={logout}
      className="rounded-full border border-[var(--border)] bg-[var(--surface-secondary)]
                 px-2.5 py-1 text-[10px] font-semibold text-[var(--muted)]
                 transition-all hover:text-red-500 hover:border-red-500/30">
      Exit
    </button>
  );
}

// ============================================================
// AddHabitInline — glass panel
// ============================================================
function AddHabitInline() {
  const { t } = useLang();
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"daily" | "one_time">("daily");
  const [open, setOpen] = useState(false);
  const [renderForm, setRenderForm] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const addHabit = useHabitStore((s) => s.addHabit);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setRenderForm(true);
      requestAnimationFrame(() => setFormVisible(true));
      const tmr = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(tmr);
    } else if (renderForm) {
      setFormVisible(false);
      const tmr = setTimeout(() => setRenderForm(false), 300);
      return () => clearTimeout(tmr);
    }
  }, [open, renderForm]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault(); const tr = title.trim(); if (!tr) return;
    addHabit({ title: tr, type }); setTitle(""); setOpen(false);
  };

  if (!open && !renderForm) {
    return (
      <button onClick={() => setOpen(true)}
        className="group flex w-full items-center justify-center gap-2 rounded-xl
                   border-2 border-dashed border-[var(--border)] px-4 py-2.5
                   text-[11px] font-semibold text-[var(--muted)]
                   transition-all duration-300 hover:border-[var(--accent)]/40
                   hover:text-[var(--accent)] hover:bg-[var(--accent)]/5
                   active:scale-[0.98]">
        <Plus size={14} className="transition-transform group-hover:rotate-90 duration-300" />
        {t("addHabit")}
      </button>
    );
  }
  if (!renderForm) return null;

  return (
    <form onSubmit={submit}
      className={`overflow-hidden rounded-xl border border-[var(--border)]/50
                  bg-[var(--surface)]/70 backdrop-blur-xl
                  transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                  ${formVisible ? "max-h-40 p-3 opacity-100 scale-100" : "max-h-0 p-0 opacity-0 scale-[0.96] border-transparent"}`}>
      <input ref={inputRef} type="text" value={title} onChange={e => setTitle(e.target.value)}
        placeholder={t("newHabit")}
        className="w-full bg-transparent text-sm font-medium text-[var(--foreground)]
                   placeholder:text-[var(--muted)] focus:outline-none" />
      <div className="mt-2.5 flex items-center gap-2">
        <div className="flex overflow-hidden rounded-lg border border-[var(--border)]">
          {(["daily","one_time"] as const).map(tp => (
            <button key={tp} type="button" onClick={() => setType(tp)}
              className={`px-2.5 py-1 text-[10px] font-semibold tracking-wide transition-all duration-200
                ${type===tp ? "bg-[var(--accent)] text-white" : "text-[var(--muted)] hover:text-[var(--foreground)]"}`}>
              {tp==="daily"?t("daily"):t("once")}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <button type="button" onClick={()=>setOpen(false)}
          className="rounded-lg px-2.5 py-1 text-[10px] font-medium text-[var(--muted)]
                     hover:text-[var(--foreground)] transition-colors">{t("cancel")}</button>
        <button type="submit" disabled={!title.trim()}
          className="rounded-lg bg-[var(--accent)] px-3.5 py-1 text-[10px] font-semibold
                     text-white transition-all hover:brightness-110 disabled:opacity-30">{t("add")}</button>
      </div>
    </form>
  );
}

// ============================================================
// CircularStatRing — SVG donut with animated fill
// ============================================================
function CircularStatRing({ pct, size=100, stroke=8 }: { pct:number; size?:number; stroke?:number }) {
  const r=(size-stroke)/2; const c=2*Math.PI*r;
  const clamped=Math.min(100,Math.max(0,pct)); const offset=c-(clamped/100)*c;
  const cx=size/2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="flex-shrink-0">
      <circle cx={cx} cy={cx} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
      <circle cx={cx} cy={cx} r={r} fill="none" stroke="var(--accent)" strokeWidth={stroke}
        strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
        transform={`rotate(-90 ${cx} ${cx})`}
        className="transition-[stroke-dashoffset]" style={{
          transitionDuration:"1s",transitionTimingFunction:"cubic-bezier(0.4,0,0.2,1)",
          filter:clamped>=100?"drop-shadow(0 0 8px var(--accent-glow))":"none",
        }} />
    </svg>
  );
}

// ============================================================
// HomePage — Bento Grid Dashboard
// ============================================================
export default function HomePage() {
  const { t } = useLang();
  const currentYear = useCurrentYear();
  const seed = useHabitStore(s => s.seedDefaultTasks);
  const fetchFromSupabase = useHabitStore(s => s.fetchFromSupabase);
  const isLoading = useHabitStore(s => s.isLoading);
  const habits = useHabits();
  const { currentStreak, maxStreak, totalContributions } = useStreaks();
  const { done, total:totalHabits, pct } = useTodayCompleted();
  const { activeDays, totalDays } = useMonthlyProgress();
  const [mounted, setMounted] = useState(false);

  const isArchive = currentYear !== CURRENT_YEAR;
  const today = formatDate(new Date());
  const activeHabits = habits.filter(h => h.is_active);
  const allDoneToday = totalHabits > 0 && done >= totalHabits;

  const monthPct = totalDays > 0 ? Math.round((activeDays / totalDays) * 100) : 0;

  useEffect(() => { setMounted(true); seed(); }, [seed]);
  useEffect(() => { fetchFromSupabase(currentYear); }, [currentYear, fetchFromSupabase]);

  if (!mounted || isLoading) {
    return (
      <main className="mx-auto flex h-dvh max-w-[1400px] flex-col px-6 py-4 pb-20">
        <div className="mb-4 flex items-center justify-between">
          <div className="skeleton h-9 w-44" />
          <div className="flex gap-2">
            <div className="skeleton h-8 w-10" /><div className="skeleton h-8 w-16" /><div className="skeleton h-8 w-8 rounded-full" />
          </div>
        </div>
        <div className="grid grid-cols-[1fr_auto] gap-4 mb-4">
          <div className="skeleton h-[180px] rounded-2xl" />
          <div className="skeleton h-[180px] w-[180px] rounded-2xl" />
        </div>
        <div className="skeleton h-4 w-20 mb-2" />
        <div className="space-y-1.5">
          {[1,2,3,4].map(i=><div key={i} className="skeleton h-[52px] rounded-xl" />)}
        </div>
      </main>
    );
  }

  return (
    <main className="relative mx-auto flex h-dvh max-w-[1400px] flex-col px-6 py-4 pb-20">
      {/* ============================================================ */}
      {/* HEADER */}
      {/* ============================================================ */}
      <header className="mb-4 flex flex-shrink-0 items-center justify-between">
        <Logo />
        <div className="flex items-center gap-2">
          {allDoneToday && (
            <span className="animate-[scaleIn_0.35s_ease-out] rounded-lg
                             bg-[var(--accent)]/10 px-2.5 py-1 text-[10px]
                             font-extrabold tracking-wide text-[var(--accent)]
                             ring-1 ring-[var(--accent)]/20">
              {t("allDone")}
            </span>
          )}
          <InstallPWAButton />
          <LangSwitcher />
          <YearPicker />
          <ThemeToggle />
          <LogoutBtn />
        </div>
      </header>

      <ArchiveBanner show={isArchive} year={currentYear} />

      {/* ============================================================ */}
      {/* BENTO GRID — Heatmap left, stats panel right */}
      {/* ============================================================ */}
      <section className="mb-4 flex-shrink-0 grid grid-cols-[1fr_auto] gap-4">
        {/* Left: Activity heatmap */}
        <div className="overflow-hidden rounded-2xl border border-[var(--border)]/60
                        bg-[var(--surface)]/80 backdrop-blur-xl
                        transition-all duration-500 hover:border-[var(--accent)]/20
                        hover:shadow-[0_8px_40px_rgba(16,185,129,0.06)]">
          <Heatmap totalHabits={totalHabits} />
        </div>

        {/* Right: Stats ring + quick numbers + monthly bar */}
        <div className="flex w-[180px] flex-col items-center justify-center gap-2
                        rounded-2xl border border-[var(--border)]/60
                        bg-[var(--surface)]/80 backdrop-blur-xl p-4
                        transition-all duration-500 hover:border-[var(--accent)]/20
                        hover:shadow-[0_8px_40px_rgba(16,185,129,0.06)]">
          {/* Progress ring */}
          <div className="relative">
            <CircularStatRing pct={pct} size={82} stroke={6} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[20px] font-extrabold tabular-nums text-[var(--foreground)]">{pct}%</span>
              <span className="text-[8px] font-semibold text-[var(--muted)] uppercase tracking-wider">{t("today")}</span>
            </div>
          </div>
          {/* Quick stats */}
          <div className="w-full space-y-1.5 border-t border-[var(--border)] pt-2.5">
            <QS label={t("done")} value={`${done}/${totalHabits}`} />
            <QS icon={<StreakFlame days={currentStreak} />} label="" value={`${currentStreak}d`} accent />
            <QS icon={<Trophy size={13} className="flex-shrink-0 text-[var(--accent-secondary)]" />}
                label="" value={`${maxStreak}d`} warn />
            <QS label={t("total")} value={`${totalContributions}`} />
          </div>
          {/* Monthly progress bar */}
          <div className="w-full border-t border-[var(--border)] pt-2">
            <div className="flex items-center gap-1.5">
              <TrendingUp size={12} className="flex-shrink-0 text-[var(--muted)]" />
              <span className="text-[8px] font-semibold uppercase text-[var(--muted)]">{activeDays}/{totalDays}d</span>
              <div className="flex-1 h-1 rounded-full overflow-hidden bg-[var(--border)]">
                <div className="h-full rounded-full bg-[var(--accent)] transition-all duration-800 ease-[cubic-bezier(0.4,0,0.2,1)]"
                     style={{ width: `${monthPct}%` }} />
              </div>
              <span className="text-[9px] font-extrabold tabular-nums text-[var(--accent)]">{monthPct}%</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* TASKS — Bento cards */}
      {/* ============================================================ */}
      <section className="flex min-h-0 flex-1 flex-col">
        <div className="mb-2 flex flex-shrink-0 items-center justify-between">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--muted)]">
            {t("tasks")} ({activeHabits.length})
          </h2>
        </div>
        <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-0.5">
          {activeHabits.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-2xl
                            border border-[var(--border)]/50 bg-[var(--surface)]/50
                            backdrop-blur-xl px-4 py-12">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl
                              bg-[var(--accent)]/10">
                <Sparkles size={20} className="text-[var(--accent)]" />
              </div>
              <p className="text-xs font-medium text-[var(--muted)]">{t("noTasks")}</p>
            </div>
          )}
          {activeHabits.map((habit,i) => (
            <TaskCard key={habit.id} habit={habit} date={today}
                      isReadOnly={isArchive} colorIndex={i} />
          ))}
        </div>
        {!isArchive && <div className="mt-2 flex-shrink-0"><AddHabitInline /></div>}
      </section>

      {/* Footer */}
      <footer className="mt-3 flex-shrink-0 text-center text-[9px] font-medium
                          tracking-wide text-[var(--muted)]/50">
        {totalContributions} {t("total").toLowerCase()} · {currentYear}
      </footer>
    </main>
  );
}

// ============================================================
// Quick Stat row — with optional icon
// ============================================================
function QS({ icon, label, value, accent, warn }: {
  icon?: React.ReactNode; label:string; value:string; accent?:boolean; warn?:boolean;
}) {
  return (
    <div className="flex justify-between items-center text-[10px]">
      <span className="text-[var(--muted)] flex items-center gap-1.5">
        {icon && icon}
        {label}
      </span>
      <span className={`font-bold tabular-nums ${
        accent ? "text-[var(--accent)]" : warn ? "text-[var(--accent-secondary)]" : "text-[var(--foreground)]"
      }`}>{value}</span>
    </div>
  );
}

// ============================================================
// ArchiveBanner
// ============================================================
function ArchiveBanner({ show, year }: { show:boolean; year:number }) {
  const { t } = useLang();
  const [render, setRender] = useState(show);
  const [visible, setVisible] = useState(show);
  useEffect(() => {
    if (show) { setRender(true); requestAnimationFrame(()=>setVisible(true)); }
    else if (render) { setVisible(false); const tmr=setTimeout(()=>setRender(false),300); return ()=>clearTimeout(tmr); }
  }, [show, render]);
  if (!render) return null;
  return (
    <div className={`flex-shrink-0 overflow-hidden transition-all duration-300 ease-out
      ${visible?"mb-4 h-auto opacity-100":"mb-0 h-0 opacity-0"}`}>
      <div className="flex items-center gap-2.5 rounded-xl border border-[var(--accent-secondary)]/30
                      bg-[var(--accent-secondary)]/5 px-3.5 py-2">
        <Archive size={13} className="text-[var(--accent-secondary)]" />
        <p className="text-[10px] font-semibold text-[var(--accent-secondary)]">{t("archive")} {year} — {t("readOnly")}</p>
        <Lock size={10} className="ml-auto text-[var(--accent-secondary)]/30" />
      </div>
    </div>
  );
}
