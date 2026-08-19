"use client";

import {
  type UserWorkspace,
  type UserWorkspacesResult,
  deleteWorkspaceAction,
  getUserWorkspacesAction,
  switchActiveWorkspaceAction,
} from "@/actions/member-actions";
import { ConfirmationModal } from "@/components/modals/ConfirmationModal";
import { CreateWorkspaceModal } from "@/components/modals/create-workspace-modal";
import { EditWorkspaceModal } from "@/components/modals/edit-workspace-modal";
import { WorkspaceCard } from "@/components/workspaces/workspace-card";
import { sileo } from "@/utils/alerts";
import { Building2, Crown, FolderKanban, Plus, Search, UserCheck, X } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState, useTransition } from "react";

interface WorkspacesPageClientProps {
  initialData: UserWorkspacesResult;
}

export function WorkspacesPageClient({ initialData }: WorkspacesPageClientProps) {
  const router = useRouter();
  const [data, setData] = useState<UserWorkspacesResult>(initialData);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState<UserWorkspace | null>(null);
  const [deletingWorkspace, setDeletingWorkspace] = useState<UserWorkspace | null>(null);
  const [switchingId, setSwitchingId] = useState<string | null>(null);

  const refreshData = async () => {
    const updated = await getUserWorkspacesAction();
    setData(updated);
  };

  const handleSwitchWorkspace = async (workspaceId: string) => {
    setSwitchingId(workspaceId);
    const res = await switchActiveWorkspaceAction(workspaceId);
    setSwitchingId(null);

    if (res.success) {
      const switched = [...data.ownedWorkspaces, ...data.memberWorkspaces].find(
        (w) => w.id === workspaceId,
      );
      sileo.success(
        `Switched active context to "${switched?.name || "workspace"}".`,
        "Workspace Switched",
      );
      startTransition(() => {
        router.refresh();
      });
      await refreshData();
    } else {
      sileo.error(res.error || "Failed to switch workspace.", "Error");
    }
  };

  const handleDeleteWorkspace = async () => {
    if (!deletingWorkspace) return;
    const res = await deleteWorkspaceAction(deletingWorkspace.id);
    if (res.success) {
      sileo.success(`Workspace "${deletingWorkspace.name}" deleted.`, "Deleted");
      setDeletingWorkspace(null);
      await refreshData();
      startTransition(() => {
        router.refresh();
      });
    } else {
      sileo.error(res.error || "Failed to delete workspace.", "Error");
    }
  };

  // Filter workspaces by search
  const filterList = (list: UserWorkspace[]) => {
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (w) =>
        w.name.toLowerCase().includes(q) ||
        w.slug.toLowerCase().includes(q) ||
        (w.ownerName && w.ownerName.toLowerCase().includes(q)),
    );
  };

  const filteredOwned = filterList(data.ownedWorkspaces);
  const filteredMember = filterList(data.memberWorkspaces);
  const totalWorkspaces = data.ownedWorkspaces.length + data.memberWorkspaces.length;

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[#f0f4f8] dark:bg-[#0b1728] text-slate-800 dark:text-slate-100 p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            My Workspaces
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Organize projects, manage team collaboration, and switch active workspaces.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0033a0] hover:bg-[#00277a] dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            New Workspace
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search workspaces by name or slug..."
            className="w-full pl-9 pr-9 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0033a0]/30 focus:border-[#0033a0] transition-all shadow-sm"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={13} />
            </button>
          )}
        </div>

        <span className="text-xs font-semibold text-slate-400">
          Total:{" "}
          <strong className="text-slate-900 dark:text-white font-bold">{totalWorkspaces}</strong>
        </span>
      </div>

      {/* Workspaces Groups */}
      <div className="space-y-8">
        {/* GROUP 1: Workspaces I Own */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Owned
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
              {filteredOwned.length}
            </span>
          </div>

          {filteredOwned.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredOwned.map((ws) => (
                <WorkspaceCard
                  key={ws.id}
                  workspace={ws}
                  onSwitch={handleSwitchWorkspace}
                  onEdit={(w) => setEditingWorkspace(w)}
                  onDelete={(w) => setDeletingWorkspace(w)}
                  isSwitching={switchingId === ws.id}
                />
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30 text-center">
              <Building2 className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-60" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                {searchQuery
                  ? "No owned workspaces match your search."
                  : "You haven't created any workspaces yet."}
              </p>
              {!searchQuery && (
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(true)}
                  className="mt-3 text-xs font-semibold text-[#0033a0] dark:text-blue-400 hover:underline"
                >
                  + Create your first workspace
                </button>
              )}
            </div>
          )}
        </div>

        {/* GROUP 2: Workspaces I'm a Member Of */}
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Workspaces I'm a Member Of
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-[#0033a0] dark:text-blue-300">
              {filteredMember.length}
            </span>
          </div>

          {filteredMember.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredMember.map((ws) => (
                <WorkspaceCard
                  key={ws.id}
                  workspace={ws}
                  onSwitch={handleSwitchWorkspace}
                  isSwitching={switchingId === ws.id}
                />
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30 text-center">
              <FolderKanban className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-60" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                {searchQuery
                  ? "No member workspaces match your search."
                  : "You are not a member of any other workspaces yet. When someone invites you to a project, their workspace will appear here."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateWorkspaceModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={refreshData}
      />

      <EditWorkspaceModal
        isOpen={!!editingWorkspace}
        workspace={editingWorkspace}
        onClose={() => setEditingWorkspace(null)}
        onSuccess={refreshData}
      />

      <ConfirmationModal
        isOpen={!!deletingWorkspace}
        onClose={() => setDeletingWorkspace(null)}
        onConfirm={handleDeleteWorkspace}
        variant="delete"
        title="Delete Workspace"
        description={`Are you sure you want to delete "${deletingWorkspace?.name}"? Projects inside this workspace will be unlinked.`}
        confirmLabel="Delete Workspace"
      />
    </div>
  );
}
