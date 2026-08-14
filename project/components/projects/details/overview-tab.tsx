"use client";

import { Plus, Users } from "lucide-react";
import { z } from "zod";
import type { ProjectMember } from "@/actions/member-actions";
import { useCategories } from "@/context/category-context";

const descriptionSchema = z.string().max(300, "Description must not exceed 300 characters.");

interface OverviewTabProps {
  projectDescription: string;
  tempDescription: string;
  setTempDescription: (v: string) => void;
  isEditingDescription: boolean;
  setIsEditingDescription: (v: boolean) => void;
  isSavingDescription: boolean;
  onSaveDescription: (desc: string) => Promise<void>;
  ownerName: string;
  status: string;
  taskCount: number;
  techStack: string[];
  members: ProjectMember[];
  onAddMember: () => void;
}

export function OverviewTab({
  projectDescription,
  tempDescription,
  setTempDescription,
  isEditingDescription,
  setIsEditingDescription,
  isSavingDescription,
  onSaveDescription,
  ownerName,
  status,
  taskCount,
  techStack,
  members,
  onAddMember,
}: OverviewTabProps) {
  const { categories } = useCategories();

  return (
    <div className="flex-1 overflow-auto bg-slate-50/50 dark:bg-[#0f1d31]/50 p-6 lg:p-8 space-y-6">
      {/* Description Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#14263e] p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
            Project Description
          </h3>
          {!isEditingDescription ? (
            <button
              onClick={() => {
                setTempDescription(projectDescription);
                setIsEditingDescription(true);
              }}
              className="text-xs font-semibold text-[#0033a0] hover:underline dark:text-blue-400"
            >
              Edit
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <span className={`text-xs font-semibold ${tempDescription.length > 300 ? "text-red-500 font-bold" : "text-slate-400"}`}>
                {tempDescription.length} / 300
              </span>
              <button
                onClick={() => {
                  setIsEditingDescription(false);
                  setTempDescription(projectDescription);
                }}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const validation = descriptionSchema.safeParse(tempDescription);
                  if (!validation.success) return;
                  await onSaveDescription(tempDescription);
                  setIsEditingDescription(false);
                }}
                disabled={isSavingDescription || tempDescription.length > 300}
                className="px-3.5 py-1.5 bg-[#0033a0] text-white text-xs font-bold rounded-xl hover:bg-[#002a80] disabled:opacity-50 transition-colors"
              >
                {isSavingDescription ? "Saving..." : "Save"}
              </button>
            </div>
          )}
        </div>

        {!isEditingDescription ? (
          projectDescription.trim() ? (
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {projectDescription}
            </p>
          ) : (
            <p className="text-xs italic text-slate-400">
              No project description. Click &quot;Edit description&quot; to add one.
            </p>
          )
        ) : (
          <div className="space-y-2">
            <textarea
              rows={4}
              value={tempDescription}
              onChange={(e) => setTempDescription(e.target.value)}
              placeholder="Add a detailed description for this project (max 300 characters)..."
              className={`w-full rounded-xl border px-3.5 py-3 text-sm text-slate-800 dark:text-slate-100 focus:outline-none transition-colors resize-none ${tempDescription.length > 300
                  ? "border-red-400 focus:ring-2 focus:ring-red-400 dark:border-red-600"
                  : "border-slate-200 focus:ring-2 focus:ring-[#0033a0] dark:border-slate-700 dark:bg-slate-900"
                }`}
            />
            {tempDescription.length > 300 && (
              <p className="text-xs font-semibold text-red-500">
                Description must not exceed 300 characters. ({tempDescription.length - 300} over limit)
              </p>
            )}
          </div>
        )}
      </div>

      {/* Project Info & Meta Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Project Details */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#14263e] p-5 shadow-sm space-y-3.5">
          <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">PROJECT INFO</h4>
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Project Manager</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{ownerName || "Elly Sinday"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Status</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{status || "On track"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Total Tasks</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{taskCount}</span>
            </div>
          </div>
        </div>

        {/* Tech Stack / Tags */}
        <div className="md:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#14263e] p-5 shadow-sm space-y-3.5">
          <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">CATEGORIES &amp; TECH STACK</h4>
          <div className="flex flex-wrap gap-2">
            {categories.length > 0 ? (
              categories.map((cat, i) => (
                <span key={i} className="px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                  {cat}
                </span>
              ))
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                Frontend
              </span>
            )}
            {techStack.length > 0 ? (
              techStack.map((tech, i) => (
                <span key={i} className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {tech}
                </span>
              ))
            ) : (
              <>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">Next.js</span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">TypeScript</span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">TailwindCSS</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Project Members Section */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#14263e] p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Users size={16} className="text-purple-500" /> Project Members ({members.length})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Team members assigned to this project</p>
          </div>
          <button
            onClick={onAddMember}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0033a0] hover:bg-[#002a80] text-white text-xs font-bold rounded-xl transition-colors"
          >
            <Plus size={13} /> Add Member
          </button>
        </div>

        {members.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-6 text-center text-xs text-slate-400">
            No members assigned to this project yet. Click &quot;Add Member&quot; above to invite team members.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {members.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30"
              >
                <div className="h-9 w-9 rounded-xl bg-[#142843] flex items-center justify-center font-bold text-xs text-white shrink-0">
                  {m.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{m.name}</p>
                  <p className="text-[10px] font-semibold text-slate-400 truncate capitalize">{m.role}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
