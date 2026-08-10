"use client";

import React, { useState } from "react";
import {
  Plus,
  LayoutList,
  FileText,
  Kanban,
  Calendar,
  Clock,
  BarChart3,
  Users,
  Paperclip,
  MessageSquare,
} from "lucide-react";

interface ProjectTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  availableTabs: string[];
  onAddTab: (tab: string) => void;
}

const ADD_TAB_POPULAR = [
  { name: "List", icon: LayoutList, desc: "Organize tasks in a powerful table" },
  { name: "Page", icon: FileText, desc: "Write meeting notes and more" },
  { name: "Gantt", icon: Clock, desc: "Track dependencies and baselines" },
  { name: "Board", icon: Kanban, desc: "Track work in a Kanban view" },
  { name: "Calendar", icon: Calendar, desc: "Plan weekly or monthly work" },
  { name: "Timeline", icon: Clock, desc: "Schedule work over time" },
];

const ADD_TAB_OTHER = [
  { name: "Workload", icon: Users, desc: "See how busy your team is based on tasks" },
  { name: "Dashboard", icon: BarChart3, desc: "Monitor project metrics and insights" },
  { name: "Files", icon: Paperclip, desc: "View all attachments" },
  { name: "Messages", icon: MessageSquare, desc: "Communicate with others" },
];

export function ProjectTabs({
  activeTab,
  setActiveTab,
  availableTabs,
  onAddTab,
}: ProjectTabsProps) {
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);

  return (
    <div className="px-6 flex items-center gap-6 border-b border-slate-200 dark:border-slate-800 text-sm font-medium bg-white dark:bg-[#0f1d31]">
      {availableTabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`pb-2.5 pt-1 transition-colors relative ${
            activeTab === tab
              ? "text-slate-900 dark:text-white font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-sky-500"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
        >
          {tab}
        </button>
      ))}

      {/* Add Tab Dropdown `+` Button (Screenshot 7) */}
      <div className="relative pb-2 pt-1">
        <button
          onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Add view"
        >
          <Plus size={16} />
        </button>

        {isAddMenuOpen && (
          <div className="absolute top-full left-0 z-50 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-800 dark:bg-[#14263e]">
            {/* Popular section */}
            <div className="space-y-2 mb-4">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Popular
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {ADD_TAB_POPULAR.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => {
                      onAddTab(item.name);
                      setIsAddMenuOpen(false);
                    }}
                    className="flex items-start gap-2.5 p-2 rounded-xl text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    <item.icon size={18} className="text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-slate-400 leading-tight">
                        {item.desc}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Other section */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Other
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {ADD_TAB_OTHER.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => {
                      onAddTab(item.name);
                      setIsAddMenuOpen(false);
                    }}
                    className="flex items-start gap-2.5 p-2 rounded-xl text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    <item.icon size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-slate-400 leading-tight">
                        {item.desc}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
