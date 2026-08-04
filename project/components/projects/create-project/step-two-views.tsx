"use client";

import React, { useState } from "react";
import { Check, LayoutList, Kanban, Clock, BarChart3, Calendar, FileText, Users, ChevronDown, Activity } from "lucide-react";
import { CreateProjectFormValues, RECOMMENDED_VIEWS, POPULAR_VIEWS, ViewId } from "./types";

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
  const [showMore, setShowMore] = useState(false);

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

  const getIcon = (id: ViewId) => {
    switch (id) {
      case "overview":
        return <Activity size={18} className="text-blue-600 dark:text-blue-400" />;
      case "list":
        return <LayoutList size={18} className="text-blue-600 dark:text-blue-400" />;
      case "board":
        return <Kanban size={18} className="text-blue-600 dark:text-blue-400" />;
      case "timeline":
        return <Clock size={18} className="text-blue-600 dark:text-blue-400" />;
      case "dashboard":
        return <BarChart3 size={18} className="text-blue-600 dark:text-blue-400" />;
      case "calendar":
        return <Calendar size={18} className="text-emerald-600 dark:text-emerald-400" />;
      case "page":
        return <FileText size={18} className="text-emerald-600 dark:text-emerald-400" />;
      case "workload":
        return <Users size={18} className="text-emerald-600 dark:text-emerald-400" />;
      default:
        return <BarChart3 size={18} className="text-emerald-600 dark:text-emerald-400" />;
    }
  };

  return (
    <div className="flex flex-col justify-between h-full space-y-6">
      <div className="space-y-5 overflow-y-auto max-h-[calc(100vh-220px)] pr-1 scrollbar-thin">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            Choose views for your project
          </h1>
        </div>

        {/* Section 1: Asana recommended */}
        <div className="space-y-2.5">
          <h2 className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Asana recommended
          </h2>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {RECOMMENDED_VIEWS.map((view) => {
              const isSelected = formData.selectedViews.includes(view.id);
              return (
                <div
                  key={view.id}
                  onClick={() => toggleView(view.id, view.isRequired)}
                  className={`group relative flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-all ${
                    isSelected
                      ? "border-blue-500 bg-blue-50/60 dark:border-blue-500 dark:bg-blue-950/30"
                      : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
                  }`}
                >
                  <div
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs transition-colors ${
                      isSelected
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-800"
                    }`}
                  >
                    {isSelected && <Check size={13} strokeWidth={3} />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {view.name}
                      </span>
                      {view.isRequired && (
                        <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                          (required)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
                      {view.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Popular */}
        <div className="space-y-2.5 pt-2">
          <h2 className="text-xs font-medium text-slate-500 dark:text-slate-400">Popular</h2>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {POPULAR_VIEWS.map((view) => {
              const isSelected = formData.selectedViews.includes(view.id);
              return (
                <div
                  key={view.id}
                  onClick={() => toggleView(view.id)}
                  className={`group relative flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-all ${
                    isSelected
                      ? "border-blue-500 bg-blue-50/60 dark:border-blue-500 dark:bg-blue-950/30"
                      : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
                  }`}
                >
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                    {getIcon(view.id)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      {view.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                      {view.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowMore(!showMore)}
          className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline dark:text-blue-400 pt-1"
        >
          {showMore ? "Show fewer views" : "Show more views"}
          <ChevronDown size={14} className={showMore ? "rotate-180 transition-transform" : ""} />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
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
          className="w-2/3 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Creating project..." : "Create project"}
        </button>
      </div>
    </div>
  );
}
