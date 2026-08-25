"use client";

import {
  getTaskPrivacyAction,
  setTaskSharedTeamsAction,
  toggleTaskVisibilityAction,
  type SharedTeamRecord,
} from "@/actions/task-actions";
import { sileo } from "@/utils/alerts";
import {
  Check,
  ChevronDown,
  Globe,
  Loader2,
  Lock,
  Plus,
  Share2,
  Users,
  X,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

interface TaskPrivacyBarProps {
  taskId: string;
  initialIsPublic?: boolean;
  initialSharedTeams?: SharedTeamRecord[];
  onPrivacyChange?: (isPublic: boolean, sharedTeams: SharedTeamRecord[]) => void;
}

export function TaskPrivacyBar({
  taskId,
  initialIsPublic = false,
  initialSharedTeams = [],
  onPrivacyChange,
}: TaskPrivacyBarProps) {
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [sharedTeams, setSharedTeams] = useState<SharedTeamRecord[]>(initialSharedTeams);
  const [availableTeams, setAvailableTeams] = useState<SharedTeamRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  const [isShareDropdownOpen, setIsShareDropdownOpen] = useState(false);
  const [isSavingTeams, setIsSavingTeams] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync with prop changes if task switches
  useEffect(() => {
    setIsPublic(initialIsPublic);
    setSharedTeams(initialSharedTeams);
  }, [taskId, initialIsPublic, initialSharedTeams]);

  // Fetch live privacy state & candidate teams for this task
  useEffect(() => {
    let isMounted = true;
    async function fetchPrivacy() {
      setIsLoading(true);
      try {
        const res = await getTaskPrivacyAction(taskId);
        if (res.success && isMounted) {
          if (res.isPublic !== undefined) setIsPublic(res.isPublic);
          if (res.sharedTeams) setSharedTeams(res.sharedTeams);
          if (res.availableTeams) setAvailableTeams(res.availableTeams);
        }
      } catch (err) {
        console.error("[TaskPrivacyBar] Error loading privacy:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchPrivacy();
    return () => {
      isMounted = false;
    };
  }, [taskId]);

  // Close dropdown on click outside
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
    if (isToggling) return;
    const nextVal = !isPublic;
    setIsPublic(nextVal);
    setIsToggling(true);

    try {
      const res = await toggleTaskVisibilityAction(taskId, nextVal);
      if (res.success) {
        if (nextVal) {
          sileo.success("Task is now public to the workspace", "Visibility Changed");
        } else {
          sileo.info("Task is now private to this project", "Visibility Changed");
        }
        onPrivacyChange?.(nextVal, sharedTeams);
      } else {
        // Rollback
        setIsPublic(!nextVal);
        sileo.error(res.error || "Failed to update visibility", "Error");
      }
    } catch (err) {
      setIsPublic(!nextVal);
      sileo.error("An unexpected error occurred", "Error");
    } finally {
      setIsToggling(false);
    }
  };

  const handleToggleTeamShare = async (teamId: string) => {
    const isCurrentlyShared = sharedTeams.some((t) => t.id === teamId);
    let nextTeamIds: string[];

    if (isCurrentlyShared) {
      nextTeamIds = sharedTeams.filter((t) => t.id !== teamId).map((t) => t.id);
    } else {
      nextTeamIds = [...sharedTeams.map((t) => t.id), teamId];
    }

    setIsSavingTeams(true);
    try {
      const res = await setTaskSharedTeamsAction(taskId, nextTeamIds);
      if (res.success && res.sharedTeams) {
        setSharedTeams(res.sharedTeams);
        onPrivacyChange?.(isPublic, res.sharedTeams);
        if (isCurrentlyShared) {
          sileo.info("Team removed from task sharing", "Sharing Updated");
        } else {
          sileo.success("Task shared with team successfully", "Task Shared");
        }
      } else {
        sileo.error("Failed to update shared teams", "Error");
      }
    } catch (err) {
      sileo.error("Failed to update shared teams", "Error");
    } finally {
      setIsSavingTeams(false);
    }
  };

  const sharedTeamNames = sharedTeams.map((t) => t.name).join(", ");

  return (
    <div className="relative flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-slate-50 dark:bg-[#14263e] border-b border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 shrink-0">
      {/* Privacy Status Label */}
      <div className="flex items-center gap-1.5 min-w-0 flex-1">
        {isPublic ? (
          <>
            <Globe size={13} className="text-emerald-500 shrink-0" />
            <span className="font-medium text-emerald-700 dark:text-emerald-300 truncate">
              Public
            </span>
            <span className="text-[11px] text-slate-400 hidden sm:inline truncate">
              — visible to anyone with access
            </span>
          </>
        ) : sharedTeams.length > 0 ? (
          <>
            <Users size={13} className="text-blue-500 shrink-0" />
            <span className="font-medium text-slate-700 dark:text-slate-200 truncate">
              Private — shared with:{" "}
              <span className="font-bold text-blue-600 dark:text-blue-400">
                {sharedTeamNames}
              </span>
            </span>
          </>
        ) : (
          <>
            <Lock size={13} className="text-amber-500 shrink-0" />
            <span className="font-medium truncate">
              Private to members of this project
            </span>
          </>
        )}
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Share with team dropdown (only when task is private) */}
        {!isPublic && (
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsShareDropdownOpen((prev) => !prev)}
              disabled={isLoading}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/70 px-2.5 py-1 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              <Share2 size={11} className="text-slate-500 dark:text-slate-400" />
              {sharedTeams.length > 0 ? "Edit shared teams" : "Share with team"}
              <ChevronDown size={11} className="opacity-70" />
            </button>

            {isShareDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-64 rounded-xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-[#101f35] z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-100 dark:border-slate-800">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    Share with Team
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsShareDropdownOpen(false)}
                    className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
                  >
                    <X size={12} />
                  </button>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2.5">
                  Select teams in your workspace that can view this private task:
                </p>

                {availableTeams.length === 0 ? (
                  <div className="py-3 text-center text-xs text-slate-400 dark:text-slate-500">
                    No other teams found in workspace.
                  </div>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                    {availableTeams.map((team) => {
                      const isChecked = sharedTeams.some((t) => t.id === team.id);
                      return (
                        <button
                          key={team.id}
                          type="button"
                          onClick={() => handleToggleTeamShare(team.id)}
                          disabled={isSavingTeams}
                          className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer ${
                            isChecked
                              ? "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
                              : "hover:bg-slate-100 text-slate-700 dark:hover:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          <span className="truncate">{team.name}</span>
                          <div
                            className={`w-4 h-4 rounded flex items-center justify-center border transition-colors shrink-0 ${
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
          className="text-blue-600 dark:text-blue-400 hover:underline text-[11px] font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50"
        >
          {isToggling ? (
            <Loader2 size={11} className="animate-spin" />
          ) : isPublic ? (
            "Make private"
          ) : (
            "Make public"
          )}
        </button>
      </div>
    </div>
  );
}
