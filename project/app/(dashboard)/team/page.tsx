"use client"

import { useState, useMemo } from "react"
import { TeamLanding } from "@/components/team/team-landing-page"
import { PeopleToolbar } from "@/components/team/people-toolbar"
import { PeopleTable } from "@/components/team/people-table"
import { PeopleGrid } from "@/components/team/people-grid"
import { MemberProfilePanel } from "@/components/team/member-profile-panel"
import { CreateTeamModal } from "@/components/team/create-team-modal"
import { MOCK_PEOPLE, type Team, type TeamMember } from "@/lib/team-data"
import type { CreateTeamFormValues } from "@/lib/team-schemas"

type TeamView = "landing" | "people"

export default function TeamPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [view, setView] = useState<TeamView>("landing")
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [search, setSearch] = useState("")
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [createModalOpen, setCreateModalOpen] = useState(false)

  const peopleSource: TeamMember[] = MOCK_PEOPLE

  const membersToShow = useMemo(() => {
    if (!search.trim()) return peopleSource
    const q = search.toLowerCase()
    return peopleSource.filter(
      (m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)
    )
  }, [peopleSource, search])

  const handleCreateTeam = (data: CreateTeamFormValues) => {
    const newTeam: Team = {
      id: crypto.randomUUID(),
      name: data.name,
      description: data.description || undefined,
      members: MOCK_PEOPLE, // seed with mock people for now
    }
    setTeams((prev) => [...prev, newTeam])
    setCreateModalOpen(false)
    setView("people")
  }

  return (
    <div className="space-y-6">
      {view === "landing" && (
        <TeamLanding
          onBrowsePeople={() => setView("people")}
          onCreateTeam={() => setCreateModalOpen(true)}
        />
      )}

      {view === "people" && (
        <div className="space-y-4">
          <PeopleToolbar
            search={search}
            onSearchChange={setSearch}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
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

      <MemberProfilePanel member={selectedMember} onClose={() => setSelectedMember(null)} />

      <CreateTeamModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreate={handleCreateTeam}
      />
    </div>
  )
}