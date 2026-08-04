"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronDown,
  Star,
  Share2,
  SlidersHorizontal,
  Check,
  ListTodo,
  Kanban,
  Columns,
  Calendar,
  Rocket,
  Users,
  TrendingUp,
  Bug,
  Lightbulb,
  Globe,
  Settings,
  Circle,
  Copy,
  Pencil,
  X,
} from "lucide-react";
import { sileo } from "@/utils/alerts";
import { Modal } from "@/components/modals/BaseModal";
import { ProjectStatusType, STATUS_OPTIONS, COLOR_SWATCHES } from "./types";

const iconList = [
  { id: "list", Icon: ListTodo },
  { id: "kanban", Icon: Kanban },
  { id: "columns", Icon: Columns },
  { id: "calendar", Icon: Calendar },
  { id: "rocket", Icon: Rocket },
  { id: "users", Icon: Users },
  { id: "trending", Icon: TrendingUp },
  { id: "star", Icon: Star },
  { id: "bug", Icon: Bug },
  { id: "lightbulb", Icon: Lightbulb },
  { id: "globe", Icon: Globe },
  { id: "settings", Icon: Settings },
];

interface ProjectHeaderProps {
  projectTitle: string;
  setProjectTitle: (title: string) => void;
  projectColor: string;
  setProjectColor: (color: string) => void;
  selectedIconIndex: number;
  setSelectedIconIndex: (idx: number) => void;
  status: ProjectStatusType;
  setStatus: (status: ProjectStatusType) => void;
}

export function ProjectHeader({
  projectTitle,
  setProjectTitle,
  projectColor,
  setProjectColor,
  selectedIconIndex,
  setSelectedIconIndex,
  status,
  setStatus,
}: ProjectHeaderProps) {
  const router = useRouter();
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(projectTitle);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState("");

  const ActiveProjectIcon = iconList[selectedIconIndex]?.Icon || ListTodo;
  const currentStatusMeta = STATUS_OPTIONS.find((s) => s.value === status);

  const handleTitleSubmit = () => {
    if (titleInput.trim()) {
      setProjectTitle(titleInput.trim());
      sileo.success("Project title updated!", "Saved");
    } else {
      setTitleInput(projectTitle);
    }
    setIsEditingTitle(false);
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    if (!isFavorite) {
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

  return (
    <>
      <header className="px-6 pt-4 pb-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1d31]">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          {/* Left Controls */}
          <div className="flex items-center gap-2 relative flex-wrap">
            <button
              onClick={() => router.back()}
              className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white transition-colors mr-1"
              title="Go back"
            >
              <ChevronLeft size={20} />
            </button>

            {/* Customization Burger Icon Button */}
            <button
              onClick={() => setIsCustomizeOpen(!isCustomizeOpen)}
              className="p-2 rounded-xl text-white flex items-center justify-center transition-transform hover:scale-105 shadow-sm"
              style={{ backgroundColor: projectColor }}
              title="Customize Icon & Color"
            >
              <ActiveProjectIcon size={18} />
            </button>

            {/* Editable Project Title */}
            {isEditingTitle ? (
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleTitleSubmit();
                  if (e.key === "Escape") setIsEditingTitle(false);
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
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  {projectTitle}
                </h1>
                <Pencil size={13} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}

            {/* Favorite Star Button */}
            <button
              onClick={handleToggleFavorite}
              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 transition-colors"
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Star
                size={18}
                className={isFavorite ? "fill-amber-400 text-amber-400" : ""}
              />
            </button>

            {/* Set Status Dropdown */}
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

              {/* Status Dropdown Options */}
              {isStatusDropdownOpen && (
                <div className="absolute left-0 top-full mt-1 z-50 w-44 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-[#14263e]">
                  <div className="space-y-1">
                    {STATUS_OPTIONS.map((opt) => (
                      <button
                        key={opt.label}
                        onClick={() => {
                          setStatus(opt.value);
                          setIsStatusDropdownOpen(false);
                          sileo.info(`Project status updated to "${opt.label}"`, "Status Updated");
                        }}
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

            {/* Color & Icon Customization Menu (Auto-saves on click!) */}
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
                          setIsCustomizeOpen(false); // Automatically saves and closes!
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
                          setIsCustomizeOpen(false); // Automatically saves and closes!
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

          {/* Right Header Buttons */}
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1">
              <span className="w-7 h-7 rounded-full bg-amber-400 text-amber-900 font-bold text-xs flex items-center justify-center border-2 border-white dark:border-[#0f1d31]">
                ES
              </span>
              <span
                onClick={() => setIsShareModalOpen(true)}
                className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 font-bold text-xs flex items-center justify-center border-2 border-white dark:border-[#0f1d31] cursor-pointer hover:bg-slate-300"
              >
                +
              </span>
            </div>
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center gap-1 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shadow-xs"
            >
              <Share2 size={13} /> Share
            </button>
            <button
              onClick={() => setIsCustomizeOpen(!isCustomizeOpen)}
              className="flex items-center gap-1 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold px-2.5 py-1.5 rounded-lg"
            >
              <SlidersHorizontal size={13} /> Customize
            </button>
          </div>
        </div>
      </header>

      {/* Share Project Modal */}
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
