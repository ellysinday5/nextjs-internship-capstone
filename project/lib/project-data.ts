import { ProjectWithStats } from "@/actions/project-actions";

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  techStack: string[];
  category: string;
  status: string;
  priority: string;
  progress: number;
  members: number;
  owner: string;
  teamName: string;
  tasksCount: number;
  updatedAt: string;
  color: string;
  isDb?: boolean;
  dbProject?: ProjectWithStats;
}

/* Convert a project name to a URL-friendly slug */
export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const initialProjects: ProjectItem[] = [
  {
    id: "proj-1",
    name: "Project Title 1",
    description: "Short description of what this project is about. Replace with actual project details.",
    techStack: ["Tech A", "Tech B", "Tech C"],
    category: "Frontend",
    status: "In Progress",
    priority: "High",
    progress: 75,
    members: 5,
    owner: "Owner Name",
    teamName: "Team Name",
    tasksCount: 18,
    updatedAt: "2 hours ago",
    color: "bg-[#00b4d8]",
  },
  {
    id: "proj-2",
    name: "Project Title 2",
    description: "Short description of what this project is about. Replace with actual project details.",
    techStack: ["Tech A", "Tech B", "Tech C"],
    category: "Backend",
    status: "In Progress",
    priority: "High",
    progress: 50,
    members: 8,
    owner: "Owner Name",
    teamName: "Team Name",
    tasksCount: 24,
    updatedAt: "4 hours ago",
    color: "bg-emerald-500",
  },
  {
    id: "proj-3",
    name: "Project Title 3",
    description: "Short description of what this project is about. Replace with actual project details.",
    techStack: ["Tech A", "Tech B", "Tech C"],
    category: "AI & Data",
    status: "Review",
    priority: "Medium",
    progress: 88,
    members: 4,
    owner: "Owner Name",
    teamName: "Team Name",
    tasksCount: 12,
    updatedAt: "1 day ago",
    color: "bg-purple-500",
  },
];

export const categories = [
  "All",
  "Frontend",
  "Backend",
  "Cloud & DevOps",
  "Cybersecurity",
  "AI & Data",
  "Mobile",
];

export const statuses = ["All", "In Progress", "Review", "Planning", "Completed"];
export const priorities = ["All", "High", "Medium", "Low"];
export const owners = ["All", "Owner Name"];
export const teamsList = ["All", "Team Name"];
export const membersFilterOptions = ["All", "1 Dev", "2-4 Devs", "5+ Devs"];

