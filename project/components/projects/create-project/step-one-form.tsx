"use client";

import React, { useState } from "react";
import { Lock, X, ChevronDown, Users, Globe } from "lucide-react";
import { CreateProjectFormValues } from "./types";
import { createProjectSchema } from "@/lib/project-schemas";

interface StepOneFormProps {
  formData: CreateProjectFormValues;
  setFormData: React.Dispatch<React.SetStateAction<CreateProjectFormValues>>;
  onContinue: () => void;
}

export function StepOneForm({ formData, setFormData, onContinue }: StepOneFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState("");

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData((prev) => ({ ...prev, name: val }));
    if (val.trim()) setError(null);
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!formData.shareWith.includes(tagInput.trim())) {
        setFormData((prev) => ({
          ...prev,
          shareWith: [...prev.shareWith, tagInput.trim()],
        }));
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      shareWith: prev.shareWith.filter((t) => t !== tagToRemove),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Zod Validation
    const result = createProjectSchema.pick({ name: true }).safeParse({ name: formData.name });
    
    if (!result.success) {
      setError(result.error.issues[0]?.message || "Invalid project name.");
      return;
    }
    
    setError(null);
    onContinue();
  };

  return (
    <div className="flex flex-col justify-between h-full space-y-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">New project</h1>
        </div>

        <form id="step-one-form" onSubmit={handleSubmit} className="space-y-5">
          {/* Project Name Field */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">
              Project name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={handleNameChange}
              placeholder="e.g. Website Redesign"
              className={`w-full rounded-lg border bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-all dark:bg-slate-900 dark:text-slate-100 ${
                error
                  ? "border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900/50"
                  : "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:focus:ring-blue-900/40"
              }`}
              autoFocus
            />
            {error && <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>}
          </div>

          {/* Project Access Field */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">
              Project access
            </label>
            <div className="relative">
              <select
                value={formData.access}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    access: e.target.value as CreateProjectFormValues["access"],
                  }))
                }
                className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-9 py-2.5 text-sm text-slate-800 outline-none transition-all hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-blue-900/40"
              >
                <option value="private">Private</option>
                <option value="public">Public to organization</option>
                <option value="team">Shared with team</option>
              </select>
              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                {formData.access === "private" ? (
                  <Lock size={15} />
                ) : formData.access === "public" ? (
                  <Globe size={15} />
                ) : (
                  <Users size={15} />
                )}
              </div>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                <ChevronDown size={16} />
              </div>
            </div>
          </div>

          {/* Share with (optional) Field */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">
              Share with (optional)
            </label>
            <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-slate-300 bg-white p-2 dark:border-slate-700 dark:bg-slate-900 min-h-[42px]">
              {formData.shareWith.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <span className="flex items-center justify-center rounded-full bg-slate-300 text-[10px] font-bold w-4 h-4 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                    {tag[0]?.toUpperCase()}
                  </span>
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder={formData.shareWith.length === 0 ? "Type team name & press Enter..." : ""}
                className="flex-1 min-w-[120px] bg-transparent px-1 text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100"
              />
            </div>
          </div>
        </form>
      </div>

      {/* Footer Submit Button — always visible, no scroll needed */}
      <div className="pt-4 mt-auto">
        <button
          type="submit"
          form="step-one-form"
          className="w-full rounded-lg bg-[#142843] py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#0f1f35] shadow-sm active:scale-[0.99]"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
