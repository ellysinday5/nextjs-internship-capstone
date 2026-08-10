"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProjectsAction,
  createProjectAction,
  updateProjectAction,
  deleteProjectAction,
  type ProjectWithStats,
} from "@/app/actions/project-actions";
import type { CreateProjectFormValues, UpdateProjectFormValues } from "@/lib/project-schemas";

export function useProjects() {
  const queryClient = useQueryClient();
  const queryKey = ["projects"];

  const {
    data: projects,
    isLoading,
    error,
  } = useQuery<ProjectWithStats[]>({
    queryKey,
    queryFn: getProjectsAction,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateProjectFormValues) => createProjectAction(data),
    onSuccess: (result) => {
      if (result.success) queryClient.invalidateQueries({ queryKey });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<UpdateProjectFormValues, "id"> }) =>
      updateProjectAction({ id, ...data } as UpdateProjectFormValues),
    onSuccess: (result) => {
      if (result.success) queryClient.invalidateQueries({ queryKey });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (projectId: string) => deleteProjectAction(projectId),
    onSuccess: (result) => {
      if (result.success) queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    projects: projects ?? [],
    isLoading,
    error,

    createProject: createMutation.mutate,
    createProjectAsync: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.data?.success === false ? createMutation.data.error : null,

    updateProject: (id: string, data: Omit<UpdateProjectFormValues, "id">) =>
      updateMutation.mutate({ id, data }),
    updateProjectAsync: (id: string, data: Omit<UpdateProjectFormValues, "id">) =>
      updateMutation.mutateAsync({ id, data }),
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.data?.success === false ? updateMutation.data.error : null,

    deleteProject: deleteMutation.mutate,
    deleteProjectAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.data?.success === false ? deleteMutation.data.error : null,
  };
}