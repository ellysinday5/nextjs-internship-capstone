"use client";

import {
  Activity,
  BarChart3,
  Calendar,
  Check,
  Clock,
  FileText,
  Kanban,
  LayoutList,
  MessageSquare,
  Paperclip,
  Plus,
  Users,
  X,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

interface ProjectTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  availableTabs: string[];
  onAddTab: (tab: string) => void;
}

const ALL_VIEW_OPTIONS = [
  {
    name: "List",
    icon: LayoutList,
    desc: "Organize tasks in a powerful table",
    category: "Popular",
  },
  {
    name: "Board",
    icon: Kanban,
    desc: "Track work in a Kanban board",
    category: "Popular",
  },
  {
    name: "Timeline",
    icon: Clock,
    desc: "Schedule work and milestones over time",
    category: "Popular",
  },
  {
    name: "Calendar",
    icon: Calendar,
    desc: "Plan weekly or monthly deadlines",
    category: "Popular",
  },
  {
    name: "Dashboard",
    icon: BarChart3,
    desc: "Monitor project metrics and completion insights",
    category: "Analytics",
  },
  {
    name: "Gantt",
    icon: Clock,
    desc: "Track dependencies and project baselines",
    category: "Popular",
  },
  {
    name: "Overview",
    icon: Activity,
    desc: "Project summary, team members, and description",
    category: "General",
  },
];

export function ProjectTabs({
  activeTab,
  setActiveTab,
  availableTabs,
  onAddTab,
}: ProjectTabsProps) {
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsAddMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsAddMenuOpen(false);
      }
    };
    if (isAddMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isAddMenuOpen]);

  const handleSelectView = (viewName: string) => {
    onAddTab(viewName);
    setActiveTab(viewName);
    setIsAddMenuOpen(false);
  };

  return (
    <div className="px-6 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 text-sm font-medium bg-white dark:bg-[#0f1d31] relative">
      <div className="flex items-center gap-6 overflow-x-auto scrollbar-none py-0.5">
        {availableTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2.5 pt-1.5 transition-colors relative whitespace-nowrap text-xs font-semibold ${
              activeTab === tab
                ? "text-[#0033a0] dark:text-blue-400 font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#0033a0] dark:after:bg-blue-400"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Add View (+) Button */}
      <div className="relative ml-1 my-1" ref={menuRef}>
        <button
          type="button"
          onClick={() => setIsAddMenuOpen((prev) => !prev)}
          title="Add view to project"
          className={`flex h-7 w-7 items-center justify-center rounded-lg border transition-all ${
            isAddMenuOpen
              ? "border-blue-500 bg-blue-50 text-blue-600 dark:border-blue-500 dark:bg-blue-950/50 dark:text-blue-400 shadow-xs"
              : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Plus size={14} strokeWidth={2.5} />
        </button>

        {/* Add View Dropdown */}
        {isAddMenuOpen && (
          <div className="absolute left-0 top-full mt-1.5 z-50 w-72 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Add a view</h4>
                <p className="text-[10px] text-slate-400">Add views to organize and visualize work</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddMenuOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={13} />
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-1 py-1.5 scrollbar-thin">
              {ALL_VIEW_OPTIONS.map((item) => {
                const IconComponent = item.icon;
                const isAlreadyAdded = availableTabs.includes(item.name);
                const isActive = activeTab === item.name;

                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => handleSelectView(item.name)}
                    className={`flex w-full items-start gap-2.5 rounded-xl px-2.5 py-2 text-left transition-all ${
                      isActive
                        ? "bg-blue-50/80 dark:bg-blue-950/50"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    <div
                      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                        isActive
                          ? "bg-blue-600 text-white"
                          : isAlreadyAdded
                            ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                            : "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400"
                      }`}
                    >
                      <IconComponent size={14} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`text-xs font-bold ${
                            isActive
                              ? "text-blue-700 dark:text-blue-300"
                              : "text-slate-800 dark:text-slate-200"
                          }`}
                        >
                          {item.name}
                        </span>
                        {isAlreadyAdded && (
                          <span className="flex items-center gap-0.5 text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                            <Check size={11} strokeWidth={3} /> Added
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-tight line-clamp-1">
                        {item.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
