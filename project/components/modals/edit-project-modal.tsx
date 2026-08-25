"use client";

import { type ProjectWithStats, updateProjectAction } from "@/actions/project-actions";
import { Modal } from "@/components/modals/BaseModal";
import { ConfirmationModal } from "@/components/modals/ConfirmationModal";
import { type UpdateProjectFormValues, updateProjectSchema } from "@/lib/project-schemas";
import { sileo } from "@/utils/alerts";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

interface EditProjectModalProps {
  isOpen: boolean;
  project: ProjectWithStats | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function EditProjectModal({ isOpen, project, onClose, onSuccess }: EditProjectModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  const formattedDueDate = project?.dueDate
    ? new Date(project.dueDate).toISOString().split("T")[0]
    : "";

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(updateProjectSchema),
    defaultValues: {
      id: project?.id || "",
      name: project?.name || "",
      description: project?.description || "",
      dueDate: formattedDueDate,
    } as UpdateProjectFormValues,
  });

  useEffect(() => {
    if (project) {
      setValue("id", project.id);
      setValue("name", project.name);
      setValue("description", project.description || "");
      setValue(
        "dueDate",
        project.dueDate ? new Date(project.dueDate).toISOString().split("T")[0] : "",
      );
    }
  }, [project, setValue]);

  if (!project) return null;

  const handleCloseAttempt = () => {
    if (isDirty) {
      setShowDiscardConfirm(true);
      return;
    }
    resetAndClose();
  };

  const resetAndClose = () => {
    reset();
    setServerError(null);
    setShowDiscardConfirm(false);
    onClose();
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    setServerError(null);
    const res = await updateProjectAction(data as UpdateProjectFormValues);

    if (res.success) {
      sileo.success(`Project "${data.name}" updated successfully!`, "Project Updated");
      resetAndClose();
      onSuccess?.();
    } else {
      setServerError(res.error || "Failed to update project");
      sileo.error(res.error || "Failed to update project", "Error");
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleCloseAttempt}
        title="Edit Project Details"
        showCloseButton={false}
        maxWidthClassName="max-w-2xl"
        footer={
          <>
            <button
              type="button"
              onClick={handleCloseAttempt}
              className="rounded-lg px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="edit-project-form"
              disabled={isSubmitting}
              className="rounded-lg bg-[#0033a0] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#002a80] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </>
        }
      >
        {serverError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-600 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">
            {serverError}
          </div>
        )}

        <form
          id="edit-project-form"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
          noValidate
        >
          <input type="hidden" {...register("id")} />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Project Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register("name")}
                placeholder="e.g. Website Redesign v2"
                className={`w-full rounded-xl border-2 px-4 py-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 dark:bg-slate-900 dark:text-slate-100 ${
                  errors.name
                    ? "border-red-400 focus:border-red-500"
                    : "border-slate-200 focus:border-[#0033a0] dark:border-slate-700"
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-xs font-semibold text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Target Completion Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                {...register("dueDate")}
                className={`w-full rounded-xl border-2 px-4 py-3 text-sm text-slate-900 outline-none transition-colors [color-scheme:light] dark:[color-scheme:dark] dark:bg-slate-900 dark:text-slate-100 ${
                  errors.dueDate
                    ? "border-red-400 focus:border-red-500"
                    : "border-slate-200 focus:border-[#0033a0] dark:border-slate-700"
                }`}
              />
              {errors.dueDate && (
                <p className="mt-1 text-xs font-semibold text-red-500">{errors.dueDate.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1.5 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Description{" "}
                <span className="text-xs font-normal text-slate-400 dark:text-slate-500">
                  (optional)
                </span>
              </span>
              <span
                className={`text-xs font-medium ${
                  (watch("description")?.length ?? 0) > 500
                    ? "text-red-500"
                    : "text-slate-400 dark:text-slate-500"
                }`}
              >
                {watch("description")?.length ?? 0}/500
              </span>
            </label>
            <textarea
              rows={5}
              {...register("description")}
              maxLength={500}
              placeholder="Describe the key goals, objectives, and deliverables for this project..."
              className={`w-full resize-none rounded-xl border-2 px-4 py-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 dark:bg-slate-900 dark:text-slate-100 ${
                errors.description
                  ? "border-red-400 focus:border-red-500"
                  : "border-slate-200 focus:border-[#0033a0] dark:border-slate-700"
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-xs font-semibold text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>
        </form>
      </Modal>

      <ConfirmationModal
        isOpen={showDiscardConfirm}
        onClose={() => setShowDiscardConfirm(false)}
        onConfirm={resetAndClose}
        variant="discard"
        showCloseButton={false}
        title="Discard Changes?"
        description="You have unsaved changes to this project. Are you sure you want to close?"
      />
    </>
  );
}
