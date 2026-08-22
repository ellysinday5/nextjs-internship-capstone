/**
 * Shared project icon list — used in both the project header customizer
 * and the project card display on the projects listing page.
 */
import {
  Bug,
  Calendar,
  Columns,
  Globe,
  Kanban,
  Lightbulb,
  ListTodo,
  type LucideIcon,
  Rocket,
  Settings,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";

export const PROJECT_ICON_LIST: { id: string; Icon: LucideIcon }[] = [
  { id: "list", Icon: ListTodo },
  { id: "kanban", Icon: Kanban },
  { id: "columns", Icon: Columns },
  { id: "calendar", Icon: Calendar },
  { id: "rocket", Icon: Rocket },
  { id: "users", Icon: Users },
  { id: "trending", Icon: TrendingUp },
  { id: "star", Icon: Star },
  { id: "bug", Icon: Bug },
  { id: "lightbulb", Icon: Lightbulb },
  { id: "globe", Icon: Globe },
  { id: "settings", Icon: Settings },
];

/* ── localStorage helpers ─────────────────────────────────────────────── */

const LS_KEY = "syntraflow_project_meta";

export interface ProjectMeta {
  color: string;
  iconIndex: number;
  isFavorite: boolean;
  views?: string[];
}

export function loadProjectMeta(projectId: string): ProjectMeta | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const all = JSON.parse(raw) as Record<string, ProjectMeta>;
    return all[projectId] ?? null;
  } catch {
    return null;
  }
}

export function saveProjectMeta(projectId: string, meta: Partial<ProjectMeta>): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(LS_KEY);
    const all: Record<string, ProjectMeta> = raw ? JSON.parse(raw) : {};
    all[projectId] = {
      ...(all[projectId] ?? { color: "#3b82f6", iconIndex: 0, isFavorite: false }),
      ...meta,
    };
    localStorage.setItem(LS_KEY, JSON.stringify(all));
  } catch {}
}

export function loadAllProjectMeta(): Record<string, ProjectMeta> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
