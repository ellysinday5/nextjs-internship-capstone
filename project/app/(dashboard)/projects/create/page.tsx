"use client";

import { createProjectAction } from "@/actions/project-actions";
import { ConfirmationModal } from "@/components/modals/ConfirmationModal";
import { ProjectPreview } from "@/components/projects/create-project/project-preview";
import { StepOneForm } from "@/components/projects/create-project/step-one-form";
import { StepTwoViews } from "@/components/projects/create-project/step-two-views";
import type { CreateProjectFormValues, ViewId } from "@/components/projects/create-project/types";
import { BackButton } from "@/components/ui/back-button";
import { saveProjectMeta } from "@/lib/project-meta";
import { sileo } from "@/utils/alerts";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function CreateProjectPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  const [formData, setFormData] = useState<CreateProjectFormValues>({
    name: "",
    access: "private",
    shareWith: [],
    description: "",
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    techStack: ["Next.js", "TypeScript", "TailwindCSS"],
    selectedViews: ["list", "board", "timeline", "dashboard"],
    activePreviewTab: "list",
  });

  const isDirty =
    formData.name.trim().length > 0 ||
    formData.description.trim().length > 0 ||
    formData.shareWith.length > 0;

  const handleCloseAttempt = () => {
    if (isDirty) {
      setShowDiscardConfirm(true);
    } else {
      router.push("/projects");
    }
  };

  const handleConfirmDiscard = () => {
    setShowDiscardConfirm(false);
    router.push("/projects");
  };

  const handleBackToStepOne = () => {
    setStep(1);
  };

  const handleStepOneContinue = () => {
    setStep(2);
  };

  const handleSelectPreviewTab = (tab: ViewId) => {
    setFormData((prev) => ({ ...prev, activePreviewTab: tab }));
  };

  const handleCreateProject = async () => {
    if (!formData.name.trim()) {
      sileo.error("Project name is required", "Error");
      setStep(1);
      return;
    }

    setIsSubmitting(true);
    setServerError(null);

    const description =
      formData.description.trim() ||
      (formData.shareWith.length > 0
        ? `Project shared with: ${formData.shareWith.join(", ")}`
        : "");

    const res = await createProjectAction({
      name: formData.name.trim(),
      description,
      categories: ["Frontend"],
      techStack: formData.techStack.length > 0 ? formData.techStack : ["Next.js", "TypeScript"],
      status: "In Progress",
      priority: "Medium",
      dueDate: formData.dueDate || undefined,
      members: [],
    });

    setIsSubmitting(false);

    if (res.success) {
      if (res.project?.id) {
        const capitalizedViews = formData.selectedViews.map(
          (v) => v.charAt(0).toUpperCase() + v.slice(1),
        );
        const viewsToSave = [
          "Overview",
          ...capitalizedViews.filter((v) => v.toLowerCase() !== "overview"),
        ];
        saveProjectMeta(res.project.id, { views: viewsToSave });
      }
      sileo.success(`Project "${formData.name}" created successfully!`, "Project Created");
      router.push("/projects");
      router.refresh();
    } else {
      setServerError(res.error || "Failed to create project");
      sileo.error(res.error || "Failed to create project", "Error");
    }
  };

  return (
    <div className="overflow-y-auto h-full">
      <div className="relative h-full w-full rounded-2xl bg-white shadow-xs border border-slate-200/80 dark:border-slate-800 dark:bg-slate-950 flex flex-col overflow-hidden">
        {/* Top Navigation Control Bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <BackButton
            onClick={step === 2 ? handleBackToStepOne : handleCloseAttempt}
            title={step === 2 ? "Back to step 1" : "Cancel & back to projects"}
          />

          <button
            type="button"
            onClick={handleCloseAttempt}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {serverError && (
          <div className="mx-6 mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-600 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400 shrink-0">
            {serverError}
          </div>
        )}

        {/* Main 2-Column Split Layout — fills remaining height */}
        <div className="grid grid-cols-1 gap-0 lg:grid-cols-12 flex-1 min-h-0">
          {/* Left Column: Interactive Form Steps */}
          <div className="lg:col-span-5 flex flex-col min-h-0 border-r border-slate-100 dark:border-slate-800 px-6 py-6">
            {step === 1 ? (
              <StepOneForm
                formData={formData}
                setFormData={setFormData}
                onContinue={handleStepOneContinue}
              />
            ) : (
              <StepTwoViews
                formData={formData}
                setFormData={setFormData}
                onBack={handleBackToStepOne}
                onSubmit={handleCreateProject}
                isSubmitting={isSubmitting}
              />
            )}
          </div>

          {/* Right Column: Dynamic Live Preview */}
          <div className="lg:col-span-7 min-h-0 p-6">
            <ProjectPreview formData={formData} onSelectTab={handleSelectPreviewTab} step={step} />
          </div>
        </div>

        {/* Discard Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDiscardConfirm}
          onClose={() => setShowDiscardConfirm(false)}
          onConfirm={handleConfirmDiscard}
          variant="discard"
          showCloseButton={false}
        />
      </div>
    </div>
  );
}
