export type ProjectCardStatus = "active" | "completed" | "on-hold";

export interface ProjectCardData {
    id: string;
    name: string;
    description?: string;
    progress: number;
    memberCount: number;
    dueDate?: Date;
    status: ProjectCardStatus;
    /** Hex color set by the user in the project details header */
    accentColor?: string;
    /** Whether the project has been starred as a favorite */
    isFavorite?: boolean;
    /** Index into PROJECT_ICON_LIST; controls the icon shown on the card */
    iconIndex?: number;
}