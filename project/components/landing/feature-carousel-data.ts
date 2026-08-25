import type { LucideIcon } from "lucide-react";
import { Activity, BarChart3, Calendar, Layers } from "lucide-react";

export interface Slide {
  key: string;
  label: string;
  icon: LucideIcon;
  badge: string;
  title: string;
  description: string;
}

export const FEATURE_SLIDES: Slide[] = [
  {
    key: "capacity",
    label: "Capacity",
    icon: BarChart3,
    badge: "Workspace View",
    title: "Comprehensive capacity views",
    description: "Monitor your team's workload, project timelines, and progress in one place.",
  },
  {
    key: "activity",
    label: "Activity Feed",
    icon: Activity,
    badge: "Real-time Live",
    title: "Real-time activity feed",
    description: "Stay updated with live activity across your workspace and never miss a beat.",
  },
  {
    key: "boards",
    label: "Sprint Boards",
    icon: Layers,
    badge: "Kanban & Lists",
    title: "Intuitive sprint & Kanban boards",
    description: "Organize workflows, track task statuses, and drag items smoothly across lists.",
  },
  {
    key: "schedules",
    label: "Schedules",
    icon: Calendar,
    badge: "Timeline Tracker",
    title: "Synchronized schedules & milestones",
    description: "Keep milestone deadlines and team schedules synchronized in real time.",
  },
];
