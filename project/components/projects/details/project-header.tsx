"use client";

import { Modal } from "@/components/modals/BaseModal";
import { BackButton } from "@/components/ui/back-button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { PROJECT_ICON_LIST } from "@/lib/project-meta";
import { sileo } from "@/utils/alerts";
import {
  Check,
  ChevronDown,
  Circle,
  Copy,
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
  members?: HeaderMember[];
  onAddMember?: () => void;
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
  const initials = getInitials(member.name);
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
              className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:hover:bg-blue-900/60 dark:text-blue-400 text-[11px] font-bold transition-colors"
            >
              <MessageSquare size={12} /> Message
            </button>
            <button
              type="button"
              onClick={() => onViewProfile(member.name)}
              className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-[11px] font-bold transition-colors"
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
  members = [],
  onAddMember,
}: ProjectHeaderProps) {
  const router = useRouter();
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(projectTitle);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState("");

  const ActiveProjectIcon = iconList[selectedIconIndex]?.Icon || ListTodo;
  const currentStatusMeta = STATUS_OPTIONS.find((s) => s.value === status);

  const ownerMember: HeaderMember = {
    id: "owner",
    name: "Ellen Grace Sinday",
    role: "Project Owner",
    email: "ellen.sinday@company.com",
  };

  const allMembers: HeaderMember[] = [ownerMember, ...members];
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

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    sileo.success("Project link copied to clipboard!", "Copied");
  };

  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (shareEmail.trim()) {
      sileo.success(`Invitation sent to ${shareEmail}`, "Invited");
      setShareEmail("");
      setIsShareModalOpen(false);
    }
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
        onClose={() => setIsShareModalOpen(false)}
        title="Share Project"
        maxWidthClassName="max-w-md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Project Link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={typeof window !== "undefined" ? window.location.href : ""}
                className="flex-1 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              />
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
              >
                <Copy size={13} /> Copy
              </button>
            </div>
          </div>

          <form onSubmit={handleInviteMember} className="space-y-3 pt-2">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
              Invite Team Member
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="colleague@company.com"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
              >
                Invite
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
