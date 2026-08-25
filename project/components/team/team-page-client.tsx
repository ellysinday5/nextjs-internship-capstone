"use client";

import { createTeamWithMembersAction, inviteTeamMember } from "@/actions/invite-member";
import { getProjectMembersAction, getProjectPermissionsAction } from "@/actions/member-actions";
import { type CreateTeamData, CreateTeamModal } from "@/components/modals/create-team-modal";
import { type InviteMemberData, InviteMemberModal } from "@/components/modals/invite-member-modal";
import { MemberProfilePanel } from "@/components/team/member-profile-panel";
import { PendingInvitesList } from "@/components/team/pending-invites-list";
import { PeopleGrid } from "@/components/team/people-grid";
import { PeopleGridSkeleton, PeopleTableSkeleton } from "@/components/team/people-skeleton";
import { PeopleTable } from "@/components/team/people-table";
import { PeopleToolbar } from "@/components/team/people-toolbar";
import { MyInvitesTab } from "@/components/team/tabs/my-invites-tab";
import { TeamLanding } from "@/components/team/team-landing-page";
import { type TeamTab, TeamTabsBar } from "@/components/team/team-tabs-bar";
import { getCachedCount, setCachedCount } from "@/lib/skeleton-cache";
import type { TeamMember } from "@/lib/team-data";
import { sileo } from "@/utils/alerts";
import { useUser } from "@clerk/nextjs";
import { FolderKanban, Plus, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

interface ProjectOption {
  id: string;
  name: string;
  ownerName: string;
  description: string | null;
}

interface TeamPageClientProps {
  projectOptions: ProjectOption[];
}

export function TeamPageClient({ projectOptions }: TeamPageClientProps) {
  const { user } = useUser();
  const userId = user?.id;
  const router = useRouter();

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

  // Default state: no project selected yet (shows clear prompt state)
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [inviteRefreshKey, setInviteRefreshKey] = useState(0);
  const [canInvite, setCanInvite] = useState(false);
  const [skeletonCount, setSkeletonCount] = useState(4);

  const selectedProject = useMemo(() => {
    return projectOptions.find((p) => p.id === selectedProjectId) ?? null;
  }, [projectOptions, selectedProjectId]);

  useEffect(() => {
    if (!selectedProjectId) {
      setCanInvite(false);
      return;
    }
    setSkeletonCount(
      getCachedCount("team_members", `${userId || "anon"}:${selectedProjectId}`, 4),
    );
    getProjectPermissionsAction(selectedProjectId).then((perm) => {
      setCanInvite(perm.canManageMembers);
    });
  }, [selectedProjectId, userId]);

  // Real, DB-backed members for the currently selected project
  const [people, setPeople] = useState<TeamMember[]>([]);
  const [loadingPeople, setLoadingPeople] = useState(false);

  useEffect(() => {
    if (!selectedProjectId) {
      setPeople([]);
      return;
    }

    let cancelled = false;
    setLoadingPeople(true);

    getProjectMembersAction(selectedProjectId)
      .then((result) => {
        if (!cancelled) {
          setPeople(result);
          if (result.length > 0) {
            setCachedCount(
              "team_members",
              `${userId || "anon"}:${selectedProjectId}`,
              result.length,
            );
            setSkeletonCount(result.length);
          }
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingPeople(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedProjectId, userId]);

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

  const handleCreateTeam = async (data: CreateTeamData) => {
    try {
      const res = await createTeamWithMembersAction({
        name: data.name,
        description: data.description || undefined,
        invites: data.invites || [],
      });

      if (!res.success) {
        sileo.error(res.error || "Failed to create team.", "Create Failed");
        return;
      }

      sileo.success(
        `Team "${data.name}" created with ${data.invites?.length || 0} initial member invite${(data.invites?.length || 0) === 1 ? "" : "s"}!`,
        "Team Created",
      );
      setCreateModalOpen(false);
      setShowLanding(false);
      router.refresh();
      if (res.project?.id) {
        setSelectedProjectId(res.project.id);
      }
    } catch (err: any) {
      sileo.error(err?.message || "Failed to create team.", "Error");
    }
  };

  const handleBrowsePeople = () => {
    setShowLanding(false);
    setActiveTab("all-people");
  };

  const handleOpenCreateTeam = () => {
    setCreateModalOpen(true);
  };

  const handleInviteClick = () => {
    if (!selectedProjectId) {
      sileo.info("Please select a project first to invite members.", "Select Project");
      return;
    }
    setInviteModalOpen(true);
  };

  const handleInviteMember = (data: InviteMemberData) => {
    if (!selectedProjectId) {
      sileo.error("No project selected — invite email was not sent.", "Missing Project");
      return;
    }

    inviteTeamMember(selectedProjectId, data.email, data.role.toLowerCase()).then(
      (result: { success: boolean; error?: string }) => {
        if (!result.success) {
          sileo.error(result.error ?? "Failed to send invite email.", "Invite Failed");
        } else {
          sileo.success(`Invitation sent to ${data.email} via Clerk!`, "Invite Sent");
          setInviteRefreshKey((k) => k + 1);
          getProjectMembersAction(selectedProjectId).then(setPeople);
        }
      },
    );

    setActiveTab("all-people");
  };

  return (
    <>
      {showLanding ? (
        <TeamLanding onBrowsePeople={handleBrowsePeople} onCreateTeam={handleOpenCreateTeam} />
      ) : (
        <>
          <div className="border-b border-slate-200 dark:border-slate-800 -mx-4 sm:-mx-6 lg:-mx-8 -mt-4 sm:-mt-6 lg:-mt-8">
            <TeamTabsBar
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onInviteClick={handleInviteClick}
              canInvite={canInvite}
            />
          </div>

          {/* My Invites Tab */}
          {activeTab === "my-invites" && (
            <div className="pt-4">
              <MyInvitesTab
                onInviteHandled={() => {
                  setInviteRefreshKey((k) => k + 1);
                  if (selectedProjectId) {
                    getProjectMembersAction(selectedProjectId).then(setPeople);
                  }
                }}
              />
            </div>
          )}

          {/* All People Tab (Project-Scoped) */}
          {activeTab === "all-people" && (
            <div className="space-y-4 pt-4">
              {/* Project Selector Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/50 text-[#0033a0] dark:text-blue-400 font-bold">
                    <FolderKanban size={20} />
                  </div>
                  <div>
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                      Active Workspace Project
                    </label>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                      {selectedProject ? selectedProject.name : "Select a project to view its team"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="w-full sm:w-auto rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-[#0033a0]/30 focus:border-[#0033a0] transition-colors"
                  >
                    <option value="">-- Choose a project --</option>
                    {projectOptions.map((proj) => (
                      <option key={proj.id} value={proj.id}>
                        {proj.name} ({proj.ownerName || "Owner"})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* State 1: No project selected yet */}
              {!selectedProjectId ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 px-6 py-16 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#0033a0] dark:bg-blue-950/50 dark:text-blue-400">
                    <FolderKanban size={28} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Select a project to see its members
                  </h3>
                  <p className="mt-1.5 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                    {projectOptions.length > 0
                      ? "Choose a project from the dropdown above to view, filter, and collaborate with its team members."
                      : "No projects found in this workspace yet. Create a project to start collaborating with your team."}
                  </p>

                  {projectOptions.length === 0 && (
                    <Link
                      href="/projects/create"
                      className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-[#0033a0] hover:bg-[#00277a] px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors"
                    >
                      <Plus size={14} />
                      Create Project
                    </Link>
                  )}
                </div>
              ) : (
                /* State 2: Project selected -> Show pending invites + toolbar + member list */
                <>
                  <PendingInvitesList
                    projectId={selectedProjectId}
                    refreshKey={inviteRefreshKey}
                  />

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
                    viewMode === "list" ? (
                      <PeopleTableSkeleton count={skeletonCount} />
                    ) : (
                      <PeopleGridSkeleton count={skeletonCount} />
                    )
                  ) : viewMode === "list" ? (
                    <PeopleTable members={membersToShow} onSelectMember={setSelectedMember} />
                  ) : (
                    <PeopleGrid
                      members={membersToShow}
                      selectedId={selectedMember?.id}
                      onSelectMember={setSelectedMember}
                    />
                  )}
                </>
              )}
            </div>
          )}

          <MemberProfilePanel
            member={selectedMember}
            allMembers={people}
            onSelectMember={setSelectedMember}
            projectId={selectedProjectId}
            projectOwnerName={selectedProject?.ownerName ?? ""}
            projectDescription={selectedProject?.description ?? null}
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
        projectName={selectedProject?.name ?? ""}
        projectDescription={selectedProject?.description ?? null}
      />
    </>
  );
}
