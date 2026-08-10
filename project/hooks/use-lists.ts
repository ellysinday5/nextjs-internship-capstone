"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getListsAction,
  createListAction,
  updateListAction,
  reorderListsAction,
  deleteListAction,
} from "@/app/actions/list-actions";
import type { CreateListFormValues, UpdateListFormValues, ReorderListsFormValues } from "@/lib/list-schemas";

export function useLists(projectId: string) {
  const queryClient = useQueryClient();
  const queryKey = ["lists", projectId];

  const listsQuery = useQuery({ queryKey, queryFn: () => getListsAction(projectId), enabled: !!projectId });

  const createMutation = useMutation({
    mutationFn: (data: CreateListFormValues) => createListAction(data),
    onSuccess: (result) => result.success && queryClient.invalidateQueries({ queryKey }),
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateListFormValues) => updateListAction(data),
    onSuccess: (result) => result.success && queryClient.invalidateQueries({ queryKey }),
  });

  const reorderMutation = useMutation({
    mutationFn: (data: ReorderListsFormValues) => reorderListsAction(data),
    onSuccess: (result) => result.success && queryClient.invalidateQueries({ queryKey }),
  });

  const deleteMutation = useMutation({
    mutationFn: (listId: string) => deleteListAction(listId),
    onSuccess: (result) => result.success && queryClient.invalidateQueries({ queryKey }),
  });

  return {
    lists: listsQuery.data ?? [],
    isLoading: listsQuery.isLoading,
    createList: createMutation.mutateAsync,
    updateList: updateMutation.mutateAsync,
    reorderLists: reorderMutation.mutateAsync,
    deleteList: deleteMutation.mutateAsync,
  };
}