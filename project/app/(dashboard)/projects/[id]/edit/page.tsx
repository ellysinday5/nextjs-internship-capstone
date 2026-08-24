"use client";

import { BackButton } from "@/components/ui/back-button";
import { ChevronDown, Gauge, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, use } from "react";

import { ConfirmationModal } from "@/components/modals/ConfirmationModal";
import { MembersPanel } from "@/components/projects/edit-card/members-panel";
import { TechStackEditor } from "@/components/projects/edit-card/tech-stack-editor";
import { useCategories } from "@/context/category-context";
import { type ProjectItem, initialProjects } from "@/lib/project-data";
import {
  ALL_PRIORITIES,
  ALL_STATUSES,
  type EditableProjectData,
  SUGGESTED_DEVS,
  type TeamMember,
} from "@/lib/project-edit-types";
import { createProjectSchema } from "@/lib/project-schemas";
import { sileo } from "@/utils/alerts";

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
  const owner = SUGGESTED_DEVS.find((d) => d.name.toLowerCase() === project.owner.toLowerCase());
  if (owner) {
    return [{ ...owner, role: "Project Lead", assignedTasks: [] }];
  }
  return [];
}

export default function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { categories } = useCategories();

  const [activeTab, setActiveTab] = useState<"details" | "members">("details");
  const [project, setProject] = useState<ProjectItem | null>(null);

  const [initialForm, setInitialForm] = useState<EditableProjectData | null>(null);
  const [form, setForm] = useState<EditableProjectData>({
    name: "",
    description: "",
    category: "Frontend",
    status: "In Progress",
    priority: "High",
    techStack: [],
    teamName: "",
    progress: 0,
    members: [],
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);

  useEffect(() => {
    let foundProj = initialProjects.find((p) => p.id === id);

    try {
      const stored = localStorage.getItem("syntraflow_local_project_overrides");
      if (stored) {
        const overrides = JSON.parse(stored);
        if (foundProj && overrides[id]) {
          foundProj = { ...foundProj, ...overrides[id] };
        }
      }
    } catch {}

    if (foundProj) {
      setProject(foundProj);
      const data: EditableProjectData = {
        name: foundProj.name,
        description: foundProj.description,
        category: foundProj.category,
        status: foundProj.status,
        priority: foundProj.priority,
        techStack: [...foundProj.techStack],
        teamName: foundProj.teamName,
        progress: foundProj.progress,
        members: buildInitialMembers(foundProj),
      };
      setForm(data);
      setInitialForm(JSON.parse(JSON.stringify(data)));
    }
  }, [id]);

  const isDirty = JSON.stringify(form) !== JSON.stringify(initialForm);

  const handleAttemptCancel = () => {
    if (isDirty) {
      setShowDiscardModal(true);
    } else {
      router.push("/projects");
    }
  };

  const handleConfirmDiscard = () => {
    setShowDiscardModal(false);
    router.push("/projects");
  };

  const handleAttemptSave = () => {
    const result = createProjectSchema.pick({ name: true }).safeParse({ name: form.name });
    if (!result.success) {
      setFormError(result.error.issues[0]?.message || "Invalid input");
      return;
    }
    setFormError(null);
    setShowSaveModal(true);
  };

  const handleConfirmSave = () => {
    if (!project) return;

    const updatedProject = {
      name: form.name,
      description: form.description,
      category: form.category,
      status: form.status,
      priority: form.priority,
      techStack: form.techStack,
      teamName: form.teamName,
      progress: form.progress,
      members: form.members.length,
    };

    try {
      const stored = localStorage.getItem("syntraflow_local_project_overrides");
      const overrides = stored ? JSON.parse(stored) : {};
      overrides[project.id] = { ...(overrides[project.id] || {}), ...updatedProject };
      localStorage.setItem("syntraflow_local_project_overrides", JSON.stringify(overrides));
    } catch {}

    setShowSaveModal(false);
    sileo.success(`"${form.name}" updated successfully!`, "Project Saved");
    router.push("/projects");
  };

  const set = <K extends keyof EditableProjectData>(key: K, value: EditableProjectData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === "name" && value) setFormError(null);
  };

  if (!project) {
    return <div className="p-8 text-center text-slate-500">Loading project data...</div>;
  }

  // Shared label class
  const label =
    "text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2";
  const inputCls =
    "w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-800 dark:text-white outline-none focus:border-[#0052cc] focus:ring-1 focus:ring-[#0052cc]/30 transition-colors";

  return (
    <div className="overflow-y-auto h-full p-4 sm:p-6 lg:p-8">
      <div className="w-full rounded-2xl bg-white dark:bg-[#14263e] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
        {/* Page Header */}
        <div className="flex items-center gap-3 px-6 sm:px-8 py-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <BackButton onClick={handleAttemptCancel} title="Back to projects" />
          <h1 className="text-2xl sm:text-3xl font-black text-[#142843] dark:text-white tracking-tight">
            Edit Project
          </h1>
          {isDirty && (
            <span className="ml-auto text-xs font-bold text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-full">
              Unsaved changes
            </span>
          )}
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 px-6 sm:px-8 border-b border-slate-200 dark:border-slate-700 shrink-0">
          {(["details", "members"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-bold capitalize transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? "border-[#0052cc] text-[#0052cc]"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              {tab === "members" ? `Members (${form.members.length})` : "Details"}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 sm:p-8">
          {activeTab === "details" ? (
            /* Two-column layout to use horizontal space */
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-10 gap-y-6">
              {/* ── LEFT COLUMN ── */}
              <div className="space-y-6">
                {/* Project Name */}
                <div>
                  <label className={label}>Project Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                      className={`${inputCls} pr-10 ${formError ? "border-red-500 focus:ring-red-500/30" : ""}`}
                    />
                    <Pencil
                      size={14}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                  </div>
                  {formError && (
                    <p className="mt-1.5 text-xs font-medium text-red-500">{formError}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className={label}>Description</label>
                  <textarea
                    rows={4}
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                    placeholder="What is this project about?"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-800 dark:text-slate-100 outline-none focus:border-[#0052cc] focus:ring-1 focus:ring-[#0052cc]/30 resize-none placeholder-slate-400 leading-relaxed transition-colors"
                  />
                </div>

                {/* Tech Stack Editor */}
                <TechStackEditor
                  techStack={form.techStack}
                  setTechStack={(stack) => set("techStack", stack)}
                />
              </div>

              {/* ── RIGHT COLUMN ── */}
              <div className="space-y-6">
                {/* Category */}
                <div>
                  <label className={label}>Category</label>
                  <div className="relative">
                    <select
                      value={form.category}
                      onChange={(e) => set("category", e.target.value)}
                      className={`${inputCls} appearance-none cursor-pointer pr-10`}
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className={label}>Status</label>
                  <div className="relative">
                    <select
                      value={form.status}
                      onChange={(e) => set("status", e.target.value)}
                      className={`w-full appearance-none rounded-xl border px-4 py-3 text-sm font-bold outline-none focus:border-[#0052cc] cursor-pointer pr-10 transition-colors ${STATUS_COLORS[form.status] || "border-slate-300 bg-white text-slate-800"}`}
                    >
                      {ALL_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60"
                    />
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <label className={label}>Priority</label>
                  <div className="relative">
                    <select
                      value={form.priority}
                      onChange={(e) => set("priority", e.target.value)}
                      className={`w-full appearance-none rounded-xl border px-4 py-3 text-sm font-bold outline-none focus:border-[#0052cc] cursor-pointer pr-10 transition-colors ${PRIORITY_COLORS[form.priority] || "border-slate-300 bg-white text-slate-800"}`}
                    >
                      {ALL_PRIORITIES.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60"
                    />
                  </div>
                </div>

                {/* Team Name */}
                <div>
                  <label className={label}>Team Name</label>
                  <input
                    type="text"
                    value={form.teamName}
                    onChange={(e) => set("teamName", e.target.value)}
                    placeholder="e.g. Frontend Squad"
                    className={inputCls}
                  />
                </div>

                {/* Completion Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Gauge size={14} /> Completion Progress
                    </label>
                    <span className="text-sm font-extrabold text-[#0052cc]">{form.progress}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={form.progress}
                    onChange={(e) => set("progress", Number.parseInt(e.target.value))}
                    className="w-full h-2 accent-[#0052cc] cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-medium">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <MembersPanel
              members={form.members}
              setMembers={(members) => set("members", members)}
              projectName={form.name}
            />
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 sm:px-8 py-5 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div className="text-xs font-medium text-slate-400">
            {form.members.length} member(s) · {form.techStack.length} tech
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleAttemptCancel}
              className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-[#142843] dark:text-white font-bold text-sm rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              onClick={handleAttemptSave}
              className="px-5 py-2.5 bg-[#0052cc] hover:bg-[#003d99] text-white font-bold text-sm rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Save Changes
            </button>
          </div>
        </div>

        {/* Confirmation Modals */}
        <ConfirmationModal
          isOpen={showDiscardModal}
          onClose={() => setShowDiscardModal(false)}
          onConfirm={handleConfirmDiscard}
          variant="discard"
          showCloseButton={false}
        />
        <ConfirmationModal
          isOpen={showSaveModal}
          onClose={() => setShowSaveModal(false)}
          onConfirm={handleConfirmSave}
          variant="save"
          showCloseButton={false}
        />
      </div>
    </div>
  );
}
