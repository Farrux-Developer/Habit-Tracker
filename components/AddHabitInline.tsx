"use client";

import React, { useState, useEffect, useRef } from "react";
import { Plus } from "lucide-react";
import { useHabitStore } from "@/lib/store";
import { useLang } from "@/lib/lang";

export default function AddHabitInline() {
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
                   border border-dashed border-[var(--border-strong)] px-4 py-2
                   text-[11px] font-bold text-[var(--muted-strong)]
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
      className={`overflow-hidden rounded-xl border border-[var(--border-strong)]
                  bg-[var(--surface)] shadow-md mt-2
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
              className={`px-2.5 py-1 text-[10px] font-bold tracking-wide transition-all duration-200
                ${type===tp ? "bg-[var(--accent)] text-white" : "text-[var(--muted)] hover:text-[var(--foreground)] bg-[var(--surface-secondary)]"}`}>
              {tp==="daily"?t("daily"):t("once")}
            </button>
          ))}
        </div>
        <div className="ml-auto flex gap-1.5">
          <button type="button" onClick={() => setOpen(false)}
            className="rounded-lg px-3 py-1.5 text-[10px] font-bold text-[var(--muted)] hover:bg-[var(--surface-secondary)] border border-transparent hover:border-[var(--border)]">
            {t("cancel")}
          </button>
          <button type="submit" disabled={!title.trim()}
            className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-[10px] font-extrabold text-white shadow-sm hover:brightness-110 disabled:opacity-50 disabled:shadow-none transition-all">
            {t("save")}
          </button>
        </div>
      </div>
    </form>
  );
}
