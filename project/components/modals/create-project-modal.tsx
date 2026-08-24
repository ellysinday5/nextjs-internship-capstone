"use client";

import { createProjectAction } from "@/actions/project-actions";
import { Modal } from "@/components/modals/BaseModal";
import { ConfirmationModal } from "@/components/modals/ConfirmationModal";
import { type CreateProjectFormValues, createProjectSchema } from "@/lib/project-schemas";
import { sileo } from "@/utils/alerts";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateProjectModal({ isOpen, onClose, onSuccess }: CreateProjectModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      description: "",
      dueDate: "",
    },
  });

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

  const onSubmit = async (data: CreateProjectFormValues) => {
    setServerError(null);
    const res = await createProjectAction(data);

    if (res.success) {
      sileo.success(`Project "${data.name}" created successfully!`, "Project Created");
      resetAndClose();
      onSuccess?.();
    } else {
      setServerError(res.error || "Failed to create project");
      sileo.error(res.error || "Failed to create project", "Error");
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleCloseAttempt}
        title="Create New Project"
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
              form="create-project-form"
              className="rounded-lg bg-[#0033a0] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#002a80] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Create Project
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
          id="create-project-form"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
          noValidate
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Project Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register("name")}
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
      />
    </>
  );
}
