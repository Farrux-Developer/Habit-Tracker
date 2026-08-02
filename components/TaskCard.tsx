"use client";

import React, { useCallback, useRef, useState } from "react";
import { useIsHabitCompleted, useHabitStore } from "@/lib/store";
import { Trash } from "@/components/icons";

const TASK_COLORS = [
  "#10b981", "#3b82f6", "#f59e0b", "#8b5cf6",
  "#ec4899", "#06b6d4", "#f97316", "#84cc16",
];

interface TaskCardProps {
  habit: { id: string; title: string; type: "daily" | "one_time" };
  date: string;
  isReadOnly: boolean;
  colorIndex: number;
}

const TaskCard = React.memo(function TaskCard({
  habit, date, isReadOnly, colorIndex,
}: TaskCardProps) {
  const isCompleted = useIsHabitCompleted(habit.id, date);
  const toggleCompletion = useHabitStore((s) => s.toggleHabitCompletion);
  const updateHabit = useHabitStore((s) => s.updateHabit);
  const deleteHabit = useHabitStore((s) => s.deleteHabit);

  const [justToggled, setJustToggled] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(habit.title);
  const inputRef = useRef<HTMLInputElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const color = TASK_COLORS[colorIndex % TASK_COLORS.length];

  const handleToggle = useCallback(() => {
    if (isReadOnly) return;
    setJustToggled(true);
    setTimeout(() => setJustToggled(false), 600);
    toggleCompletion(habit.id, date);
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
      const ctx = audioCtxRef.current;
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination); o.type = "sine";
      o.frequency.setValueAtTime(isCompleted ? 400 : 600, ctx.currentTime);
      o.frequency.linearRampToValueAtTime(isCompleted ? 250 : 900, ctx.currentTime + 0.08);
      g.gain.setValueAtTime(isCompleted ? 0.06 : 0.1, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.12);
    } catch { /* no audio */ }
  }, [habit.id, date, toggleCompletion, isReadOnly, isCompleted]);

  const saveEdit = () => {
    const t = editTitle.trim();
    if (t && t !== habit.title) updateHabit(habit.id, { title: t });
    setEditing(false);
  };

  const startEdit = () => {
    setEditTitle(habit.title);
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleDelete = () => {
    if (confirmDelete) { deleteHabit(habit.id); }
    else { setConfirmDelete(true); setTimeout(() => setConfirmDelete(false), 3000); }
  };

  return (
    <div
      className={`group flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-all duration-300
        ${justToggled ? "bg-[var(--accent-soft)]" : isCompleted ? "bg-[var(--surface-secondary)]" : "bg-[var(--surface)]"}`}
      style={{ borderColor: "var(--border)" }}
    >
      {/* Color circle */}
      <div
        className="h-3 w-3 flex-shrink-0 rounded-full transition-all duration-300"
        style={{
          backgroundColor: color,
          boxShadow: isCompleted ? `0 0 8px ${color}66` : "none",
        }}
      />

      {/* Title — inline editable */}
      {editing ? (
        <input
          ref={inputRef}
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onBlur={saveEdit}
          onKeyDown={(e) => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEditing(false); }}
          className="flex-1 min-w-0 bg-transparent text-sm font-medium text-[var(--foreground)]
                     border-b border-[var(--accent)] outline-none"
        />
      ) : (
        <span
          onClick={isReadOnly ? undefined : startEdit}
          className={`flex-1 min-w-0 truncate text-sm font-medium transition-all duration-300
            ${isReadOnly ? "cursor-default" : "cursor-pointer hover:text-[var(--accent)]"}`}
          style={{
            color: isCompleted ? "var(--muted)" : "var(--foreground)",
            textDecorationLine: isCompleted ? "line-through" : "none",
            textDecorationColor: "var(--accent)",
            textDecorationThickness: "1.5px",
            opacity: isCompleted ? 0.55 : 1,
          }}
        >
          {habit.title}
        </span>
      )}

      {/* Type badge */}
      <span className="flex-shrink-0 rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase
                       border transition-opacity"
            style={{
              background: habit.type === "daily" ? "var(--accent-soft)" : "var(--accent-secondary-soft)",
              borderColor: habit.type === "daily" ? "var(--accent)" : "var(--accent-secondary)",
              color: habit.type === "daily" ? "var(--accent)" : "var(--accent-secondary)",
              opacity: isCompleted ? 0.4 : 1,
            }}>
        {habit.type === "daily" ? "Daily" : "Once"}
      </span>

      {/* Checkbox */}
      <div className="relative flex-shrink-0">
        <input type="checkbox" checked={isCompleted} onChange={handleToggle}
               disabled={isReadOnly} className="checkbox-premium" />
        {justToggled && <span className="pointer-events-none absolute inset-0 rounded-md
          bg-[var(--accent)] animate-[ripple_0.4s_ease-out_forwards]" />}
      </div>

      {/* Delete */}
      {!isReadOnly && (
        <button type="button" onClick={(e) => { e.stopPropagation(); handleDelete(); }}
          className={`flex-shrink-0 rounded p-1 transition-all
            ${confirmDelete ? "text-red-500 bg-red-500/10" : "text-[var(--muted)] opacity-0 group-hover:opacity-100 hover:text-red-500"}`}
          title={confirmDelete ? "Confirm delete" : "Delete"}>
          <Trash size={13} />
        </button>
      )}
    </div>
  );
});

export default TaskCard;
