// Extended types for the editable project card modal
export interface TeamMember {
  id: string;
  name: string;
  initials: string;
  role: MemberRole;
  email: string;
  assignedTasks: string[]; // task titles
}

export type MemberRole =
  | "Project Lead"
  | "Frontend Dev"
  | "Backend Dev"
  | "Full Stack Dev"
  | "DevOps Engineer"
  | "QA Engineer"
  | "UI/UX Designer"
  | "Data Scientist"
  | "Mobile Dev";

export interface EditableProjectData {
  name: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  techStack: string[];
  teamName: string;
  progress: number;
  members: TeamMember[];
}

export const MEMBER_ROLES: MemberRole[] = [
  "Project Lead",
  "Frontend Dev",
  "Backend Dev",
  "Full Stack Dev",
  "DevOps Engineer",
  "QA Engineer",
  "UI/UX Designer",
  "Data Scientist",
  "Mobile Dev",
];

export const ALL_CATEGORIES = [
  "Frontend",
  "Backend",
  "Cloud & DevOps",
  "Cybersecurity",
  "AI & Data",
  "Mobile",
  "Full Stack",
];

export const ALL_STATUSES = [
  "Planning",
  "In Progress",
  "Review",
  "On Hold",
  "Completed",
];

export const ALL_PRIORITIES = ["High", "Medium", "Low"];

export const SUGGESTED_DEVS: Omit<TeamMember, "role" | "assignedTasks">[] = [
  { id: "dev-1", name: "Ellen Grace Sinday", initials: "ES", email: "ellen@company.com" },
  { id: "dev-2", name: "Aj Lopez", initials: "AJ", email: "aj@company.com" },
  { id: "dev-3", name: "John Doe", initials: "JD", email: "john@company.com" },
  { id: "dev-4", name: "Maria Santos", initials: "MS", email: "maria@company.com" },
  { id: "dev-5", name: "Carlos Rivera", initials: "CR", email: "carlos@company.com" },
  { id: "dev-6", name: "Sam Kim", initials: "SK", email: "sam@company.com" },
];

export const SUGGESTED_TECH = [
  "Next.js", "React", "TypeScript", "JavaScript", "TailwindCSS",
  "Node.js", "Express", "FastAPI", "Python", "Django",
  "PostgreSQL", "MySQL", "MongoDB", "Redis", "Prisma", "Drizzle",
  "Docker", "Kubernetes", "AWS", "GCP", "Azure",
  "GraphQL", "REST", "tRPC", "Clerk", "Supabase",
  "OpenAI", "VectorDB", "TensorFlow", "Vue.js", "Svelte",
];
