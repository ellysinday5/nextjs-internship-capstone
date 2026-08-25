export const DEFAULT_EVENT_CATEGORIES: string[] = [
  "Project Deadline",
  "Meeting",
  "Milestone",
  "Presentation",
  "Task",
  "Development",
];

export interface CategoryItem {
  id: string;
  name: string;
  workspaceId: string;
  createdBy: string;
  createdAt: Date | null;
}
