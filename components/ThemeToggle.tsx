"use client";

import { useTheme } from "@/lib/theme";
import { useEffect, useState } from "react";
import { Sun, Moon } from "@/components/icons";

// ============================================================
// ThemeToggle — Sun/Moon with CSS transition rotation
// ============================================================
export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="h-8 w-8" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="group relative flex h-8 w-8 items-center justify-center
                 rounded-full bg-[var(--surface-secondary)] border border-[var(--border)]
                 transition-all duration-300 hover:scale-110 active:scale-90"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {/* Moon — visible in dark */}
      <span
        className="absolute transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{
          rotate: isDark ? "0deg" : "180deg",
          scale: isDark ? "1" : "0",
          opacity: isDark ? 1 : 0,
        }}
      >
        <Moon size={16} className="text-slate-300" />
      </span>

      {/* Sun — visible in light */}
      <span
        className="absolute transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{
          rotate: isDark ? "-180deg" : "0deg",
          scale: isDark ? "0" : "1",
          opacity: isDark ? 0 : 1,
        }}
      >
        <Sun size={16} className="text-[var(--accent-secondary)]" />
      </span>
    </button>
  );
}
