"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProjectCardItem } from "./project-card-item";
import { ConfirmationModal } from "@/components/modals/ConfirmationModal";
import type { ProjectItem } from "@/lib/project-data";
import type { ProjectCardData, ProjectCardStatus } from "@/lib/project-card-types";
import { deleteProjectAction } from "@/app/actions/project-actions";

interface ProjectCardProps {
  project: ProjectItem;
  onEditLocal?: (project: ProjectItem) => void;
  onProjectDeleted?: (projectId: string) => void;
}

export function ProjectCard({ project, onEditLocal, onProjectDeleted }: ProjectCardProps) {
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const cardData: ProjectCardData = {
    id: project.id,
    name: project.name,
    description: project.description,
    progress: project.progress,
    memberCount: project.members,
    dueDate: project.dbProject?.dueDate ?? undefined,
    status: mapStatus(project.status),
  };

  function handleEdit(id: string) {
    if (project.isDb) {
      router.push(`/projects/${id}/edit`);
    } else {
      onEditLocal?.(project);
    }
  }

  function handleDelete(id: string) {
    setDeleteError(null);
    setShowDeleteConfirm(true);
  }

  async function confirmDelete() {
    if (!project.dbProject) {
      // local/mock card — no server action, let parent handle local removal
      setShowDeleteConfirm(false);
      onProjectDeleted?.(project.id);
      return;
    }

    setIsDeleting(true);
    const result = await deleteProjectAction(project.dbProject.id);
    setIsDeleting(false);

    if (!result.success) {
      setDeleteError(result.error ?? "Failed to delete project.");
      return;
    }

    setShowDeleteConfirm(false);
    onProjectDeleted?.(project.dbProject.id);
  }

  return (
    <>
      <ProjectCardItem project={cardData} onEdit={handleEdit} onDelete={handleDelete} />

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        variant="delete"
        title={`Delete "${project.name}"?`}
        description="This will permanently remove the project and all its lists, tasks, and comments. This action can't be undone."
        isLoading={isDeleting}
      />

      {deleteError && (
        <p className="mt-2 text-xs font-medium text-red-500">{deleteError}</p>
      )}
    </>
  );
}

function mapStatus(status: string): ProjectCardStatus {
  if (status === "Completed") return "completed";
  if (status === "On Hold") return "on-hold";
  return "active"; // covers "In Progress", "Review", "Planning"
}