"use client";

import { updateWorkspaceAction } from "@/actions/member-actions";
import type { UserWorkspace } from "@/actions/member-actions";
import { Modal } from "@/components/modals/BaseModal";
import { sileo } from "@/utils/alerts";
import { Building2, Loader2 } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";

interface EditWorkspaceModalProps {
  isOpen: boolean;
  workspace: UserWorkspace | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function EditWorkspaceModal({
  isOpen,
  workspace,
  onClose,
  onSuccess,
}: EditWorkspaceModalProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (workspace) {
      setName(workspace.name);
      setError(null);
    }
  }, [workspace]);

  if (!workspace) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please enter a workspace name.");
      return;
    }

    setLoading(true);
    setError(null);

    const res = await updateWorkspaceAction(workspace.id, trimmed);
    setLoading(false);

    if (res.success) {
      sileo.success(`Workspace renamed to "${trimmed}"!`, "Workspace Updated");
      onSuccess?.();
      onClose();
    } else {
      setError(res.error || "Failed to update workspace.");
      sileo.error(res.error || "Failed to update workspace.", "Error");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Rename Workspace"
      maxWidthClassName="max-w-md"
      footer={
        <div className="flex items-center justify-end gap-2.5 w-full">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="edit-workspace-form"
            disabled={loading || !name.trim() || name.trim() === workspace.name}
            className="px-4 py-2 text-sm font-medium text-white bg-[#0033a0] hover:bg-[#00277a] dark:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors flex items-center gap-2 shadow-sm shadow-blue-600/20"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      }
    >
      <form id="edit-workspace-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Workspace Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Building2 className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. Acme Studio"
              autoFocus
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0033a0]/30 focus:border-[#0033a0] transition-all"
            />
          </div>
          {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
        </div>
      </form>
    </Modal>
  );
}
