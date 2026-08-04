export interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  status: "Online" | "Away" | "Offline"
  accountType: "Admin" | "Member"
  avatarUrl?: string
  projectCount: number
}

export interface Team {
  id: string
  name: string
  description?: string
  members: TeamMember[]
}

export const MOCK_PEOPLE: TeamMember[] = [
  {
    id: "1",
    name: "Ellen Grace Sinday",
    email: "ellysinday5@gmail.com",
    role: "Full Stack Developer",
    status: "Offline",
    accountType: "Admin",
    projectCount: 3,
  },
  {
    id: "2",
    name: "Aj Lopez",
    email: "ajlopez25@gmail.com",
    role: "Frontend Developer",
    status: "Online",
    accountType: "Member",
    projectCount: 2,
  },
]