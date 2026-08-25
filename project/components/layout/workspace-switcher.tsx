"use client";

import {
  type UserWorkspace,
  type UserWorkspacesResult,
  getUserWorkspacesAction,
  switchActiveWorkspaceAction,
} from "@/actions/member-actions";
import { sileo } from "@/utils/alerts";
import {
  Building2,
  Check,
  ChevronsUpDown,
  Crown,
  Plus,
  Settings2,
  Sparkles,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useRef, useTransition } from "react";

interface WorkspaceSwitcherProps {
  isCollapsed?: boolean;
}

export function WorkspaceSwitcher({ isCollapsed = false }: WorkspaceSwitcherProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState<UserWorkspacesResult>({
    ownedWorkspaces: [],
    memberWorkspaces: [],
    activeWorkspace: null,
  });
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    getUserWorkspacesAction()
      .then((res) => {
        if (mounted) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("[WorkspaceSwitcher] Failed to load workspaces:", err);
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const activeWs = data.activeWorkspace || data.ownedWorkspaces[0] || data.memberWorkspaces[0];

  const handleSelectWorkspace = async (ws: UserWorkspace) => {
    if (activeWs && ws.id === activeWs.id) {
      setIsOpen(false);
      return;
    }

    // Optimistic active update
    setData((prev) => {
      const owned = prev.ownedWorkspaces.map((w) => ({
        ...w,
        isActive: w.id === ws.id,
      }));
      const member = prev.memberWorkspaces.map((w) => ({
        ...w,
        isActive: w.id === ws.id,
      }));
      const current = [...owned, ...member].find((w) => w.id === ws.id) || ws;
      return {
        ownedWorkspaces: owned,
        memberWorkspaces: member,
        activeWorkspace: { ...current, isActive: true },
      };
    });

    setIsOpen(false);

    startTransition(async () => {
      const res = await switchActiveWorkspaceAction(ws.id);
      if (res.success) {
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("syntraflow:workspace-changed", { detail: { workspaceId: ws.id } }),
          );
        }
        sileo.success(`Switched to ${ws.name}`, "Workspace Changed");
        router.refresh();
      } else {
        sileo.error(res.error || "Failed to switch workspace.", "Error");
      }
    });
  };

  if (loading) {
    return (
      <div className="px-3 py-2">
        <div className="h-11 rounded-xl bg-white/5 animate-pulse" />
      </div>
    );
  }

  // Collapsed view (small icon button)
  if (isCollapsed) {
    return (
      <div className="relative px-2 py-2" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          title={`Active Workspace: ${activeWs?.name || "Workspace"}`}
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0f1f35] border border-white/10 text-blue-400 shadow-md hover:bg-white/10 hover:border-white/20 transition-all mx-auto"
        >
          <Building2 size={18} />
        </button>

        {isOpen && (
          <div className="absolute left-full top-0 ml-3 z-50 w-64 rounded-2xl border border-white/15 bg-[#0f1f35]/95 backdrop-blur-xl p-2 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {renderDropdownContent()}
          </div>
        )}
      </div>
    );
  }

  function renderDropdownContent() {
    return (
      <div className="space-y-3">
        {/* Workspaces I Own */}
        {data.ownedWorkspaces.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <Crown size={12} className="text-amber-400" />
              My Workspaces
            </div>
            <div className="mt-1 space-y-0.5">
              {data.ownedWorkspaces.map((ws) => {
                const isActive = activeWs?.id === ws.id;
                return (
                  <button
                    key={ws.id}
                    type="button"
                    onClick={() => handleSelectWorkspace(ws)}
                    className={`group flex w-full items-center justify-between gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-[#3151b7] text-white shadow-sm"
                        : "text-slate-200 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-white/5 text-slate-400 group-hover:text-white group-hover:bg-white/10"
                        }`}
                      >
                        <Building2 size={14} />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-bold">{ws.name}</div>
                        <div
                          className={`text-[10px] ${isActive ? "text-blue-100" : "text-slate-400"}`}
                        >
                          {ws.projectCount} {ws.projectCount === 1 ? "project" : "projects"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`rounded-md px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-amber-400/10 text-amber-300 border border-amber-400/20"
                        }`}
                      >
                        Owner
                      </span>
                      {isActive && <Check size={14} className="text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Workspaces I'm a Member Of */}
        {data.memberWorkspaces.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <UserCheck size={12} className="text-blue-400" />
              Member Workspaces
            </div>
            <div className="mt-1 space-y-0.5">
              {data.memberWorkspaces.map((ws) => {
                const isActive = activeWs?.id === ws.id;
                return (
                  <button
                    key={ws.id}
                    type="button"
                    onClick={() => handleSelectWorkspace(ws)}
                    className={`group flex w-full items-center justify-between gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-[#3151b7] text-white shadow-sm"
                        : "text-slate-200 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-white/5 text-slate-400 group-hover:text-white group-hover:bg-white/10"
                        }`}
                      >
                        <Building2 size={14} />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-bold">{ws.name}</div>
                        <div
                          className={`text-[10px] ${isActive ? "text-blue-100" : "text-slate-400"}`}
                        >
                          {ws.projectCount} {ws.projectCount === 1 ? "project" : "projects"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`rounded-md px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-blue-400/10 text-blue-300 border border-blue-400/20"
                        }`}
                      >
                        {ws.role}
                      </span>
                      {isActive && <Check size={14} className="text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="border-t border-white/10 pt-2 space-y-1">
          {activeWs && (
            <Link
              href={`/workspaces/${activeWs.id}`}
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              <Building2 size={14} className="text-blue-400" />
              <span>View Active Workspace</span>
            </Link>
          )}
          <Link
            href="/workspaces"
            onClick={() => setIsOpen(false)}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            <Settings2 size={14} className="text-slate-400" />
            <span>Manage Workspaces</span>
          </Link>
        </div>
      </div>
    );
  }

  // Expanded view
  return (
    <div className="relative px-3 py-2" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`group flex w-full items-center justify-between gap-2.5 rounded-2xl border px-3 py-2.5 text-left text-white transition-all duration-200 ${
          isOpen
            ? "bg-[#0f1f35] border-blue-500/40 shadow-lg shadow-black/20"
            : "bg-[#0f1f35]/80 border-white/10 hover:bg-[#0f1f35] hover:border-white/20"
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#3151b7] text-white shadow-sm">
            <Building2 size={16} />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-100 group-hover:text-white">
              My Workspaces
            </div>
            <div className="text-[10px] font-semibold text-slate-400">Switch workspace</div>
          </div>
        </div>

        <ChevronsUpDown
          size={15}
          className={`shrink-0 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-white" : "group-hover:text-slate-200"
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-3 right-3 top-full mt-2 z-50 rounded-2xl border border-white/15 bg-[#0f1f35] p-2.5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
          {renderDropdownContent()}
        </div>
      )}
    </div>
  );
}
