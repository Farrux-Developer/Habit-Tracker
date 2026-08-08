"use client";

import { useEffect, useState } from "react";
import { useHabitStore, useCurrentYear } from "@/lib/store";
import Header from "@/components/Header";
import MonthlyProgressCard from "@/components/MonthlyProgressCard";
import HabitMatrix from "@/components/HabitMatrix";
import RightSidebar from "@/components/RightSidebar";
import AddHabitModal from "@/components/AddHabitModal";
import TaskPlanner from "@/components/TaskPlanner";
import BudgetPlanner from "@/components/BudgetPlanner";
import AISummaryCard from "@/components/AISummaryCard";
import DownloadAppModal from "@/components/DownloadAppModal";

export default function HomePage() {
  const currentYear = useCurrentYear();
  const seed = useHabitStore((s) => s.seedDefaultTasks);
  const fetchFromSupabase = useHabitStore((s) => s.fetchFromSupabase);
  const isLoading = useHabitStore((s) => s.isLoading);
  const activeTab = useHabitStore((s) => s.activeTab);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    useHabitStore.getState().seedDefaultTasks();
    useHabitStore.getState().fetchFromSupabase(currentYear);
  }, [currentYear]);

  if (!mounted || isLoading) {
    return (
      <main className="mx-auto flex min-h-screen max-w-[1440px] flex-col p-4 md:p-6">
        {/* Header Skeleton */}
        <div className="mb-6 flex items-center justify-between">
          <div className="skeleton h-10 w-48 rounded-xl" />
          <div className="flex gap-2">
            <div className="skeleton h-10 w-32 rounded-xl" />
            <div className="skeleton h-10 w-28 rounded-xl" />
          </div>
        </div>

        {/* Dashboard Grid Skeleton */}
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-4">
            <div className="skeleton h-32 w-full rounded-2xl" />
            <div className="skeleton h-96 w-full rounded-2xl" />
          </div>
          <div className="w-full lg:w-[280px] shrink-0 space-y-4">
            <div className="skeleton h-20 w-full rounded-2xl" />
            <div className="skeleton h-60 w-full rounded-2xl" />
            <div className="skeleton h-64 w-full rounded-2xl" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-[1440px] flex-col p-3 sm:p-4 md:p-6 transition-colors">
      {/* (1) HEADER ZONE */}
      <Header
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
      />

      {/* (2) MODULE VIEW SWITCHER */}
      {activeTab === "habits" && (
        <div className="flex flex-col lg:flex-row gap-5 items-start">
          {/* Central Zone (Matrix, Monthly Progress & AI Insights) */}
          <section className="flex-1 w-full min-w-0">
            <AISummaryCard />
            <MonthlyProgressCard />
            <HabitMatrix />
          </section>

          {/* Right Sidebar Zone (Donut Chart & Top Habits Ranking) */}
          <RightSidebar />
        </div>
      )}

      {activeTab === "tasks" && <TaskPlanner />}

      {activeTab === "budget" && <BudgetPlanner />}

      {/* Add Habit Modal */}
      <AddHabitModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Download Native App Modal */}
      <DownloadAppModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
      />
    </main>
  );
}
