"use client";

import { inviteTeamMember } from "@/actions/invite-member";
import { Modal } from "@/components/modals/BaseModal";
import { BackButton } from "@/components/ui/back-button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { toSlug } from "@/lib/project-data";
import { PROJECT_ICON_LIST } from "@/lib/project-meta";
import { sileo } from "@/utils/alerts";
import {
  Check,
  ChevronDown,
  Circle,
  ListTodo,
  MessageSquare,
  Pencil,
  Share2,
  Star,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";
import { COLOR_SWATCHES, type ProjectStatusType, STATUS_OPTIONS } from "./types";

const iconList = PROJECT_ICON_LIST;

export interface HeaderMember {
  id: string;
  name: string;
  role: string;
  email?: string;
}

interface ProjectHeaderProps {
  projectId?: string;
  projectSlug?: string;
  projectTitle: string;
  setProjectTitle: (title: string) => void;
  onTitleSave?: (title: string) => void | Promise<void>;
  projectColor: string;
  setProjectColor: (color: string) => void;
  selectedIconIndex: number;
  setSelectedIconIndex: (idx: number) => void;
  isFavorite: boolean;
  setIsFavorite: (val: boolean) => void;
  status: ProjectStatusType;
  setStatus: (status: ProjectStatusType) => void;
  onStatusSave?: (status: ProjectStatusType) => void | Promise<void>;
  ownerName?: string;
  members?: HeaderMember[];
  onAddMember?: () => void;
  onInviteSuccess?: () => void;
}

const AVATAR_STYLES = [
  "bg-amber-400 text-amber-950",
  "bg-blue-400 text-blue-950",
  "bg-emerald-400 text-emerald-950",
  "bg-purple-400 text-purple-950",
  "bg-rose-400 text-rose-950",
  "bg-cyan-400 text-cyan-950",
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function MemberAvatarPopoverItem({
  member,
  colorClass,
  onMessage,
  onViewProfile,
}: {
  member: HeaderMember;
  colorClass: string;
  onMessage: (name: string) => void;
  onViewProfile: (name: string) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const email =
    member.email || `${member.name.toLowerCase().replace(/[^a-z0-9]/g, ".")}@company.com`;

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <UserAvatar
        name={member.name}
        size="md"
        fallbackBg={`${colorClass} font-bold`}
        className="border-2 border-white dark:border-[#0f1d31] cursor-pointer shadow-xs transition-transform group-hover:scale-110 shrink-0 relative z-10"
      />

      {isHovered && (
        <div className="absolute top-full right-0 mt-2 w-60 bg-white dark:bg-[#14263e] border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-3.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center gap-2.5 mb-2.5">
            <UserAvatar
              name={member.name}
              size="md"
              fallbackBg={`${colorClass} font-bold`}
              className="shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {member.name}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{email}</p>
              <span className="inline-block mt-0.5 px-2 py-0.5 text-[10px] font-bold rounded-md bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                {member.role}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => onMessage(member.name)}
              className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:hover:bg-blue-900/60 dark:text-blue-400 text-[11px] font-bold transition-colors cursor-pointer"
            >
              <MessageSquare size={12} /> Message
            </button>
            <button
              type="button"
              onClick={() => onViewProfile(member.name)}
              className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-[11px] font-bold transition-colors cursor-pointer"
            >
              <User size={12} /> Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function ProjectHeader({
  projectId,
  projectSlug,
  projectTitle,
  setProjectTitle,
  onTitleSave,
  projectColor,
  setProjectColor,
  selectedIconIndex,
  setSelectedIconIndex,
  isFavorite,
  setIsFavorite,
  status,
  setStatus,
  onStatusSave,
  ownerName,
  members = [],
  onAddMember,
  onInviteSuccess,
}: ProjectHeaderProps) {
  const router = useRouter();
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(projectTitle);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [inviteSuccessMsg, setInviteSuccessMsg] = useState<string | null>(null);
  const [inviteErrorMsg, setInviteErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const ActiveProjectIcon = iconList[selectedIconIndex]?.Icon || ListTodo;
  const currentStatusMeta = STATUS_OPTIONS.find((s) => s.value === status);

  const actualSlug = projectSlug || toSlug(projectTitle);
  const projectShareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/projects/${actualSlug}`
      : `/projects/${actualSlug}`;

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shareEmail.trim());

  const ownerMember: HeaderMember | null = ownerName
    ? {
        id: "owner",
        name: ownerName,
        role: "Project Owner",
      }
    : null;

  const allMembers: HeaderMember[] = ownerMember
    ? [ownerMember, ...members.filter((m) => m.name !== ownerName)]
    : members;
  const maxVisible = 4;
  const visibleMembers = allMembers.slice(0, maxVisible);
  const overflowCount = allMembers.length - maxVisible;

  const handleTitleSubmit = async () => {
    const trimmed = titleInput.trim();
    if (trimmed && trimmed !== projectTitle) {
      setProjectTitle(trimmed);
      setIsEditingTitle(false);
      try {
        await onTitleSave?.(trimmed);
        sileo.success("Project title updated!", "Saved");
      } catch {
        setProjectTitle(projectTitle);
        setTitleInput(projectTitle);
        sileo.error("Failed to update project title.", "Error");
      }
      return;
    }
    setTitleInput(projectTitle);
    setIsEditingTitle(false);
  };

  const handleStatusChange = async (newStatus: ProjectStatusType, label: string) => {
    const previous = status;
    setStatus(newStatus);
    setIsStatusDropdownOpen(false);
    try {
      await onStatusSave?.(newStatus);
      sileo.info(`Project status updated to "${label}"`, "Status Updated");
    } catch {
      setStatus(previous);
      sileo.error("Failed to update project status.", "Error");
    }
  };

  const handleToggleFavorite = () => {
    const next = !isFavorite;
    setIsFavorite(next);
    if (next) {
      sileo.success(`Added "${projectTitle}" to favorites!`, "Favorites");
    } else {
      sileo.info(`Removed "${projectTitle}" from favorites`, "Favorites");
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(projectShareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      sileo.success("Project link copied to clipboard!", "Copied");
    } catch (err) {
      console.error("Failed to copy link:", err);
      sileo.error("Failed to copy project link.", "Error");
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = shareEmail.trim().toLowerCase();
    if (!isEmailValid || !trimmedEmail || isInviting) return;

    if (!projectId) {
      setInviteErrorMsg("Project ID not found. Please try again.");
      return;
    }

    setIsInviting(true);
    setInviteErrorMsg(null);
    setInviteSuccessMsg(null);

    try {
      const res = await inviteTeamMember(projectId, trimmedEmail, "member");
      if (res.success) {
        setInviteSuccessMsg(`Invitation sent to ${trimmedEmail}! They'll receive an invitation link.`);
        sileo.success(`Invitation sent to ${trimmedEmail}!`, "Invited");
        setShareEmail("");
        onInviteSuccess?.();
      } else {
        setInviteErrorMsg(res.error || "Failed to send invitation. Please try again.");
        sileo.error(res.error || "Failed to send invite.", "Error");
      }
    } catch (err) {
      console.error("[handleInviteMember] Error:", err);
      setInviteErrorMsg("An unexpected error occurred while sending the invite.");
    } finally {
      setIsInviting(false);
    }
  };

  const handleCloseShareModal = () => {
    setIsShareModalOpen(false);
    setInviteSuccessMsg(null);
    setInviteErrorMsg(null);
    setShareEmail("");
  };

  const handleMessageMember = (memberName: string) => {
    sileo.info(`Direct messaging conversation started with ${memberName}.`, "Direct Message");
  };

  const handleViewMemberProfile = (memberName: string) => {
    sileo.info(`Opening member profile for ${memberName}.`, "Member Profile");
  };

  return (
    <>
      <header className="px-6 pt-4 pb-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1d31]">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 relative flex-wrap">
            <BackButton href="/projects" title="Back to Projects" className="mr-1" />

            <button
              onClick={() => setIsCustomizeOpen(!isCustomizeOpen)}
              className="p-2 rounded-xl text-white flex items-center justify-center transition-transform hover:scale-105 shadow-sm"
              style={{ backgroundColor: projectColor }}
              title="Customize Icon & Color"
            >
              <ActiveProjectIcon size={18} />
            </button>

            {isEditingTitle ? (
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleTitleSubmit();
                  if (e.key === "Escape") {
                    setTitleInput(projectTitle);
                    setIsEditingTitle(false);
                  }
                }}
                className="text-xl font-bold bg-slate-100 dark:bg-slate-800 border-b-2 border-blue-500 px-2 py-0.5 rounded outline-none text-slate-900 dark:text-white"
                autoFocus
              />
            ) : (
              <div
                onClick={() => {
                  setTitleInput(projectTitle);
                  setIsEditingTitle(true);
                }}
                className="group flex items-center gap-1.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 px-2 py-1 rounded-lg transition-colors"
                title="Click to edit project title"
              >
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">{projectTitle}</h1>
                <Pencil
                  size={13}
                  className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
            )}

            <button
              onClick={handleToggleFavorite}
              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 transition-colors"
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Star size={18} className={isFavorite ? "fill-amber-400 text-amber-400" : ""} />
            </button>

            <div className="relative">
              <button
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                  currentStatusMeta && currentStatusMeta.value !== null
                    ? `${currentStatusMeta.colorClass} border-transparent`
                    : "border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 bg-white dark:bg-slate-900"
                }`}
              >
                {currentStatusMeta && currentStatusMeta.value !== null ? (
                  <>
                    <span className={`w-2 h-2 rounded-full ${currentStatusMeta.dotClass}`} />
                    {currentStatusMeta.label}
                  </>
                ) : (
                  <>
                    <Circle size={12} className="text-slate-400" />
                    Set status
                  </>
                )}
                <ChevronDown size={14} className="opacity-70" />
              </button>

              {isStatusDropdownOpen && (
                <div className="absolute left-0 top-full mt-1 z-50 w-44 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-[#14263e]">
                  <div className="space-y-1">
                    {STATUS_OPTIONS.map((opt) => (
                      <button
                        key={opt.label}
                        onClick={() => handleStatusChange(opt.value, opt.label)}
                        className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${opt.colorClass}`}
                      >
                        <span className={`w-2 h-2 rounded-full ${opt.dotClass}`} />
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {isCustomizeOpen && (
              <div className="absolute top-12 left-0 z-50 w-72 bg-white dark:bg-[#14263e] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-4 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                    Color
                  </label>
                  <div className="grid grid-cols-7 gap-1.5">
                    {COLOR_SWATCHES.map((color, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setProjectColor(color);
                          setIsCustomizeOpen(false);
                          sileo.success("Project color updated!", "Theme Changed");
                        }}
                        className="w-6 h-6 rounded-md flex items-center justify-center transition-transform hover:scale-110"
                        style={{ backgroundColor: color }}
                      >
                        {projectColor === color && <Check size={12} className="text-white" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                    Icon
                  </label>
                  <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
                    {iconList.map(({ id, Icon }, index) => (
                      <button
                        key={id}
                        onClick={() => {
                          setSelectedIconIndex(index);
                          setIsCustomizeOpen(false);
                          sileo.success("Project icon updated!", "Theme Changed");
                        }}
                        className={`p-2 rounded-lg flex items-center justify-center border ${
                          selectedIconIndex === index
                            ? "border-sky-500 bg-sky-50 dark:bg-sky-950/30 text-sky-600"
                            : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                      >
                        <Icon size={18} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center -space-x-1.5">
              {visibleMembers.map((m, idx) => (
                <MemberAvatarPopoverItem
                  key={m.id}
                  member={m}
                  colorClass={AVATAR_STYLES[idx % AVATAR_STYLES.length]}
                  onMessage={handleMessageMember}
                  onViewProfile={handleViewMemberProfile}
                />
              ))}

              {overflowCount > 0 && (
                <button
                  type="button"
                  onClick={onAddMember}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center border-2 border-white dark:border-[#0f1d31] cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors z-10"
                  title={`${overflowCount} more members in this project. Click to view or add.`}
                >
                  +{overflowCount}
                </button>
              )}

              <button
                type="button"
                onClick={onAddMember}
                className="w-8 h-8 rounded-full bg-slate-200/80 dark:bg-slate-700/80 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-base flex items-center justify-center border-2 border-white dark:border-[#0f1d31] cursor-pointer transition-colors z-10 ml-0.5"
                title="Add member"
              >
                +
              </button>
            </div>

            <button
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center gap-1 bg-[#0f2d5a] hover:bg-[#0c2447] text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition-colors shadow-xs"
            >
              <Share2 size={13} /> Share
            </button>
          </div>
        </div>
      </header>

      <Modal
        isOpen={isShareModalOpen}
        onClose={handleCloseShareModal}
        title="Share Project"
        showCloseButton={false}
        maxWidthClassName="max-w-md"
        footer={
          <button
            type="button"
            onClick={handleCloseShareModal}
            disabled={isInviting}
            className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
        }
      >
        <div className="space-y-4">
          {/* Project Link */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Project Link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={projectShareUrl}
                className="flex-1 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 outline-none select-all"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="rounded-lg bg-[#0033a0] hover:bg-[#002a80] px-4 py-2 text-xs font-semibold text-white transition-colors cursor-pointer shrink-0"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          {/* Inline Feedback States */}
          {inviteSuccessMsg && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
              {inviteSuccessMsg}
            </div>
          )}

          {inviteErrorMsg && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-600 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
              {inviteErrorMsg}
            </div>
          )}

          {/* Invite Form */}
          <form onSubmit={handleInviteMember} className="space-y-3 pt-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Invite Team Member
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="colleague@company.com"
                value={shareEmail}
                onChange={(e) => {
                  setShareEmail(e.target.value);
                  setInviteErrorMsg(null);
                  setInviteSuccessMsg(null);
                }}
                disabled={isInviting}
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 outline-none focus:border-[#0033a0] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={!isEmailValid || isInviting}
                className="rounded-lg bg-[#0033a0] hover:bg-[#002a80] px-4 py-2 text-xs font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
              >
                {isInviting ? "Inviting..." : "Invite"}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
