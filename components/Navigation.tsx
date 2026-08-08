"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, Chart, ListTodo } from "@/components/icons";
import { useHabitStore } from "@/lib/store";

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const setActiveTab = useHabitStore((s) => s.setActiveTab);

  // Hide nav on auth & admin pages
  if (pathname.startsWith("/auth/") || pathname.startsWith("/admin/")) return null;

  const handleTabClick = (tab: "habits" | "tasks" | "budget", href: string) => {
    setActiveTab(tab);
    if (pathname !== "/") {
      router.push("/");
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1400px]">
        <button
          onClick={() => handleTabClick("habits", "/")}
          className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-semibold text-[var(--muted)] hover:text-[var(--foreground)] transition-all"
        >
          <Home size={20} />
          Home
        </button>
        <button
          onClick={() => handleTabClick("habits", "/")}
          className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-semibold text-[var(--muted)] hover:text-[var(--foreground)] transition-all"
        >
          <Chart size={20} />
          Stats
        </button>
        <button
          onClick={() => handleTabClick("tasks", "/")}
          className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-semibold text-[var(--muted)] hover:text-[var(--foreground)] transition-all"
        >
          <ListTodo size={20} />
          Tasks
        </button>
      </div>
    </nav>
  );
}
