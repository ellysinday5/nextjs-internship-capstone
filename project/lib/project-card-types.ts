export type ProjectCardStatus = "active" | "completed" | "on-hold";

export interface ProjectCardData {
  id: string;
  name: string;
  description?: string;
  progress: number;
  memberCount: number;
  dueDate?: Date;
  status: ProjectCardStatus;
  accentColor?: string;
  isFavorite?: boolean;
  iconIndex?: number;
  /** Whether the project is publicly visible to all workspace members */
  isPublic?: boolean;
}
