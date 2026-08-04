"use client";

import React, { useState } from "react";
import { sileo } from "@/utils/alerts";
import { deleteProjectAction, ProjectWithStats } from "@/app/actions/project-actions";
import { Modal } from "@/components/modals/BaseModal";

interface DeleteProjectModalProps {
  isOpen: boolean;
  project: ProjectWithStats | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function DeleteProjectModal({
  isOpen,
  project,
  onClose,
  onSuccess,
}: DeleteProjectModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  if (!project) return null;

  const handleClose = () => {
    if (isDeleting) return;
    setServerError(null);
    onClose();
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setServerError(null);

    const res = await deleteProjectAction(project.id);

    if (res.success) {
      sileo.success(`Project "${project.name}" and all related tasks deleted!`, "Project Deleted");
      setIsDeleting(false);
      onClose();
      onSuccess?.();
    } else {
      setServerError(res.error || "Failed to delete project");
      sileo.error(res.error || "Failed to delete project", "Error");
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Delete Project"
      showCloseButton={false}
      maxWidthClassName="max-w-lg"
      footer={
        <>
          <button
            type="button"
            onClick={handleClose}
            disabled={isDeleting}
            className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? "Deleting..." : "Delete Permanently"}
          </button>
        </>
      }
    >
      <p className="mb-4 text-sm font-medium leading-relaxed text-slate-700 dark:text-slate-200">
        Are you sure you want to delete{" "}
        <span className="font-bold text-red-600 dark:text-red-400">&quot;{project.name}&quot;</span>
        ?
      </p>

      <div className="space-y-1 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs font-semibold text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300">
        <p className="font-bold">Cascade Deletion Notice:</p>
        <p className="font-normal leading-relaxed">
          Deleting this project will permanently remove all associated task lists, tasks, assignees,
          and task comments from the database.
        </p>
      </div>

      {serverError && (
        <p className="mt-4 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600 dark:bg-red-900/30 dark:text-red-400">
          {serverError}
        </p>
      )}
    </Modal>
  );
}
