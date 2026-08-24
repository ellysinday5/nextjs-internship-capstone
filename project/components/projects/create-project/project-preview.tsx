"use client";

<<<<<<< HEAD
import { Calendar, CheckCircle2, Folder, Globe, Lock, Tag, User, Users } from "lucide-react";
import React from "react";
import {
  type CreateProjectFormValues,
=======
import { CheckCircle2, Folder, User } from "lucide-react";
import React from "react";
import {
  type CreateProjectFormValues,
  POPULAR_VIEWS,
>>>>>>> 4016eb6 (Fixed and Initial ui for the system)
  RECOMMENDED_VIEWS,
  type ViewId,
} from "./types";

interface ProjectPreviewProps {
  formData: CreateProjectFormValues;
  onSelectTab: (tab: ViewId) => void;
  step: 1 | 2;
}

export function ProjectPreview({ formData, onSelectTab, step }: ProjectPreviewProps) {
  const projectName = formData.name.trim() || "Untitled Project";
  const activeTab = formData.activePreviewTab;

  return (
    <div className="flex flex-col h-full rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
      {/* Header bar in Preview */}
      <div className="border-b border-slate-200/80 pb-4 dark:border-slate-800 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0033a0] to-blue-600 shadow-sm text-white font-bold text-lg">
              {projectName.charAt(0).toUpperCase() || "P"}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 truncate">
                {projectName}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                  {formData.access === "private" ? (
                    <Lock size={10} />
                  ) : formData.access === "public" ? (
                    <Globe size={10} />
                  ) : (
                    <Users size={10} />
                  )}
                  {formData.access === "private"
                    ? "Private"
                    : formData.access === "public"
                      ? "Public"
                      : "Team"}
                </span>

                {formData.shareWith.length > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:text-blue-300">
                    <Users size={10} />
                    {formData.shareWith.length} shared {formData.shareWith.length === 1 ? "team" : "teams"}
                  </span>
                )}

                {formData.dueDate && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                    <Calendar size={10} />
                    Due: {formData.dueDate}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Description snippet if present */}
        {formData.description?.trim() && (
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed bg-white/70 dark:bg-slate-900/80 rounded-lg p-2 border border-slate-200/50 dark:border-slate-800">
            {formData.description}
          </p>
        )}

        {/* Tech stack pills if present */}
        {formData.techStack && formData.techStack.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            {formData.techStack.map((tech) => (
              <span
                key={tech}
                className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
              >
                <Tag size={9} className="text-blue-500" />
                {tech}
              </span>
            ))}
          </div>
        )}

        {/* View Tabs */}
        {step === 2 && (
          <div className="flex items-center gap-4 overflow-x-auto pt-1 scrollbar-none">
            {formData.selectedViews.map((viewId) => {
              const viewMeta = RECOMMENDED_VIEWS.find((v) => v.id === viewId);
              const isActive = activeTab === viewId;
              return (
                <button
                  key={viewId}
                  type="button"
                  onClick={() => onSelectTab(viewId)}
                  className={`text-xs font-semibold pb-1 border-b-2 transition-all whitespace-nowrap ${
                    isActive
                      ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                      : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  }`}
                >
                  {viewMeta?.name || viewId}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Dynamic Content Preview Body */}
      <div className="flex-1 pt-4 overflow-hidden">
        {step === 1 || activeTab === "list" ? (
          <ListPreviewContent />
        ) : activeTab === "overview" ? (
          <OverviewPreviewContent />
        ) : activeTab === "board" ? (
          <BoardPreviewContent />
        ) : activeTab === "timeline" || activeTab === "gantt" ? (
          <TimelinePreviewContent />
        ) : (
          <DashboardPreviewContent />
        )}
      </div>
    </div>
  );
}

function ListPreviewContent() {
  return (
    <div className="space-y-4">
      <div className="h-3 w-28 rounded bg-slate-300 dark:bg-slate-700" />
      <div className="space-y-3">
        {[
          { color: "bg-red-500", tag: "bg-purple-400" },
          { color: "bg-emerald-500", tag: "bg-emerald-400" },
          { color: "bg-emerald-500", tag: "bg-blue-400" },
        ].map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 rounded-lg border border-slate-200/60 bg-white p-2.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900"
          >
            <CheckCircle2 size={15} className="text-slate-400 shrink-0" />
            <div className="h-2.5 flex-1 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded-full bg-slate-300 dark:bg-slate-700 flex items-center justify-center">
                <User size={10} className="text-slate-500" />
              </div>
              <Folder size={13} className="text-slate-400" />
              <div className={`h-2.5 w-12 rounded ${item.color}`} />
              <div className={`h-2.5 w-10 rounded ${item.tag}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OverviewPreviewContent() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-2 space-y-4">
        <div className="space-y-2">
          <div className="h-3 w-full rounded bg-slate-300 dark:bg-slate-700" />
          <div className="h-3 w-5/6 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-3 w-4/6 rounded bg-slate-200 dark:bg-slate-800" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-purple-200 text-purple-700 flex items-center justify-center text-[10px] font-bold">
                EG
              </div>
              <div className="h-2.5 w-20 rounded bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-emerald-200 text-emerald-700 flex items-center justify-center text-[10px] font-bold">
                AJ
              </div>
              <div className="h-2.5 w-20 rounded bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>
        </div>
      </div>
      <div className="col-span-1 rounded-xl border border-slate-200 bg-white p-3 space-y-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="h-3 w-20 rounded bg-slate-300 dark:bg-slate-700" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-amber-400 shrink-0" />
              <div className="h-2.5 flex-1 rounded bg-slate-200 dark:bg-slate-800" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BoardPreviewContent() {
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="space-y-3">
        <div className="h-3 w-16 rounded bg-slate-300 dark:bg-slate-700" />
        <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2 dark:border-slate-800 dark:bg-slate-900">
          <div className="h-2.5 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="flex gap-1.5">
            <div className="h-2 w-8 rounded bg-purple-400" />
            <div className="h-2 w-8 rounded bg-emerald-400" />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="h-3 w-16 rounded bg-slate-300 dark:bg-slate-700" />
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden p-0 dark:border-slate-800 dark:bg-slate-900">
          <div className="h-24 bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400">
            <div className="h-10 w-10 rounded-full bg-slate-300 dark:bg-slate-700" />
          </div>
          <div className="p-3 space-y-2">
            <div className="h-2.5 w-4/5 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="flex gap-1.5">
              <div className="h-2 w-8 rounded bg-purple-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="h-3 w-16 rounded bg-slate-300 dark:bg-slate-700" />
        <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2 dark:border-slate-800 dark:bg-slate-900">
          <div className="h-2.5 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-2 w-8 rounded bg-purple-400" />
        </div>
      </div>
    </div>
  );
}

function TimelinePreviewContent() {
  return (
    <div className="space-y-3">
      <div className="h-3 w-32 rounded bg-slate-300 dark:bg-slate-700" />
      <div className="space-y-2.5 pt-2">
        <div className="flex items-center gap-3">
          <div className="h-2.5 w-24 rounded bg-slate-300 dark:bg-slate-700" />
          <div className="h-6 flex-1 rounded-lg bg-blue-500/80 ml-4" />
        </div>
      </div>
    </div>
  );
}

function DashboardPreviewContent() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2 dark:border-slate-800 dark:bg-slate-900">
        <div className="h-3 w-20 rounded bg-slate-300 dark:bg-slate-700" />
        <div className="h-8 w-16 rounded-lg bg-blue-500/20 text-blue-600 font-bold flex items-center justify-center text-lg">
          85%
        </div>
      </div>
    </div>
  );
}
