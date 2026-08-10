"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  CheckCircle2,
  ClipboardList,
  User,
  FolderOpen,
  Target,
  ArrowRight,
  Trash2,
  List,
  X,
} from "lucide-react";
import { initialProjects, toSlug } from "@/lib/project-data";

interface HeaderSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HeaderSearchModal({ isOpen, onClose }: HeaderSearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        isOpen ? onClose() : null;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const categories = [
    { label: "Tasks", icon: CheckCircle2 },
    { label: "Projects", icon: ClipboardList },
    { label: "People", icon: User },
    { label: "Portfolios", icon: FolderOpen },
    { label: "Goals", icon: Target },
    { label: "More", icon: null },
  ];

  const recents = [
    { id: "proj-1", name: "Ellen's first project", avatar: "ES", color: "bg-amber-400 text-amber-950" },
    ...initialProjects.map((p, idx) => ({
      id: p.id,
      name: p.name,
      avatar: `P${idx + 1}`,
      color: "bg-[#00b4d8] text-white",
    })),
  ];

  const savedSearches = [
    { label: "Tasks I've created", icon: CheckCircle2 },
    { label: "Tasks I've assigned to others", icon: ArrowRight },
    { label: "Recently completed tasks", icon: CheckCircle2 },
    { label: "Deleted", icon: Trash2 },
  ];

  const filteredRecents = recents.filter((r) =>
    r.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelectProject = (projectName: string) => {
    const slug = toSlug(projectName);
    onClose();
    router.push(`/projects/${slug}`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 px-4 animate-in fade-in duration-150">
      <div
        ref={modalRef}
        className="w-full max-w-2xl bg-white dark:bg-[#14263e] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Top Search Input Box */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="relative flex items-center bg-white dark:bg-[#0f1f33] border-2 border-[#3151b7] dark:border-[#00b4d8] rounded-full px-4 py-2.5 shadow-sm transition-all">
            <Search size={18} className="text-slate-400 dark:text-slate-300 mr-2.5 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="w-full bg-transparent text-sm font-medium text-[#142843] dark:text-slate-100 placeholder-slate-400 focus:outline-none"
              suppressHydrationWarning
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 mr-1"
                aria-label="Clear search"
                suppressHydrationWarning
              >
                <X size={16} />
              </button>
            ) : null}
            <button
              type="button"
              className="text-slate-500 hover:text-[#00b4d8] transition-colors p-1"
              title="Search filters"
              aria-label="Search filters"
              suppressHydrationWarning
            >
              <SlidersHorizontal size={18} />
            </button>
          </div>

          {/* Quick Category Filter Pills */}
          <div className="flex items-center gap-2 mt-3.5 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => {
              const IconComponent = cat.icon;
              const isSelected = selectedCategory === cat.label;
              return (
                <button
                  key={cat.label}
                  type="button"
                  onClick={() =>
                    setSelectedCategory((prev) => (prev === cat.label ? "All" : cat.label))
                  }
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? "border-[#142843] bg-[#142843] text-white dark:border-[#00b4d8] dark:bg-[#00b4d8] dark:text-[#08131f]"
                      : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-[#1c304a] hover:border-[#00b4d8] hover:text-[#00b4d8]"
                  }`}
                  suppressHydrationWarning
                >
                  {IconComponent && <IconComponent size={14} />}
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Body */}
        <div className="max-h-[60vh] overflow-y-auto p-5 space-y-6">
          {/* Recents Section */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wide mb-3">
              Recents
            </h4>
            {filteredRecents.length > 0 ? (
              <div className="space-y-1">
                {filteredRecents.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectProject(item.name)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#1c304a] transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        <List size={16} />
                      </div>
                      <span className="text-sm font-semibold text-[#142843] dark:text-slate-100 group-hover:text-[#00b4d8] transition-colors">
                        {item.name}
                      </span>
                    </div>
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${item.color} shrink-0`}
                    >
                      {item.avatar}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-2">No matching recent items.</p>
            )}
          </div>

          {/* Saved Searches Section */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wide mb-3">
              Saved searches
            </h4>
            <div className="flex flex-wrap gap-2">
              {savedSearches.map((saved) => {
                const SavedIcon = saved.icon;
                return (
                  <button
                    key={saved.label}
                    type="button"
                    onClick={() => {
                      setQuery(saved.label);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-[#00b4d8]/15 hover:text-[#00b4d8] transition-colors cursor-pointer"
                    suppressHydrationWarning
                  >
                    <SavedIcon size={13} />
                    <span>{saved.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
