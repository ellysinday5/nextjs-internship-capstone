"use client";

import {
  BarChart3,
  Calendar,
  Clock,
  FileText,
  Kanban,
  LayoutList,
  MessageSquare,
  Paperclip,
  Plus,
  Users,
} from "lucide-react";
import React, { useState } from "react";

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
    </div>
  );
}
