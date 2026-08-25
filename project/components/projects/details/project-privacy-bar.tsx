"use client";

import { getProjectsAction } from "@/actions/project-actions";
import { loadProjectMeta, saveProjectMeta } from "@/lib/project-meta";
import { sileo } from "@/utils/alerts";
import {
  Check,
  ChevronDown,
  Globe,
  Loader2,
  Lock,
  Share2,
  Users,
  X,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

interface SharedTeam {
  id: string;
  name: string;
}

interface ProjectPrivacyBarProps {
  projectId: string;
  projectTitle: string;
  initialIsPublic?: boolean;
  onPrivacyChange?: (isPublic: boolean, sharedTeams: SharedTeam[]) => void;
}

export function ProjectPrivacyBar({
  projectId,
  projectTitle,
  initialIsPublic = false,
  onPrivacyChange,
}: ProjectPrivacyBarProps) {
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [sharedTeams, setSharedTeams] = useState<SharedTeam[]>([]);
  const [availableTeams, setAvailableTeams] = useState<SharedTeam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  const [isShareDropdownOpen, setIsShareDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load project privacy and shared teams from metadata on mount
  useEffect(() => {
    if (!projectId) return;
    const meta = loadProjectMeta(projectId);
    if (meta) {
      if (meta.isPublic !== undefined) setIsPublic(meta.isPublic);
      if (meta.sharedTeams) setSharedTeams(meta.sharedTeams);
    }
  }, [projectId]);

  // Fetch available workspace candidate teams
  useEffect(() => {
    let isMounted = true;
    async function loadWorkspaceTeams() {
      setIsLoading(true);
      try {
        const allProjects = await getProjectsAction();
        if (isMounted) {
          const others = allProjects
            .filter((p) => p.id !== projectId && p.name !== projectTitle)
            .map((p) => ({ id: p.id, name: p.name }));
          setAvailableTeams(others);
        }
      } catch (err) {
        console.error("[ProjectPrivacyBar] Error loading workspace teams:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadWorkspaceTeams();
    return () => {
      isMounted = false;
    };
  }, [projectId, projectTitle]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsShareDropdownOpen(false);
      }
    }
    if (isShareDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isShareDropdownOpen]);

  const handleToggleVisibility = async () => {
    if (isToggling || !projectId) return;
    const nextVal = !isPublic;
    setIsPublic(nextVal);
    setIsToggling(true);

    try {
      saveProjectMeta(projectId, { isPublic: nextVal });
      if (nextVal) {
        sileo.success(`"${projectTitle}" is now public to all workspace members.`, "Visibility Changed");
      } else {
        sileo.info(`"${projectTitle}" is now private to project members.`, "Visibility Changed");
      }
      onPrivacyChange?.(nextVal, sharedTeams);
    } catch {
      setIsPublic(!nextVal);
      sileo.error("Failed to update visibility.", "Error");
    } finally {
      setIsToggling(false);
    }
  };

  const handleToggleTeamShare = (team: SharedTeam) => {
    if (!projectId) return;
    const isCurrentlyShared = sharedTeams.some((t) => t.id === team.id);
    let nextTeams: SharedTeam[];

    if (isCurrentlyShared) {
      nextTeams = sharedTeams.filter((t) => t.id !== team.id);
    } else {
      nextTeams = [...sharedTeams, team];
    }

    setSharedTeams(nextTeams);
    saveProjectMeta(projectId, { sharedTeams: nextTeams });
    onPrivacyChange?.(isPublic, nextTeams);

    if (isCurrentlyShared) {
      sileo.info(`Removed "${team.name}" from shared access.`, "Sharing Updated");
    } else {
      sileo.success(`"${projectTitle}" shared with "${team.name}".`, "Project Shared");
    }
  };

  const sharedTeamNames = sharedTeams.map((t) => t.name).join(", ");

  return (
    <div className="relative flex flex-wrap items-center justify-between gap-2 px-6 py-2 bg-slate-50/90 dark:bg-[#14263e]/80 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 shrink-0">
      {/* Privacy Status Label */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {isPublic ? (
          <>
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0">
              <Globe size={12} />
            </span>
            <span className="font-bold text-emerald-700 dark:text-emerald-300 truncate">
              Public Project
            </span>
            <span className="text-[11px] text-slate-400 hidden sm:inline truncate">
              — visible to all workspace members
            </span>
          </>
        ) : sharedTeams.length > 0 ? (
          <>
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shrink-0">
              <Users size={12} />
            </span>
            <span className="font-medium text-slate-700 dark:text-slate-200 truncate">
              Private Project — shared with:{" "}
              <span className="font-bold text-blue-600 dark:text-blue-400">
                {sharedTeamNames}
              </span>
            </span>
          </>
        ) : (
          <>
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 shrink-0">
              <Lock size={12} />
            </span>
            <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
              Private Project — only project members have access
            </span>
          </>
        )}
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Share with team dropdown (when project is private) */}
        {!isPublic && (
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsShareDropdownOpen((prev) => !prev)}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#1c304a] border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-1 rounded-xl transition-all shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <Share2 size={12} className="text-slate-500 dark:text-slate-400" />
              <span>{sharedTeams.length > 0 ? "Edit shared teams" : "Share with team"}</span>
              <ChevronDown size={11} className="opacity-70" />
            </button>

            {isShareDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-64 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xl dark:border-slate-700 dark:bg-[#101f35] z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-100 dark:border-slate-800">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                    <Share2 size={13} className="text-[#0052cc]" />
                    Share with Team
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsShareDropdownOpen(false)}
                    className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2.5 leading-relaxed">
                  Select other teams in your workspace to grant view access to this private project:
                </p>

                {availableTeams.length === 0 ? (
                  <div className="py-4 text-center text-xs text-slate-400 dark:text-slate-500">
                    No other projects or teams found in this workspace.
                  </div>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                    {availableTeams.map((team) => {
                      const isChecked = sharedTeams.some((t) => t.id === team.id);
                      return (
                        <button
                          key={team.id}
                          type="button"
                          onClick={() => handleToggleTeamShare(team)}
                          className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium text-left transition-colors cursor-pointer ${
                            isChecked
                              ? "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 font-bold"
                              : "hover:bg-slate-100 text-slate-700 dark:hover:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          <span className="truncate">{team.name}</span>
                          <div
                            className={`w-4 h-4 rounded-md flex items-center justify-center border transition-colors shrink-0 ${
                              isChecked
                                ? "bg-[#0033a0] border-[#0033a0] text-white"
                                : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                            }`}
                          >
                            {isChecked && <Check size={11} strokeWidth={3} />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Make Public / Make Private Button */}
        <button
          type="button"
          onClick={handleToggleVisibility}
          disabled={isToggling || isLoading}
          className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-xl border transition-all cursor-pointer disabled:opacity-50 ${
            isPublic
              ? "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 bg-white dark:bg-[#1c304a]"
              : "border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 shadow-2xs"
          }`}
        >
          {isToggling ? (
            <Loader2 size={12} className="animate-spin" />
          ) : isPublic ? (
            <>
              <Lock size={11} />
              Make private
            </>
          ) : (
            <>
              <Globe size={11} />
              Make public
            </>
          )}
        </button>
      </div>
    </div>
  );
}
