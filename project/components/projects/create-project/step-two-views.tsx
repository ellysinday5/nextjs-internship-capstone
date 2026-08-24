"use client";

<<<<<<< HEAD
import { SUGGESTED_TECH } from "@/lib/project-edit-types";
import {
  Activity,
  BarChart3,
  Calendar as CalendarIcon,
  Check,
  Clock,
  Kanban,
  LayoutList,
  Plus,
  Tag,
  X,
=======
import {
  Activity,
  BarChart3,
  Calendar,
  Check,
  ChevronDown,
  Clock,
  FileText,
  Kanban,
  LayoutList,
  Users,
>>>>>>> 4016eb6 (Fixed and Initial ui for the system)
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import {
  type CreateProjectFormValues,
<<<<<<< HEAD
=======
  POPULAR_VIEWS,
>>>>>>> 4016eb6 (Fixed and Initial ui for the system)
  RECOMMENDED_VIEWS,
  type ViewId,
} from "./types";

interface StepTwoViewsProps {
  formData: CreateProjectFormValues;
  setFormData: React.Dispatch<React.SetStateAction<CreateProjectFormValues>>;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function StepTwoViews({
  formData,
  setFormData,
  onBack,
  onSubmit,
  isSubmitting,
}: StepTwoViewsProps) {
  const [techInput, setTechInput] = useState("");
  const [techSuggestionsOpen, setTechSuggestionsOpen] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];

  const toggleView = (viewId: ViewId, isRequired?: boolean) => {
    if (isRequired) return;

    setFormData((prev) => {
      const exists = prev.selectedViews.includes(viewId);
      const updatedViews = exists
        ? prev.selectedViews.filter((v) => v !== viewId)
        : [...prev.selectedViews, viewId];

      let newActiveTab = prev.activePreviewTab;
      if (exists && prev.activePreviewTab === viewId) {
        newActiveTab = updatedViews[0] || "list";
      }

      return {
        ...prev,
        selectedViews: updatedViews,
        activePreviewTab: newActiveTab,
      };
    });
  };

  const addTech = (tech: string) => {
    const trimmed = tech.trim();
    if (!trimmed || formData.techStack.includes(trimmed)) return;
    setFormData((prev) => ({
      ...prev,
      techStack: [...prev.techStack, trimmed],
    }));
    setTechInput("");
    setTechSuggestionsOpen(false);
  };

  const removeTech = (techToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      techStack: prev.techStack.filter((t) => t !== techToRemove),
    }));
  };

  const handleTechKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTech(techInput);
    }
  };

  const filteredTechSuggestions = SUGGESTED_TECH.filter(
    (tech) =>
      tech.toLowerCase().includes(techInput.toLowerCase()) &&
      !formData.techStack.includes(tech),
  );

  const getIcon = (id: ViewId) => {
    switch (id) {
      case "overview":
        return <Activity size={16} className="text-blue-600 dark:text-blue-400" />;
      case "list":
        return <LayoutList size={16} className="text-blue-600 dark:text-blue-400" />;
      case "board":
        return <Kanban size={16} className="text-blue-600 dark:text-blue-400" />;
      case "timeline":
        return <Clock size={16} className="text-blue-600 dark:text-blue-400" />;
      case "dashboard":
        return <BarChart3 size={16} className="text-blue-600 dark:text-blue-400" />;
      default:
        return <BarChart3 size={16} className="text-blue-600 dark:text-blue-400" />;
    }
  };

  return (
    <div className="flex flex-col justify-between h-full space-y-5">
      <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-210px)] pr-1 scrollbar-thin">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            Project Details &amp; Setup
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure tech stack, description, timeline, and views for this project.
          </p>
        </div>

        {/* 1. Tech Stack Section */}
        <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-900/50">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 block">
            Tech Stack
          </label>

          {/* Current Tech Stack Tags */}
          <div className="flex flex-wrap gap-1.5 min-h-[28px] items-center">
            {formData.techStack.map((tech) => (
              <span
                key={tech}
                className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200/80 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800"
              >
                <Tag size={11} className="text-blue-500 shrink-0" />
                {tech}
                <button
                  type="button"
                  onClick={() => removeTech(tech)}
                  className="ml-0.5 text-blue-400 hover:text-red-500 transition-colors"
                >
                  <X size={11} />
                </button>
              </span>
            ))}
            {formData.techStack.length === 0 && (
              <span className="text-xs text-slate-400 italic">No tech stack added yet</span>
            )}
          </div>

          {/* Input with autocomplete */}
          <div className="relative">
            <div className="flex gap-2">
              <input
                type="text"
                value={techInput}
                onChange={(e) => {
                  setTechInput(e.target.value);
                  setTechSuggestionsOpen(true);
                }}
                onFocus={() => setTechSuggestionsOpen(true)}
                onBlur={() => setTimeout(() => setTechSuggestionsOpen(false), 200)}
                onKeyDown={handleTechKeyDown}
                placeholder="e.g. Next.js, TypeScript, PostgreSQL..."
                className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-blue-900/40"
              />
              <button
                type="button"
                onClick={() => addTech(techInput)}
                className="inline-flex items-center gap-1 rounded-lg bg-blue-600 hover:bg-blue-700 px-3 py-2 text-xs font-semibold text-white transition-colors"
              >
                <Plus size={13} /> Add
              </button>
            </div>

            {/* Autocomplete Dropdown */}
            {techSuggestionsOpen && techInput && filteredTechSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 z-50 max-h-36 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-900">
                {filteredTechSuggestions.slice(0, 8).map((tech) => (
                  <button
                    key={tech}
                    type="button"
                    onMouseDown={() => addTech(tech)}
                    className="w-full text-left px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg dark:text-slate-200 dark:hover:bg-blue-950/40 transition-colors"
                  >
                    {tech}
                  </button>
                ))}
              </div>
            )}

            {/* Quick Add Suggestions Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1.5">
              {SUGGESTED_TECH.slice(0, 8)
                .filter((t) => !formData.techStack.includes(t))
                .map((tech) => (
                  <button
                    key={tech}
                    type="button"
                    onClick={() => addTech(tech)}
                    className="text-[11px] font-medium px-2 py-0.5 rounded-md border border-slate-200 bg-white text-slate-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-all"
                  >
                    + {tech}
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* 2. Target Due Date & Description Grid */}
        <div className="space-y-4">
          {/* Target Due Date Field */}
          <div>
            <label className="mb-1.5 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200">
              <span className="flex items-center gap-1.5">
                <CalendarIcon size={13} className="text-blue-600 dark:text-blue-400" />
                Target Completion Date
              </span>
              <span className="text-[11px] font-normal text-slate-400">optional</span>
            </label>
            <input
              type="date"
              min={todayStr}
              value={formData.dueDate}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  dueDate: e.target.value,
                }))
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-none transition-all [color-scheme:light] dark:[color-scheme:dark] focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-blue-900/40"
            />
          </div>

          {/* Description Field */}
          <div>
            <label className="mb-1.5 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200">
              <span>Description</span>
              <span
                className={`text-[11px] font-medium ${
                  (formData.description?.length ?? 0) > 500
                    ? "text-red-500"
                    : "text-slate-400 dark:text-slate-500"
                }`}
              >
                {formData.description?.length ?? 0}/500
              </span>
            </label>
            <textarea
              rows={3}
              value={formData.description}
              maxLength={500}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Describe the key goals, architecture, or deliverables for this project..."
              className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-blue-900/40 leading-relaxed"
            />
          </div>
        </div>

        {/* 3. Project Views Selection (Compact) */}
        <div className="space-y-2 pt-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 block">
            Project Views
          </label>
          <div className="grid grid-cols-2 gap-2">
            {RECOMMENDED_VIEWS.map((view) => {
              const isSelected = formData.selectedViews.includes(view.id);
              return (
                <div
                  key={view.id}
                  onClick={() => toggleView(view.id, view.isRequired)}
                  className={`group relative flex items-center gap-2.5 rounded-lg border p-2.5 cursor-pointer transition-all ${
                    isSelected
                      ? "border-blue-500 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-950/30"
                      : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
                  }`}
                >
                  <div
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border text-xs transition-colors ${
                      isSelected
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-800"
                    }`}
                  >
                    {isSelected && <Check size={11} strokeWidth={3} />}
                  </div>

                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="shrink-0">{getIcon(view.id)}</span>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {view.name}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="w-1/3 rounded-lg border border-slate-300 bg-white py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Back
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-2/3 rounded-lg bg-[#0033a0] py-2.5 text-sm font-semibold text-white hover:bg-[#002880] transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Creating project..." : "Create project"}
        </button>
      </div>
    </div>
  );
}
