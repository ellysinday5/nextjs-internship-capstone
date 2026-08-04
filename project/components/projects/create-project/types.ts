export type ViewId =
  | "overview"
  | "list"
  | "board"
  | "timeline"
  | "dashboard"
  | "gantt"
  | "calendar"
  | "page"
  | "workload";

export interface ViewOption {
  id: ViewId;
  name: string;
  description: string;
  isRecommended?: boolean;
  isRequired?: boolean;
  iconName?: string;
}

export interface CreateProjectFormValues {
  name: string;
  access: "private" | "public" | "team";
  shareWith: string[];
  selectedViews: ViewId[];
  activePreviewTab: ViewId;
}

export const RECOMMENDED_VIEWS: ViewOption[] = [
  {
    id: "overview",
    name: "Overview",
    description: "Align on project info and resources",
    isRecommended: true,
  },
  {
    id: "list",
    name: "List",
    description: "Organize tasks in a powerful table",
    isRecommended: true,
    isRequired: true,
  },
  {
    id: "board",
    name: "Board",
    description: "Track work in a Kanban view",
    isRecommended: true,
  },
  {
    id: "timeline",
    name: "Timeline",
    description: "Schedule work over time",
    isRecommended: true,
  },
  {
    id: "dashboard",
    name: "Dashboard",
    description: "Monitor project metrics and insights",
    isRecommended: true,
  },
];

export const POPULAR_VIEWS: ViewOption[] = [
  {
    id: "gantt",
    name: "Gantt",
    description: "Track dependencies and baselines",
  },
  {
    id: "calendar",
    name: "Calendar",
    description: "Plan weekly or monthly work",
  },
  {
    id: "page",
    name: "Page",
    description: "Write meeting notes and more",
  },
  {
    id: "workload",
    name: "Workload",
    description: "See how busy your team is based on tasks and subtasks",
  },
];
