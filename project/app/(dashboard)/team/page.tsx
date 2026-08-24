<<<<<<< HEAD
import { getProjectsAction } from "@/actions/project-actions";
import { TeamPageClient } from "@/components/team/team-page-client";

export default async function TeamPage() {
  const projects = await getProjectsAction();
  const projectOptions = projects.map(
    (p: { id: string; name: string; ownerName: string; description: string | null }) => ({
      id: p.id,
      name: p.name,
      ownerName: p.ownerName,
      description: p.description ?? null,
    }),
  );

  return (
    <div className="overflow-y-auto h-full p-4 sm:p-6 lg:p-8">
      <TeamPageClient projectOptions={projectOptions} />
    </div>
=======
"use client";

import { CreateTeamModal } from "@/components/team/create-team-modal";
import { type InviteMemberData, InviteMemberModal } from "@/components/team/invite-member-modal";
import { MemberProfilePanel } from "@/components/team/member-profile-panel";
import { PeopleGrid } from "@/components/team/people-grid";
import { PeopleTable } from "@/components/team/people-table";
import { PeopleToolbar } from "@/components/team/people-toolbar";
import { AllTeamsTab } from "@/components/team/tabs/all-teams-tab";
import { AnalyticsTab } from "@/components/team/tabs/analytics-tab";
import { MyTeamsTab } from "@/components/team/tabs/my-teams-tab";
import { TeamLanding } from "@/components/team/team-landing-page";
import { type TeamTab, TeamTabsBar } from "@/components/team/team-tabs-bar";
import { MOCK_PEOPLE, type Team, type TeamMember } from "@/lib/team-data";
import type { CreateTeamFormValues } from "@/lib/team-schemas";
import { useMemo, useState } from "react";

export default function TeamPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [people, setPeople] = useState<TeamMember[]>(MOCK_PEOPLE);
  const [showLanding, setShowLanding] = useState(true);
  const [activeTab, setActiveTab] = useState<TeamTab>("all-people");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [statusFilter, setStatusFilter] = useState<"All" | "Online" | "Away" | "Offline">("All");
  const [sortBy, setSortBy] = useState<"name-asc" | "name-desc" | "role">("name-asc");
  const [accountType, setAccountType] = useState<"All" | "Admin" | "Member">("All");
  const [search, setSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  const membersToShow = useMemo(() => {
    let result = people;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q),
      );
    }

    if (statusFilter !== "All") {
      result = result.filter((m) => m.status === statusFilter);
    }

    if (accountType !== "All") {
      result = result.filter((m) => m.accountType === accountType);
    }

    result = [...result].sort((a, b) => {
      if (sortBy === "name-asc") return a.name.localeCompare(b.name);
      if (sortBy === "name-desc") return b.name.localeCompare(a.name);
      return a.role.localeCompare(b.role);
    });

    return result;
  }, [people, search, statusFilter, accountType, sortBy]);

  const handleCreateTeam = (data: CreateTeamFormValues) => {
    const newTeam: Team = {
      id: crypto.randomUUID(),
      name: data.name,
      description: data.description || undefined,
      members: people,
    };
    setTeams((prev) => [...prev, newTeam]);
    setCreateModalOpen(false);
    setShowLanding(false);
    setActiveTab("all-teams");
  };

  const handleBrowsePeople = () => {
    setShowLanding(false);
    setActiveTab("all-people");
  };

  const handleOpenCreateTeam = () => {
    setCreateModalOpen(true);
  };

  const handleInviteMember = (data: InviteMemberData) => {
    const name = data.email
      .split("@")[0]
      .replace(/[._]/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

    const newMember: TeamMember = {
      id: crypto.randomUUID(),
      name,
      email: data.email,
      role: data.role === "Admin" ? "Workspace Admin" : "Team Member",
      status: "Offline",
      accountType: data.role,
      projectCount: 0,
    };

    setPeople((prev) => [...prev, newMember]);
    setActiveTab("all-people");
  };

  return (
    <>
      {/* Landing — shown by default on first visit, hidden once user navigates into a tab */}
      {showLanding ? (
        <TeamLanding onBrowsePeople={handleBrowsePeople} onCreateTeam={handleOpenCreateTeam} />
      ) : (
        <>
          <div className="-mx-4 -mt-4 sm:-mx-6 sm:-mt-6 lg:-mx-8 lg:-mt-8">
            <TeamTabsBar
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onInviteClick={() => setInviteModalOpen(true)}
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
>>>>>>> 4016eb6 (Fixed and Initial ui for the system)
  );
}
