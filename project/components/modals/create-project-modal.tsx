"use client";

import { createProjectAction } from "@/actions/project-actions";
import { Modal } from "@/components/modals/BaseModal";
import { ConfirmationModal } from "@/components/modals/ConfirmationModal";
import { saveProjectMeta } from "@/lib/project-meta";
import {
  type CreateProjectFormValues,
  type ProjectView,
  createProjectSchema,
} from "@/lib/project-schemas";
import { sileo } from "@/utils/alerts";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Calendar as CalendarIcon,
  Check,
  Clock,
  Kanban,
  LayoutList,
} from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const VIEW_OPTIONS: { id: ProjectView; label: string; desc: string; icon: React.ElementType }[] = [
  { id: "list",     label: "List",     desc: "Organize tasks in a table",            icon: LayoutList   },
  { id: "board",    label: "Board",    desc: "Track work in a Kanban board",         icon: Kanban       },
  { id: "timeline", label: "Timeline", desc: "Schedule work over time",              icon: Clock        },
  { id: "calendar", label: "Calendar", desc: "Plan weekly and monthly deadlines",    icon: CalendarIcon },
];

export function CreateProjectModal({ isOpen, onClose, onSuccess }: CreateProjectModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  const form = useForm({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      description: "",
      dueDate: "",
      views: ["list", "board", "timeline", "calendar"],
    } as CreateProjectFormValues,
  });

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting, isDirty } } = form;

  // views is guaranteed to be ProjectView[] by the schema; cast is safe
  const selectedViews = ((watch("views") ?? []) as ProjectView[]);

  const toggleView = (viewId: ProjectView) => {
    const next = selectedViews.includes(viewId)
      ? selectedViews.filter((v) => v !== viewId)
      : [...selectedViews, viewId];
    // react-hook-form's setValue type is narrowed to the schema output type;
    // the `as any` is the minimal escape hatch needed here.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (setValue as any)("views", next, { shouldValidate: true, shouldDirty: true });
  };

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
      if (res.project?.id) {
        // data.views is ProjectView[] (required) — always present after schema parse
        const capitalizedViews = data.views.map(
          (v) => v.charAt(0).toUpperCase() + v.slice(1).toLowerCase(),
        );
        saveProjectMeta(res.project.id, { views: capitalizedViews });
      }
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
              className="rounded-lg px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 cursor-pointer">

              Cancel
            </button>
            <button
              type="submit"
              form="create-project-form"
              disabled={isSubmitting}
              className="rounded-lg bg-[#0033a0] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#002a80] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? "Creating..." : "Create Project"}
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
                placeholder="e.g. Website Redesign"
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
                Target Completion Date
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
              rows={4}
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

          {/* Project Views Selection — equal, independently selectable */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Project Views <span className="text-red-500">*</span>
              <span className="ml-1 text-xs font-normal text-slate-400 dark:text-slate-500">
                (select at least one view)
              </span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {VIEW_OPTIONS.map((view) => {
                const isSelected = selectedViews.includes(view.id);
                const IconComponent = view.icon;
                return (
                  <button
                    key={view.id}
                    type="button"
                    onClick={() => toggleView(view.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#0033a0] bg-blue-50/60 dark:border-blue-500 dark:bg-blue-950/30 shadow-xs"
                        : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600"
                    }`}
                  >
                    <div
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border text-xs transition-colors ${
                        isSelected
                          ? "border-[#0033a0] bg-[#0033a0] text-white dark:border-blue-500 dark:bg-blue-500"
                          : "border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800"
                      }`}
                    >
                      {isSelected && <Check size={11} strokeWidth={3} />}
                    </div>

                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      <IconComponent size={16} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {view.label}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate leading-tight">
                        {view.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {errors.views && (
              <p className="mt-1.5 text-xs font-semibold text-red-500">
                {errors.views.message}
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
