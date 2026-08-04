"use client";

import React, { useState } from "react";
import { Plus, UserPlus, Target, Briefcase, Calendar, Clock, MoreHorizontal, Circle } from "lucide-react";
import { ProjectStatusType, STATUS_OPTIONS } from "./types";

interface OverviewTabProps {
  status: ProjectStatusType;
  setStatus: (status: ProjectStatusType) => void;
  description: string;
  setDescription: (desc: string) => void;
  ownerName: string;
  ownerInitials: string;
}

export function OverviewTab({
  status,
  setStatus,
  description,
  setDescription,
  ownerName,
  ownerInitials,
}: OverviewTabProps) {
  const [isEditingDesc, setIsEditingDesc] = useState(false);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 min-h-full">
      {/* Left Main Content (8 cols) */}
      <div className="lg:col-span-8 p-6 space-y-8 overflow-y-auto">
        {/* Project description section */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
            Project description
          </h2>

          {isEditingDesc ? (
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => setIsEditingDesc(false)}
              placeholder="What's this project about?"
              className="w-full rounded-xl border border-blue-500 bg-white p-3 text-xs text-slate-800 outline-none dark:bg-slate-900 dark:text-slate-100 placeholder-slate-400"
              autoFocus
            />
          ) : (
            <div
              onClick={() => setIsEditingDesc(true)}
              className="group cursor-pointer rounded-xl border border-transparent p-3 hover:border-slate-200 dark:hover:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all"
            >
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {description || "What's this project about?"}
              </p>
            </div>
          )}
        </div>

        {/* Project roles section */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
            Project roles
          </h2>
          <div className="flex items-center gap-4 flex-wrap">
            <button className="flex items-center gap-2 rounded-xl border border-dashed border-slate-300 p-3 text-xs font-semibold text-slate-600 hover:border-blue-500 hover:text-blue-600 dark:border-slate-700 dark:text-slate-300 transition-colors">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 dark:border-slate-700">
                <Plus size={16} />
              </div>
              Add member
            </button>

            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-400 font-bold text-xs text-amber-950">
                {ownerInitials}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {ownerName}
                </div>
                <div className="text-[11px] text-slate-400">Project owner</div>
              </div>
            </div>
          </div>
        </div>

        {/* Connected goals section */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
            Connected goals
          </h2>
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900/50 space-y-3">
            <p className="text-xs text-slate-500 max-w-sm">
              Connect or create a goal to link this project to a larger purpose.
            </p>
            <button className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors">
              <Target size={14} /> Add goal
            </button>
          </div>
        </div>

        {/* Connected portfolios section */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
            Connected portfolios
          </h2>
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900/50 space-y-3">
            <p className="text-xs text-slate-500 max-w-sm">
              Connect a portfolio to link this project to a larger portfolio view.
            </p>
            <button className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors">
              <Briefcase size={14} /> Add portfolio
            </button>
          </div>
        </div>
      </div>

      {/* Right Sidebar Activity Widget (4 cols) (Screenshot 1) */}
      <div className="lg:col-span-4 border-l border-slate-200/80 bg-slate-50/50 p-6 space-y-6 dark:border-slate-800 dark:bg-[#0f1d31]/50 overflow-y-auto">
        {/* What's the status? */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              What's the status?
            </h3>
            <button className="text-slate-400 hover:text-slate-600">
              <MoreHorizontal size={16} />
            </button>
          </div>

          {/* Status Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {STATUS_OPTIONS.slice(0, 3).map((st) => (
              <button
                key={st.label}
                onClick={() => setStatus(st.value)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                  status === st.value
                    ? `${st.colorClass} ring-2 ring-blue-500/50`
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300"
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${st.dotClass}`} />
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Due date display */}
        <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
          <Calendar size={15} />
          <span>No due date</span>
        </div>

        {/* Activity Timeline Feed */}
        <div className="space-y-4 pt-2">
          <div className="flex items-start gap-3 relative pl-2 border-l border-dashed border-slate-300 dark:border-slate-700">
            <div className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-slate-400" />
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                You joined
              </div>
              <div className="text-[11px] text-slate-400">15 days ago</div>
              <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[9px] font-bold text-amber-950">
                {ownerInitials}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 relative pl-2 border-l border-dashed border-slate-300 dark:border-slate-700">
            <div className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-slate-400" />
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Project created
              </div>
              <div className="text-[11px] text-slate-400">
                {ownerName} • 15 days ago
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
