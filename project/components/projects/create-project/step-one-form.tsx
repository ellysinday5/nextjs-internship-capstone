"use client";

import { type AvailableTeam, getAvailableTeamsAction } from "@/actions/project-actions";
import { createProjectSchema } from "@/lib/project-schemas";
import { ChevronDown, Globe, Lock, Users, X } from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CreateProjectFormValues } from "./types";

interface StepOneFormProps {
  formData: CreateProjectFormValues;
  setFormData: React.Dispatch<React.SetStateAction<CreateProjectFormValues>>;
  onContinue: () => void;
}

export function StepOneForm({ formData, setFormData, onContinue }: StepOneFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [availableTeams, setAvailableTeams] = useState<AvailableTeam[]>([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoadingTeams(true);
    getAvailableTeamsAction()
      .then((teams) => {
        if (!cancelled) {
          setAvailableTeams(teams);
        }
      })
      .catch((err) => console.error("Failed to load teams:", err))
      .finally(() => {
        if (!cancelled) setIsLoadingTeams(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredTeams = useMemo(() => {
    const query = tagInput.trim().toLowerCase();
    return availableTeams.filter((team) => {
      const isAlreadyAdded = formData.shareWith.some(
        (t) => t.toLowerCase() === team.name.toLowerCase(),
      );
      if (isAlreadyAdded) return false;
      if (!query) return true;
      return (
        team.name.toLowerCase().includes(query) ||
        (team.ownerName && team.ownerName.toLowerCase().includes(query))
      );
    });
  }, [availableTeams, formData.shareWith, tagInput]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData((prev) => ({ ...prev, name: val }));
    if (val.trim()) setError(null);
  };

  const handleSelectTeam = (teamName: string) => {
    const trimmed = teamName.trim();
    if (!trimmed) return;
    if (!formData.shareWith.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        shareWith: [...prev.shareWith, trimmed],
      }));
    }
    setTagInput("");
    setIsDropdownOpen(false);
    inputRef.current?.focus();
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (filteredTeams.length > 0 && tagInput.trim()) {
        handleSelectTeam(filteredTeams[0].name);
      } else if (tagInput.trim()) {
        handleSelectTeam(tagInput.trim());
      }
    } else if (e.key === "Escape") {
      setIsDropdownOpen(false);
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
              Project name <span className="text-red-500">*</span>
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

          {/* Share with (optional) Field with team suggestions */}
          <div className="relative" ref={dropdownRef}>
            <label className="mb-1.5 flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
              <span>Share with (optional)</span>
              {availableTeams.length > 0 && (
                <span className="text-[11px] font-normal text-slate-400">
                  {availableTeams.length} existing {availableTeams.length === 1 ? "team" : "teams"}
                </span>
              )}
            </label>
            <div
              onClick={() => {
                setIsDropdownOpen(true);
                inputRef.current?.focus();
              }}
              className="flex flex-wrap items-center gap-1.5 rounded-lg border border-slate-300 bg-white p-2 dark:border-slate-700 dark:bg-slate-900 min-h-[42px] cursor-text focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 dark:focus-within:ring-blue-900/40 transition-all"
            >
              {formData.shareWith.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 border border-blue-200/80 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800"
                >
                  <span className="flex items-center justify-center rounded-full bg-blue-200/80 text-[10px] font-bold w-4 h-4 text-blue-800 dark:bg-blue-800 dark:text-blue-200">
                    {tag[0]?.toUpperCase()}
                  </span>
                  {tag}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveTag(tag);
                    }}
                    className="ml-0.5 text-blue-400 hover:text-blue-700 dark:hover:text-blue-200 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
              <input
                ref={inputRef}
                type="text"
                value={tagInput}
                onChange={(e) => {
                  setTagInput(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                onKeyDown={handleAddTag}
                placeholder={
                  formData.shareWith.length === 0
                    ? "Type team name or select from available teams..."
                    : "Add more teams..."
                }
                className="flex-1 min-w-[140px] bg-transparent px-1 text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100"
              />
            </div>

            {/* Suggestions Dropdown */}
            {isDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-1.5 z-50 max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in slide-in-from-top-1 duration-150">
                {isLoadingTeams ? (
                  <div className="px-3 py-2.5 text-xs text-slate-400 text-center">
                    Loading existing teams...
                  </div>
                ) : filteredTeams.length > 0 ? (
                  <div className="space-y-0.5">
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Available Teams ({filteredTeams.length})
                    </div>
                    {filteredTeams.map((team) => (
                      <button
                        key={team.id}
                        type="button"
                        onClick={() => handleSelectTeam(team.name)}
                        className="flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition-colors hover:bg-blue-50 dark:hover:bg-blue-950/40 group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700 font-bold text-xs dark:bg-blue-900/60 dark:text-blue-300">
                            {team.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate block">
                              {team.name}
                            </span>
                            {team.ownerName && (
                              <span className="text-[11px] text-slate-400 truncate block">
                                Lead: {team.ownerName}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="shrink-0 text-[10px] font-medium text-slate-400 rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5">
                          {team.memberCount} {team.memberCount === 1 ? "member" : "members"}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-3 py-2.5 text-xs text-slate-500 dark:text-slate-400 text-center">
                    {tagInput.trim() ? (
                      <div>
                        <p className="font-medium">No matching team found.</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Press <span className="font-bold text-blue-600">Enter</span> to add &ldquo;
                          {tagInput}&rdquo; as a new team.
                        </p>
                      </div>
                    ) : (
                      <p>All available teams have already been selected.</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Footer Submit Button — always visible */}
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
