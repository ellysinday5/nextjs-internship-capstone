"use client";

import { Modal } from "@/components/modals/BaseModal";
import { calculateCompletionPercentage, isTaskCompleted } from "@/lib/project-stats";
import { sileo } from "@/utils/alerts";
import { AlertTriangle, BarChart2, CheckCircle2, Clock, Plus, X } from "lucide-react";
import React, { useState } from "react";
import type { Section } from "./types";

interface DashboardTabProps {
  sections: Section[];
}

interface CustomWidget {
  id: string;
  title: string;
  type: "priority" | "overdue" | "activity";
}

export function DashboardTab({ sections }: DashboardTabProps) {
  const [isAddWidgetModalOpen, setIsAddWidgetModalOpen] = useState(false);
  const [customWidgets, setCustomWidgets] = useState<CustomWidget[]>([]);

  const allTasks = sections.flatMap((s) => s.tasks);
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter((t) => isTaskCompleted(t.status)).length;
  const incompleteTasks = Math.max(0, totalTasks - completedTasks);
  const completionPercentage = calculateCompletionPercentage(completedTasks, totalTasks);
  const overdueTasks = allTasks.filter(
    (t) => t.status === "Off track" || t.priority === "High",
  ).length;

  const handleAddWidget = (widget: CustomWidget) => {
    if (customWidgets.some((w) => w.id === widget.id)) {
      sileo.info(`Widget "${widget.title}" is already on your dashboard`, "Notice");
      return;
    }
    setCustomWidgets((prev) => [...prev, widget]);
    setIsAddWidgetModalOpen(false);
    sileo.success(`Added "${widget.title}" widget!`, "Widget Added");
  };

  const handleRemoveWidget = (widgetId: string) => {
    setCustomWidgets((prev) => prev.filter((w) => w.id !== widgetId));
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-[#0f1d31]/50 space-y-6">
      {/* Header bar with Add widget */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsAddWidgetModalOpen(true)}
          className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
        >
          <Plus size={14} /> Add widget
        </button>
        <span className="text-xs text-slate-400 hover:underline cursor-pointer">Send feedback</span>
      </div>

      {/* Top 4 Stat Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-2">
          <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Total completed tasks
          </h4>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {completedTasks}
          </div>
          <div className="text-[11px] text-slate-400">≡ 1 Filter</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-2">
          <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Total incomplete tasks
          </h4>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {incompleteTasks}
          </div>
          <div className="text-[11px] text-slate-400">≡ 1 Filter</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-2">
          <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Total overdue tasks
          </h4>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {overdueTasks}
          </div>
          <div className="text-[11px] text-slate-400">≡ 1 Filter</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-2">
          <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400">Total tasks</h4>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{totalTasks}</div>
          <div className="text-[11px] text-slate-400">≡ No Filters</div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Chart 1: Total incomplete tasks by section */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
            Total incomplete tasks by section
          </h4>

          <div className="h-44 flex items-end justify-around border-b border-slate-200 pb-2 dark:border-slate-800">
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-12 rounded-t-lg bg-purple-400 transition-all"
                style={{ height: `${Math.max(20, (sections[0]?.tasks.length || 1) * 30)}px` }}
              >
                <span className="block text-center text-[10px] font-bold text-white pt-1">
                  {sections[0]?.tasks.length || 0}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-semibold">To do</span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div
                className="w-12 rounded-t-lg bg-purple-200 transition-all"
                style={{ height: "8px" }}
              />
              <span className="text-[11px] text-slate-500 font-semibold">Doing</span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div
                className="w-12 rounded-t-lg bg-purple-200 transition-all"
                style={{ height: "8px" }}
              />
              <span className="text-[11px] text-slate-500 font-semibold">Done</span>
            </div>
          </div>
        </div>

        {/* Chart 2: Total tasks by completion status */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
            Total tasks by completion status
          </h4>

          <div className="h-44 flex items-center justify-center gap-6">
            <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-[12px] border-slate-100 dark:border-slate-800">
              <div
                className="absolute inset-0 rounded-full border-[12px] border-[#0033a0] transition-all duration-700"
                style={{
                  clipPath:
                    completionPercentage > 0
                      ? undefined
                      : "polygon(0 0, 0 0, 0 0)",
                  opacity: completionPercentage > 0 ? 1 : 0.2,
                }}
              />
              <div className="text-center z-10">
                <div className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {completionPercentage}%
                </div>
                <div className="text-[10px] text-slate-400 font-semibold">
                  {completedTasks}/{totalTasks} Done
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-xs bg-[#0033a0]" />
                Completed ({completedTasks})
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-xs bg-slate-300 dark:bg-slate-700" />
                Incomplete ({incompleteTasks})
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Custom Widgets Added by User */}
        {customWidgets.map((w) => (
          <div
            key={w.id}
            className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-3"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">{w.title}</h4>
              <button
                onClick={() => handleRemoveWidget(w.id)}
                className="text-slate-400 hover:text-red-500"
              >
                <X size={14} />
              </button>
            </div>
            <div className="h-32 flex items-center justify-center border border-dashed border-slate-200 rounded-xl dark:border-slate-800 text-xs text-slate-400">
              Live widget visualization for {w.title}
            </div>
          </div>
        ))}
      </div>

      {/* Add Widget Modal */}
      <Modal
        isOpen={isAddWidgetModalOpen}
        onClose={() => setIsAddWidgetModalOpen(false)}
        title="Add Dashboard Widget"
        maxWidthClassName="max-w-md"
      >
        <div className="space-y-3">
          <p className="text-xs text-slate-500">Select a widget to add to your dashboard grid:</p>
          <div className="space-y-2">
            {[
              { id: "w-priority", title: "Tasks by Priority Breakdown", type: "priority" as const },
              { id: "w-overdue", title: "Overdue Tasks Detail Widget", type: "overdue" as const },
              { id: "w-activity", title: "Recent Team Activity Feed", type: "activity" as const },
            ].map((widget) => (
              <div
                key={widget.id}
                onClick={() => handleAddWidget(widget)}
                className="flex items-center justify-between rounded-xl border border-slate-200 p-3 hover:border-blue-500 hover:bg-blue-50/50 cursor-pointer dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800/80 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <BarChart2 size={16} className="text-blue-500" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    {widget.title}
                  </span>
                </div>
                <Plus size={14} className="text-slate-400" />
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}
