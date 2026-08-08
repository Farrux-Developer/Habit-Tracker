"use client";

import { useState, useRef, useEffect } from "react";
import { useHabitStore } from "@/lib/store";
import { useLang } from "@/lib/lang";
import { X, Sparkles, Check } from "@/components/icons";

const COLOR_OPTIONS = [
  "#10b981", // Emerald Green
  "#3b82f6", // Royal Blue
  "#ec4899", // Vivid Pink
  "#8b5cf6", // Purple
  "#f59e0b", // Amber
  "#06b6d4", // Cyan
  "#f97316", // Orange
];

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddHabitModal({ isOpen, onClose }: AddHabitModalProps) {
  const { t } = useLang();
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"daily" | "one_time">("daily");
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);
  const addHabit = useHabitStore((s) => s.addHabit);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) return;

    addHabit({
      title: cleanTitle,
      type,
      color: selectedColor,
    });

    setTitle("");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl animate-[scaleIn_0.2s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
              <Sparkles size={16} />
            </div>
            <h3 className="text-base font-extrabold text-[var(--foreground)]">
              {t("addHabit")}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1 text-[var(--muted)] hover:bg-[var(--surface-secondary)] hover:text-[var(--foreground)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[var(--foreground)]">
              {t("newHabit")}
            </label>
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Прогулка 15 мин, Чтение 20 стр..."
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] px-3.5 py-2.5 text-sm font-medium text-[var(--foreground)] placeholder:text-[var(--muted)] outline-none transition-all focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
              required
            />
          </div>

          {/* Color Selection */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[var(--foreground)]">
              Цвет привычки / Accent Color
            </label>
            <div className="flex items-center gap-2">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className="flex h-7 w-7 items-center justify-center rounded-full transition-transform hover:scale-110 active:scale-95"
                  style={{ backgroundColor: color }}
                >
                  {selectedColor === color && (
                    <Check size={14} className="text-white stroke-[3]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Type Toggle */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[var(--foreground)]">
              Частота / Type
            </label>
            <div className="grid grid-cols-2 gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] p-1">
              <button
                type="button"
                onClick={() => setType("daily")}
                className={`rounded-lg py-1.5 text-xs font-bold transition-all ${
                  type === "daily"
                    ? "bg-[var(--accent)] text-white shadow-sm"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {t("daily")}
              </button>
              <button
                type="button"
                onClick={() => setType("one_time")}
                className={`rounded-lg py-1.5 text-xs font-bold transition-all ${
                  type === "one_time"
                    ? "bg-[var(--accent)] text-white shadow-sm"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {t("once")}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-[var(--muted)] hover:bg-[var(--surface-secondary)] transition-colors"
            >
              {t("cancel")}
            </button>

            <button
              type="submit"
              disabled={!title.trim()}
              className="rounded-xl bg-[var(--accent)] px-5 py-2 text-xs font-bold text-white shadow-md transition-all hover:brightness-110 active:scale-95 disabled:opacity-40"
            >
              {t("add")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
