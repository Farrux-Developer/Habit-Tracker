"use client";

import { useState, useRef, useEffect } from "react";
import { useCurrentYear, useAllYears, useHabitStore } from "@/lib/store";
import { ChevronDown, Archive, Calendar, Circle } from "@/components/icons";

const CURRENT_YEAR = new Date().getFullYear();

// ============================================================
// YearPicker — Premium Pill Badge with live/archive status
// ============================================================
export default function YearPicker() {
  const currentYear = useCurrentYear();
  const allYears = useAllYears();
  const setCurrentYear = useHabitStore((s) => s.setCurrentYear);
  const [open, setOpen] = useState(false);
  // For exit animation: delay unmount so CSS transition plays
  const [renderDropdown, setRenderDropdown] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isArchive = currentYear !== CURRENT_YEAR;

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // AnimatePresence-like: delay unmount for exit animation
  useEffect(() => {
    if (open) {
      setRenderDropdown(true);
      requestAnimationFrame(() => setDropdownVisible(true));
    } else if (renderDropdown) {
      setDropdownVisible(false);
      const t = setTimeout(() => setRenderDropdown(false), 180);
      return () => clearTimeout(t);
    }
  }, [open, renderDropdown]);

  return (
    <div ref={ref} className="relative">
      {/* Trigger — pill badge */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px]
                    font-semibold transition-all duration-200
                    hover:scale-[1.03] active:scale-[0.97] ${
                      isArchive
                        ? "bg-[var(--accent-secondary-soft)] text-[var(--accent-secondary)] ring-1 ring-[var(--accent-secondary)]/30"
                        : "bg-[var(--surface-secondary)] text-[var(--foreground)] hover:bg-[var(--surface-tertiary)]"
                    }`}
        style={{ border: isArchive ? "none" : "1px solid var(--border)" }}
      >
        {/* Live indicator for current year */}
        {!isArchive && (
          <span className="relative flex h-2 w-2">
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
              style={{ backgroundColor: "var(--accent)" }}
            />
            <span
              className="relative inline-flex h-2 w-2 rounded-full"
              style={{ backgroundColor: "var(--accent)" }}
            />
          </span>
        )}

        {isArchive ? (
          <Archive size={12} className="opacity-70" />
        ) : (
          <Calendar size={12} className="opacity-70" />
        )}

        <span className="tabular-nums">{currentYear}</span>

        <span
          className="transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <ChevronDown size={11} className="opacity-50" />
        </span>
      </button>

      {/* Dropdown — CSS-driven enter/exit */}
      {renderDropdown && (
        <div
          className={`absolute right-0 top-full z-50 mt-2 w-40 overflow-hidden rounded-xl
                      border border-[var(--border)] bg-[var(--surface)]
                      transition-all duration-[180ms] ease-out ${
                        dropdownVisible
                          ? "translate-y-0 scale-100 opacity-100"
                          : "translate-y-[-6px] scale-95 opacity-0 pointer-events-none"
                      }`}
          style={{ boxShadow: "var(--shadow-lg)" }}
        >
          {allYears.map((year) => {
            const isActive = year === currentYear;
            const isCurrent = year === CURRENT_YEAR;

            return (
              <button
                key={year}
                onClick={() => {
                  setCurrentYear(year);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium
                            transition-colors hover:bg-[var(--surface-secondary)] ${
                              isActive
                                ? "text-[var(--accent)] bg-[var(--accent-soft)]"
                                : "text-[var(--foreground)]"
                            }`}
              >
                {isCurrent ? (
                  <Calendar size={13} className="shrink-0" />
                ) : (
                  <Archive size={13} className="shrink-0" />
                )}

                <span className="tabular-nums">{year}</span>

                {isCurrent && (
                  <span className="ml-auto flex items-center gap-1 text-[9px] font-semibold text-[var(--accent)]">
                    <Circle size={5} fill="currentColor" />
                    Live
                  </span>
                )}
                {isActive && !isCurrent && (
                  <span className="ml-auto text-[9px] font-medium text-[var(--muted)]">
                    viewing
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
