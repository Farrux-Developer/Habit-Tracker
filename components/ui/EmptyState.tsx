import React from "react";
import { useLang } from "@/lib/lang";

export function EmptyState({ onAdd }: { onAdd?: () => void }) {
  const { t } = useLang();

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border-b border-[var(--border)] bg-[var(--surface)]">
      <div className="h-16 w-16 bg-[var(--surface-secondary)] rounded-full flex items-center justify-center mb-4">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--muted)]">
            <path d="M12 5v14M5 12h14"/>
        </svg>
      </div>
      <p className="text-sm font-medium text-[var(--muted-strong)] mb-2">{t("noHabitsFound")}</p>
      {onAdd && (
          <button onClick={onAdd} className="text-xs font-bold text-[var(--accent)] hover:underline">
              {t("addHabit")}
          </button>
      )}
    </div>
  );
}
