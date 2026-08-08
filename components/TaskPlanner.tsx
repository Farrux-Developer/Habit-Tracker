"use client";

import { useState } from "react";
import { useHabitStore } from "@/lib/store";
import { useLang } from "@/lib/lang";
import { Plus, Trash, Check, Calendar } from "@/components/icons";

export default function TaskPlanner() {
  const { t } = useLang();
  const plannerTasks = useHabitStore((s) => s.plannerTasks);
  const addPlannerTask = useHabitStore((s) => s.addPlannerTask);
  const togglePlannerTask = useHabitStore((s) => s.togglePlannerTask);
  const deletePlannerTask = useHabitStore((s) => s.deletePlannerTask);

  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [category, setCategory] = useState("Work");
  const [dueDate, setDueDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [filterPriority, setFilterPriority] = useState<"all" | "low" | "medium" | "high">("all");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) return;

    addPlannerTask({
      title: cleanTitle,
      completed: false,
      priority,
      dueDate,
      category,
    });

    setTitle("");
  };

  const filteredTasks = plannerTasks.filter((task) => {
    if (filterPriority !== "all" && task.priority !== filterPriority) return false;
    return true;
  });

  const getPriorityBadge = (p: "low" | "medium" | "high") => {
    switch (p) {
      case "high":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "medium":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "low":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    }
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm backdrop-blur-xl">
        <div>
          <h2 className="text-base font-extrabold text-[var(--foreground)] leading-tight">
            {t("tasksTab")}
          </h2>
          <p className="text-[11px] font-semibold text-[var(--muted)]">
            Organize & prioritize your daily & weekly goals
          </p>
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-1 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] p-1 text-[11px] font-bold">
          {(["all", "high", "medium", "low"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={`rounded-lg px-2.5 py-1 capitalize transition-all ${
                filterPriority === p
                  ? "bg-[var(--surface)] text-[var(--foreground)] shadow-sm"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {p === "all" ? t("total") : t(`priority${p.slice(0, 1).toUpperCase() + p.slice(1)}` as any)}
            </button>
          ))}
        </div>
      </div>

      {/* Add Task Form */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm"
      >
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New task title..."
          className="min-w-[200px] flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] px-3.5 py-2.5 text-xs font-semibold text-[var(--foreground)] placeholder:text-[var(--muted)] outline-none focus:border-[var(--accent)]"
        />

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as any)}
          className="rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] px-3 py-2.5 text-xs font-bold text-[var(--foreground)] outline-none cursor-pointer"
        >
          <option value="high">{t("priorityHigh")}</option>
          <option value="medium">{t("priorityMed")}</option>
          <option value="low">{t("priorityLow")}</option>
        </select>

        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] px-3 py-2.5 text-xs font-semibold text-[var(--foreground)] outline-none"
        />

        <button
          type="submit"
          disabled={!title.trim()}
          className="flex items-center gap-1.5 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-xs font-extrabold text-white shadow-md transition-all hover:brightness-110 active:scale-95 disabled:opacity-40"
        >
          <Plus size={14} className="stroke-[3]" />
          <span>{t("add")}</span>
        </button>
      </form>

      {/* Tasks List */}
      <div className="space-y-2.5">
        {filteredTasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-8 text-center">
            <p className="text-xs font-bold text-[var(--muted)]">No tasks found</p>
            <p className="mt-1 text-[11px] text-[var(--muted)]/60">
              Create a new task above to start planning
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm transition-all duration-200 hover:border-[var(--accent)]/30 ${
                task.completed ? "opacity-60 bg-[var(--surface-secondary)]/50" : ""
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Interactive Custom Checkbox */}
                <button
                  onClick={() => togglePlannerTask(task.id)}
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition-all ${
                    task.completed
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-[var(--border-strong)] bg-[var(--surface-secondary)] hover:border-emerald-500"
                  }`}
                >
                  {task.completed && <Check size={12} className="stroke-[3]" />}
                </button>

                <div className="min-w-0">
                  <h4
                    className={`text-xs font-bold text-[var(--foreground)] truncate ${
                      task.completed ? "line-through text-[var(--muted)]" : ""
                    }`}
                  >
                    {task.title}
                  </h4>
                  <div className="mt-1 flex items-center gap-2 text-[10px] font-semibold text-[var(--muted)]">
                    <span className="flex items-center gap-1">
                      <Calendar size={10} />
                      {task.dueDate}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`rounded-lg border px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${getPriorityBadge(
                    task.priority
                  )}`}
                >
                  {task.priority}
                </span>

                <button
                  onClick={() => deletePlannerTask(task.id)}
                  className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-red-500/10 hover:text-red-500 transition-colors"
                >
                  <Trash size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
