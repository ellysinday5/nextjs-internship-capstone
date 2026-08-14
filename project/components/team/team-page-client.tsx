"use client"

import { useState, useEffect, useMemo } from "react"
import { TeamTabsBar, type TeamTab } from "@/components/team/team-tabs-bar"
import { PeopleToolbar } from "@/components/team/people-toolbar"
import { PeopleTable } from "@/components/team/people-table"
import { PeopleGrid } from "@/components/team/people-grid"
import { MemberProfilePanel } from "@/components/team/member-profile-panel"
import { CreateTeamModal } from "@/components/modals/create-team-modal"
import { InviteMemberModal, type InviteMemberData } from "@/components/modals/invite-member-modal"
import { AllTeamsTab } from "@/components/team/tabs/all-teams-tab"
import { AnalyticsTab } from "@/components/team/tabs/analytics-tab"
import { TeamLanding } from "@/components/team/team-landing-page"
import type { Team, TeamMember } from "@/lib/team-data"
import type { CreateTeamFormValues } from "@/lib/db/team-schemas"
import { inviteTeamMember } from "@/actions/invite-actions"
import { getProjectMembersAction } from "@/actions/member-actions"
import { PendingInvitesList } from "@/components/team/pending-invites-list"
import { sileo } from "@/utils/alerts"

interface ProjectOption {
  id: string
  name: string
  ownerName: string
  description: string | null
}

interface TeamPageClientProps {
  projectOptions: ProjectOption[]
}

export function TeamPageClient({ projectOptions }: TeamPageClientProps) {
  const [teams, setTeams] = useState<Team[]>([])
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

  // Real, DB-backed members for the currently selected project
  // (replaces the old MOCK_PEOPLE stub).
  const [people, setPeople] = useState<TeamMember[]>([])
  const [loadingPeople, setLoadingPeople] = useState(false)

  useEffect(() => {
    if (!selectedProjectId) {
      setPeople([])
      return
    }

    let cancelled = false
    setLoadingPeople(true)

    getProjectMembersAction(selectedProjectId)
      .then((result) => {
        if (!cancelled) setPeople(result)
      })
      .finally(() => {
        if (!cancelled) setLoadingPeople(false)
      })

    return () => {
      cancelled = true
    }
  }, [selectedProjectId])

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
    if (!selectedProjectId) {
      sileo.error("No project selected — invite email was not sent.", "Missing Project")
      return
    }

    // No optimistic mock member here anymore — a person only becomes a real
    // TeamMember (with a usable userId) once they accept the invite and a
    // projectMembers row with a linked users.id exists. We just refresh the
    // real list from the DB once the invite email is confirmed sent.
    inviteTeamMember(selectedProjectId, data.email).then((result: { success: boolean; error?: string }) => {
      if (!result.success) {
        sileo.error(result.error ?? "Failed to send invite email.", "Invite Failed")
      } else {
        setInviteRefreshKey((k) => k + 1)
        getProjectMembersAction(selectedProjectId).then(setPeople)
      }
    })

    setActiveTab("all-people")
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
          <div className="border-b border-slate-200 dark:border-slate-800 -mx-4 sm:-mx-6 lg:-mx-8 -mt-4 sm:-mt-6 lg:-mt-8">
            <TeamTabsBar
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onInviteClick={() => setInviteModalOpen(true)}
            />
          </div>

          {/* Project selector + Pending invites — visible only in the My Invites tab */}
          {activeTab === "my-invites" && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Project:
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
              <PendingInvitesList
                projectId={selectedProjectId}
                refreshKey={inviteRefreshKey}
              />
            </div>
          )}

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

              {loadingPeople ? (
                <p className="py-8 text-center text-sm text-slate-400">Loading members...</p>
              ) : viewMode === "list" ? (
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
              <AllTeamsTab teams={teams} onCreateTeam={handleOpenCreateTeam} />
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="pt-4">
              <AnalyticsTab members={people} teams={teams} />
            </div>
          )}


          <MemberProfilePanel
            member={selectedMember}
            allMembers={people}
            onSelectMember={setSelectedMember}
            projectId={selectedProjectId}
            projectOwnerName={projectOptions.find(p => p.id === selectedProjectId)?.ownerName ?? ""}
            projectDescription={projectOptions.find(p => p.id === selectedProjectId)?.description ?? null}
            onClose={() => setSelectedMember(null)}
          />
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
        projectName={projectOptions.find(p => p.id === selectedProjectId)?.name ?? ""}
        projectDescription={projectOptions.find(p => p.id === selectedProjectId)?.description ?? null}
      />
    </>
  )
}