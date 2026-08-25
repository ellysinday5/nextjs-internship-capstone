export interface TeamMember {
  id: string;
  userId?: string | null;
  name: string;
  email: string;
  role: string;
  status: "Online" | "Away" | "Offline";
  accountType: "Admin" | "Member";
  avatarUrl?: string;
  projectCount: number;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  members: TeamMember[];
}

/**
 * Normalizes role text into clean, consistent Title Case for display.
 * Handles variations like 'member', 'Member', 'owner', 'Owner', 'admin', 'Admin', 'pm', 'project manager'.
 */
export function formatRole(role?: string | null): string {
  if (!role) return "Member";
  const trimmed = role.trim();
  const lower = trimmed.toLowerCase();
  if (lower === "pm" || lower === "project manager") return "Project Manager";
  if (lower === "admin") return "Admin";
  if (lower === "owner") return "Owner";
  if (lower === "member") return "Member";
  if (lower === "lead" || lower === "team lead") return "Team Lead";
  if (lower === "developer" || lower === "dev") return "Developer";
  if (lower === "designer") return "Designer";
  // Fallback: capitalize each word
  return trimmed
    .split(/\s+/)
    .map((w) => (w.length > 0 ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w))
    .join(" ");
}

// export const MOCK_PEOPLE: TeamMember[] = [
//   {
//     id: "1",
//     name: "Ellen Grace Sinday",
//     email: "ellysinday5@gmail.com",
//     role: "Full Stack Developer",
//     status: "Offline",
//     accountType: "Admin",
//     projectCount: 3,
//   },
//   {
//     id: "2",
//     name: "Aj Lopez",
//     email: "ajlopez25@gmail.com",
//     role: "Frontend Developer",
//     status: "Online",
//     accountType: "Member",
//     projectCount: 2,
//   },
// ]

export interface TeamMember {
  id: string;
  userId: string | null;
  name: string;
  email: string;
  role: string;
  status: "Online" | "Away" | "Offline";
  accountType: "Admin" | "Member";
  avatarUrl?: string;
  projectCount: number;
}
