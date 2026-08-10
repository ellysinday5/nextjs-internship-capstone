import type { ListWithTasks } from "@/app/actions/list-actions";
import type { TaskRecord } from "@/app/actions/task-actions";
import type { Section } from "@/components/projects/details/types";
import type { TaskItem } from "@/components/tasks/task-details";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((p) => p.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatDueDate(date: Date | null): string | undefined {
  if (!date) return undefined;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(date));
}

function taskRecordToTaskItem(task: TaskRecord, sectionTitle: string): TaskItem {
  return {
    id: task.id,
    title: task.title,
    assignee: task.assignee ? { name: task.assignee.name, initials: getInitials(task.assignee.name) } : undefined,
    dueDate: formatDueDate(task.dueDate),
    priority: (task.priority as TaskItem["priority"]) ?? undefined,
    status: (task.status as TaskItem["status"]) ?? undefined,
    description: task.description ?? undefined,
    subtasks: [], // not yet backed by the DB — local-only for now
    sectionId: sectionTitle,
  };
}

export function buildSectionsFromBoard(lists: ListWithTasks[], tasks: TaskRecord[]): Section[] {
  return [...lists]
    .sort((a, b) => a.position - b.position)
    .map((list) => ({
      id: list.id,
      title: list.name,
      tasks: tasks
        .filter((t) => t.listId === list.id)
        .sort((a, b) => a.position - b.position)
        .map((t) => taskRecordToTaskItem(t, list.name)),
    }));
}