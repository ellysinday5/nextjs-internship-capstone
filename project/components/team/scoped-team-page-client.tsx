"use client";

import {
  ArrowLeft,
  Building2,
  Clock,
  FolderKanban,
  Search,
  Shield,
  UserPlus,
  Users,
} from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect, useMemo, useCallback } from "react";

import { inviteTeamMember } from "@/actions/invite-member";
import { getProjectMembersAction, getProjectPermissionsAction } from "@/actions/member-actions";
import type { ProjectWithStats } from "@/actions/project-actions";
import { type InviteMemberData, InviteMemberModal } from "@/components/modals/invite-member-modal";
import { MemberProfilePanel } from "@/components/team/member-profile-panel";
import { PendingInvitesList } from "@/components/team/pending-invites-list";
import { PeopleGrid } from "@/components/team/people-grid";
import { PeopleTable } from "@/components/team/people-table";
import { PeopleToolbar } from "@/components/team/people-toolbar";
import type { TeamMember } from "@/lib/team-data";
import { sileo } from "@/utils/alerts";

interface ScopedTeamPageClientProps {
  project: ProjectWithStats;
}

export function ScopedTeamPageClient({ project }: ScopedTeamPageClientProps) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteRefreshKey, setInviteRefreshKey] = useState(0);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [canInvite, setCanInvite] = useState(false);

  useEffect(() => {
    getProjectPermissionsAction(project.id).then((perm) => {
      setCanInvite(perm.canManageMembers);
    });
  }, [project.id]);

  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [statusFilter, setStatusFilter] = useState<"All" | "Online" | "Away" | "Offline">("All");
  const [sortBy, setSortBy] = useState<"name-asc" | "name-desc" | "role">("name-asc");
  const [accountType, setAccountType] = useState<"All" | "Admin" | "Member">("All");

  const loadMembers = useCallback(async () => {
    setLoadingMembers(true);
    const data = await getProjectMembersAction(project.id);
    setMembers(data);
    setLoadingMembers(false);
  }, [project.id]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const handleInviteMember = async (data: InviteMemberData) => {
    const res = await inviteTeamMember(project.id, data.email, data.role.toLowerCase());
    if (res.success) {
      sileo.success(`Invitation sent to ${data.email}!`, "Invite Sent");
      setInviteRefreshKey((k) => k + 1);
      await loadMembers();
      setInviteModalOpen(false);
    } else {
      sileo.error(res.error || "Failed to send invite.", "Error");
    }
  };

  const filteredMembers = useMemo(() => {
    let result = members;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.role.toLowerCase().includes(q),
      );
    }

    if (statusFilter !== "All") {
      result = result.filter((m) => m.status === statusFilter);
    }

    if (accountType !== "All") {
      result = result.filter((m) => m.accountType === accountType);
    }

    return [...result].sort((a, b) => {
      if (sortBy === "name-asc") return a.name.localeCompare(b.name);
      if (sortBy === "name-desc") return b.name.localeCompare(a.name);
      return a.role.localeCompare(b.role);
    });
  }, [members, search, statusFilter, accountType, sortBy]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[#f0f4f8] dark:bg-[#0b1728] text-slate-800 dark:text-slate-100 p-4 sm:p-6 lg:p-8 space-y-8">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3">
          <Link
            href="/team"
            className="hover:text-[#0033a0] dark:hover:text-blue-400 flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            All Teams
          </Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-white">{project.name}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#0033a0] text-white flex items-center justify-center font-bold text-xl shadow-md shadow-blue-600/20 flex-shrink-0">
              <FolderKanban className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {project.name} Team
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {project.description ||
                  "Manage project members and pending invitations for this team."}
              </p>
            </div>
          </div>

          {canInvite && (
            <button
              type="button"
              onClick={() => setInviteModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0033a0] hover:bg-[#00277a] dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <UserPlus className="w-4 h-4" />
              Invite to Project
            </button>
          )}
        </div>
      </div>

      {/* Section 1: Project Members */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Project Members</h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-[#0033a0] dark:text-blue-300">
              {members.length}
            </span>
          </div>
        </div>

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

        {loadingMembers ? (
          <div className="py-12 text-center text-xs font-medium text-slate-400">
            Loading project team members...
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="p-8 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 text-center">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {search
                ? "No members match your search filter."
                : "No members found in this project."}
            </p>
          </div>
        ) : viewMode === "list" ? (
          <PeopleTable members={filteredMembers} onSelectMember={setSelectedMember} />
        ) : (
          <PeopleGrid
            members={filteredMembers}
            selectedId={selectedMember?.id}
            onSelectMember={setSelectedMember}
          />
        )}
      </div>

      {/* Section 2: Pending Invitations for THIS project only (Owner/PM only) */}
      {canInvite && (
        <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Pending Project Invitations
            </h2>
          </div>
          <PendingInvitesList projectId={project.id} refreshKey={inviteRefreshKey} />
        </div>
      )}

      {/* Member Profile Drawer */}
      <MemberProfilePanel
        member={selectedMember}
        allMembers={members}
        onSelectMember={setSelectedMember}
        projectId={project.id}
        projectOwnerName={project.ownerName}
        projectDescription={project.description}
        onClose={() => setSelectedMember(null)}
      />

      {/* Auto-scoped Invite Modal */}
      <InviteMemberModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        onInvite={handleInviteMember}
        projectName={project.name}
        projectDescription={project.description}
      />
    </div>
  );
}
