export type ProjectCardStatus = "active" | "completed" | "on-hold";

export interface ProjectCardData {
  id: string;
  name: string;
  description?: string;
  progress: number;
  memberCount: number;
  dueDate?: Date;
  status: ProjectCardStatus;
<<<<<<< HEAD
  accentColor?: string;
  isFavorite?: boolean;
  iconIndex?: number;
=======
>>>>>>> 4016eb6 (Fixed and Initial ui for the system)
}
