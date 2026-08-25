"use client";

import { Modal } from "@/components/modals/BaseModal";
import type { ProjectItem } from "@/lib/project-data";
import {
  ALL_PRIORITIES,
  ALL_STATUSES,
  type EditableProjectData,
  SUGGESTED_DEVS,
  type TeamMember,
} from "@/lib/project-edit-types";
import { sileo } from "@/utils/alerts";
import { ChevronDown, Gauge, Pencil, Save, X } from "lucide-react";
import React, { useState, useEffect } from "react";
import { MembersPanel } from "./members-panel";
import { TechStackEditor } from "./tech-stack-editor";

interface EditProjectCardModalProps {
  isOpen: boolean;
  project: ProjectItem | null;
  onClose: () => void;
  onSave: (projectId: string, updated: Partial<ProjectItem>) => void;
}

const STATUS_COLORS: Record<string, string> = {
  "In Progress": "bg-blue-100 text-blue-700 border-blue-200",
  Review: "bg-purple-100 text-purple-700 border-purple-200",
  Completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Planning: "bg-amber-100 text-amber-700 border-amber-200",
  "On Hold": "bg-slate-100 text-slate-600 border-slate-200",
};

const PRIORITY_COLORS: Record<string, string> = {
  High: "bg-rose-100 text-rose-700 border-rose-200",
  Medium: "bg-amber-100 text-amber-700 border-amber-200",
  Low: "bg-slate-100 text-slate-600 border-slate-200",
};

function buildInitialMembers(project: ProjectItem): TeamMember[] {
  // Build from SUGGESTED_DEVS based on owner name
  const owner = SUGGESTED_DEVS.find((d) => d.name.toLowerCase() === project.owner.toLowerCase());
  if (owner) {
    return [
      {
        ...owner,
        role: "Project Lead",
        assignedTasks: [],
      },
    ];
  }
  return [];
}

export function EditProjectCardModal({
  isOpen,
  project,
  onClose,
  onSave,
}: EditProjectCardModalProps) {
  const [activeTab, setActiveTab] = useState<"details" | "members">("details");
  const [form, setForm] = useState<EditableProjectData>({
    name: "",
    description: "",
    status: "In Progress",
    priority: "High",
    techStack: [],
    teamName: "",
    progress: 0,
    members: [],
  });

  // Seed form when project changes
  useEffect(() => {
    if (!project) return;
    setForm({
      name: project.name,
      description: project.description,
      status: project.status,
      priority: project.priority,
      techStack: [...project.techStack],
      teamName: project.teamName,
      progress: project.progress,
      members: buildInitialMembers(project),
    });
    setActiveTab("details");
  }, [project]);

  if (!project) return null;

  const handleSave = () => {
    onSave(project.id, {
      name: form.name,
      description: form.description,
      status: form.status,
      priority: form.priority,
      techStack: form.techStack,
      teamName: form.teamName,
      progress: form.progress,
      members: form.members.length,
    });
    sileo.success(`"${form.name}" updated successfully!`, "Project Saved");
    onClose();
  };

  const set = <K extends keyof EditableProjectData>(key: K, value: EditableProjectData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Project`}
      maxWidthClassName="max-w-2xl"
      footer={
        <div className="flex items-center gap-2 w-full justify-between">
          <span className="text-xs text-slate-400">
            {form.members.length} member(s) · {form.techStack.length} tech
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors"
            >
              <Save size={13} /> Save Changes
            </button>
          </div>
        </div>
      }
    >
      {/* Tab switcher */}
      <div className="flex gap-1 mb-5 border-b border-slate-200 dark:border-slate-700 -mx-5 px-5 pb-0">
        {(["details", "members"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-bold capitalize transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            {tab === "members" ? `Members (${form.members.length})` : "Details"}
          </button>
        ))}
      </div>

      {activeTab === "details" ? (
        <div className="space-y-4">
          {/* Project Name */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
              Project Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 pr-8"
              />
              <Pencil
                size={12}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="What is this project about?"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 resize-none placeholder-slate-400 leading-relaxed"
            />
          </div>

          {/* Status / Priority — 2 column row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Status
              </label>
              <div className="relative">
                <select
                  value={form.status}
                  onChange={(e) => set("status", e.target.value)}
                  className={`w-full appearance-none rounded-xl border px-3 py-2 text-xs font-bold outline-none focus:border-blue-500 cursor-pointer pr-7 ${STATUS_COLORS[form.status] || "border-slate-300 bg-white text-slate-800"}`}
                >
                  {ALL_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={13}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Priority
              </label>
              <div className="relative">
                <select
                  value={form.priority}
                  onChange={(e) => set("priority", e.target.value)}
                  className={`w-full appearance-none rounded-xl border px-3 py-2 text-xs font-bold outline-none focus:border-blue-500 cursor-pointer pr-7 ${PRIORITY_COLORS[form.priority] || "border-slate-300 bg-white text-slate-800"}`}
                >
                  {ALL_PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={13}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60"
                />
              </div>
            </div>
          </div>

          {/* Team Name */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
              Team Name
            </label>
            <input
              type="text"
              value={form.teamName}
              onChange={(e) => set("teamName", e.target.value)}
              placeholder="e.g. Frontend Squad"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-white outline-none focus:border-blue-500"
            />
          </div>

          {/* Progress slider */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Gauge size={11} /> Completion Progress
              </label>
              <span className="text-sm font-extrabold text-blue-600">{form.progress}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={form.progress}
              onChange={(e) => set("progress", Number.parseInt(e.target.value))}
              className="w-full h-2 accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Tech Stack Editor */}
          <TechStackEditor
            techStack={form.techStack}
            setTechStack={(stack) => set("techStack", stack)}
          />
        </div>
      ) : (
        /* Members Tab */
        <MembersPanel
          members={form.members}
          setMembers={(members) => set("members", members)}
          projectName={form.name}
        />
      )}
    </Modal>
  );
}
