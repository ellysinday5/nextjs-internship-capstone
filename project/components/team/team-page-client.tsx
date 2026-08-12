"use client"

import { useState, useMemo } from "react"
import { TeamTabsBar, type TeamTab } from "@/components/team/team-tabs-bar"
import { PeopleToolbar } from "@/components/team/people-toolbar"
import { PeopleTable } from "@/components/team/people-table"
import { PeopleGrid } from "@/components/team/people-grid"
import { MemberProfilePanel } from "@/components/team/member-profile-panel"
import { CreateTeamModal } from "@/components/modals/create-team-modal"
import { InviteMemberModal, type InviteMemberData } from "@/components/modals/invite-member-modal"
import { AllTeamsTab } from "@/components/team/tabs/all-teams-tab"
import { AnalyticsTab } from "@/components/team/tabs/analytics-tab"
import { MyTeamsTab } from "@/components/team/tabs/my-teams-tab"
import { TeamLanding } from "@/components/team/team-landing-page"
import { MOCK_PEOPLE, type Team, type TeamMember } from "@/lib/team-data"
import type { CreateTeamFormValues } from "@/lib/db/team-schemas"
import { inviteTeamMember } from "@/actions/invite-actions";
import { PendingInvitesList } from "@/components/team/pending-invites-list"
import { sileo } from "@/utils/alerts"

interface ProjectOption {
  id: string
  name: string
}

interface TeamPageClientProps {
  projectOptions: ProjectOption[]
}

export function TeamPageClient({ projectOptions }: TeamPageClientProps) {
  const [teams, setTeams] = useState<Team[]>([])
  const [people, setPeople] = useState<TeamMember[]>(MOCK_PEOPLE)
  const [showLanding, setShowLanding] = useState(true)
  const [activeTab, setActiveTab] = useState<TeamTab>("all-people")
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [statusFilter, setStatusFilter] = useState<"All" | "Online" | "Away" | "Offline">("All")
  const [sortBy, setSortBy] = useState<"name-asc" | "name-desc" | "role">("name-asc")
  const [accountType, setAccountType] = useState<"All" | "Admin" | "Member">("All")
  const [search, setSearch] = useState("")
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    projectOptions[0]?.id ?? ""
  )
  const [inviteRefreshKey, setInviteRefreshKey] = useState(0)

  const membersToShow = useMemo(() => {
    let result = people

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)
      )
    }

    if (statusFilter !== "All") {
      result = result.filter((m) => m.status === statusFilter)
    }

    if (accountType !== "All") {
      result = result.filter((m) => m.accountType === accountType)
    }

    result = [...result].sort((a, b) => {
      if (sortBy === "name-asc") return a.name.localeCompare(b.name)
      if (sortBy === "name-desc") return b.name.localeCompare(a.name)
      return a.role.localeCompare(b.role)
    })

    return result
  }, [people, search, statusFilter, accountType, sortBy])

  const handleCreateTeam = (data: CreateTeamFormValues) => {
    const newTeam: Team = {
      id: crypto.randomUUID(),
      name: data.name,
      description: data.description || undefined,
      members: people,
    }
    setTeams((prev) => [...prev, newTeam])
    setCreateModalOpen(false)
    setShowLanding(false)
    setActiveTab("all-teams")
  }

  const handleBrowsePeople = () => {
    setShowLanding(false)
    setActiveTab("all-people")
  }

  const handleOpenCreateTeam = () => {
    setCreateModalOpen(true)
  }

  const handleInviteMember = (data: InviteMemberData) => {
    // Update local/mock state immediately so the UI feels instant
    const name = data.email
      .split("@")[0]
      .replace(/[._]/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase())

    const newMember: TeamMember = {
      id: crypto.randomUUID(),
      name,
      email: data.email,
      role: data.role === "Admin" ? "Workspace Admin" : "Team Member",
      status: "Offline",
      accountType: data.role,
      projectCount: 0,
    }

    setPeople((prev) => [...prev, newMember])
    setActiveTab("all-people")

    if (!selectedProjectId) {
      sileo.error("No project selected — invite email was not sent.", "Missing Project")
      return
    }

    inviteTeamMember(selectedProjectId, data.email).then((result: { success: boolean; error?: string }) => {
      if (!result.success) {
        sileo.error(result.error ?? "Failed to send invite email.", "Invite Failed")
      } else {
        setInviteRefreshKey((k) => k + 1)
      }
    })
  }

  return (
    <>
      {showLanding ? (
        <TeamLanding
          onBrowsePeople={handleBrowsePeople}
          onCreateTeam={handleOpenCreateTeam}
        />
      ) : (
        <>
          <div className="border-b border-slate-200 dark:border-slate-800 -mx-4 sm:-mx-6 lg:-mx-8">
            <TeamTabsBar
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onInviteClick={() => setInviteModalOpen(true)}
            />
          </div>

          {/* Project selector — determines which project new invites are tied to */}
          <div className="flex items-center gap-2 pt-4">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Inviting to project:
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="rounded-lg border-2 border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-[#142843] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              {projectOptions.length === 0 && <option value="">No projects found</option>}
              {projectOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-3">
            <PendingInvitesList
              projectId={selectedProjectId}
              refreshKey={inviteRefreshKey}
            />
          </div>

          {activeTab === "all-people" && (
            <div className="space-y-4 pt-4">
              <PeopleToolbar
                search={search}
                onSearchChange={setSearch}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                sortBy={sortBy}
                onSortChange={setSortBy}
                accountType={accountType}
                onAccountTypeChange={setAccountType}
              />

              {viewMode === "list" ? (
                <PeopleTable members={membersToShow} onSelectMember={setSelectedMember} />
              ) : (
                <PeopleGrid
                  members={membersToShow}
                  selectedId={selectedMember?.id}
                  onSelectMember={setSelectedMember}
                />
              )}
            </div>
          )}

          {activeTab === "all-teams" && (
            <div className="pt-4">
              {teams.length === 0 ? (
                <TeamLanding
                  onBrowsePeople={handleBrowsePeople}
                  onCreateTeam={handleOpenCreateTeam}
                />
              ) : (
                <AllTeamsTab teams={teams} onCreateTeam={handleOpenCreateTeam} />
              )}
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="pt-4">
              <AnalyticsTab members={people} teams={teams} />
            </div>
          )}

          {activeTab === "my-teams" && (
            <div className="pt-4">
              <MyTeamsTab teams={teams} />
            </div>
          )}

          <MemberProfilePanel member={selectedMember} onClose={() => setSelectedMember(null)} />
        </>
      )}

      <CreateTeamModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreate={handleCreateTeam}
      />

      <InviteMemberModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        onInvite={handleInviteMember}
      />
    </>
  )
}