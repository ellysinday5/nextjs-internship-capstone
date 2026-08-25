"use client";

import { useCategories } from "@/context/category-context";
import { sileo } from "@/utils/alerts";
import {
  ArrowDownAZ,
  ArrowUpAZ,
  Calendar,
  Check,
  Clock,
  Hash,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Tag,
  Tags,
  Trash2,
  X,
} from "lucide-react";
import React, { useMemo, useRef, useState } from "react";

type SortOrder = "default" | "asc" | "desc";

const PRESET_SUGGESTIONS = [
  { label: "Standup" },
  { label: "Sprint Review" },
  { label: "Demo" },
  { label: "Milestone" },
  { label: "1-on-1" },
  { label: "Deploy" },
  { label: "Bug Bash" },
  { label: "Planning" },
  { label: "Retrospective" },
  { label: "Workshop" },
];

const COLOR_PALETTE = [
  "#0052cc",
  "#059669",
  "#7c3aed",
  "#d97706",
  "#0891b2",
  "#dc2626",
  "#475569",
  "#db2777",
  "#16a34a",
  "#c2410c",
];

export function CategoriesTab() {
  const { eventCategories, addCategory, removeCategory, updateCategory, resetCategories } =
    useCategories();

  const [newCategory, setNewCategory] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("default");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);

  const newInputRef = useRef<HTMLInputElement>(null);

  const filteredCategories = useMemo(() => {
    let list = [...eventCategories];

    if (categorySearch.trim()) {
      list = list.filter((c) => c.name.toLowerCase().includes(categorySearch.toLowerCase()));
    }

    if (sortOrder === "asc") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOrder === "desc") {
      list.sort((a, b) => b.name.localeCompare(a.name));
    }

    return list;
  }, [eventCategories, categorySearch, sortOrder]);

  const handleAdd = async (name?: string) => {
    const trimmed = (name ?? newCategory).trim();
    if (!trimmed) return;
    if (eventCategories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      sileo.error(`"${trimmed}" already exists.`, "Duplicate Category");
      return;
    }
    setIsSubmitting(true);
    const success = await addCategory(trimmed);
    setIsSubmitting(false);
    if (success) {
      if (!name) setNewCategory("");
      sileo.success(`"${trimmed}" added to event categories.`, "Category Created");
    } else {
      sileo.error("Failed to create category.", "Error");
    }
  };

  const handleSaveRename = async (id: string, oldName: string) => {
    const trimmed = editCategoryName.trim();
    if (!trimmed) return;
    if (trimmed.toLowerCase() === oldName.toLowerCase()) {
      setEditingId(null);
      return;
    }
    if (eventCategories.some((c) => c.id !== id && c.name.toLowerCase() === trimmed.toLowerCase())) {
      sileo.error(`"${trimmed}" already exists.`, "Duplicate Name");
      return;
    }
    const success = await updateCategory(id, trimmed);
    if (success) {
      setEditingId(null);
      sileo.success(`Category renamed to "${trimmed}".`, "Updated");
    } else {
      sileo.error("Failed to update category.", "Error");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const success = await removeCategory(id);
    setDeleteConfirmId(null);
    if (success) {
      sileo.success(`"${name}" removed.`, "Deleted");
    } else {
      sileo.error("Failed to delete category.", "Error");
    }
  };

  const handleReset = async () => {
    if (!resetConfirm) {
      setResetConfirm(true);
      setTimeout(() => setResetConfirm(false), 4000);
      return;
    }
    setResetConfirm(false);
    const success = await resetCategories();
    if (success) {
      sileo.success("Restored default event categories.", "Categories Reset");
    } else {
      sileo.error("Failed to reset categories.", "Error");
    }
  };

  const cycleSortOrder = () => {
    setSortOrder((prev) => (prev === "default" ? "asc" : prev === "asc" ? "desc" : "default"));
  };

  const sortLabel =
    sortOrder === "asc" ? "A → Z" : sortOrder === "desc" ? "Z → A" : "Default";

  const SortIcon = sortOrder === "asc" ? ArrowDownAZ : sortOrder === "desc" ? ArrowUpAZ : Hash;

  // Presets not already in list
  const availablePresets = PRESET_SUGGESTIONS.filter(
    (p) => !eventCategories.some((c) => c.name.toLowerCase() === p.label.toLowerCase()),
  );

  return (
    <div className="p-6 sm:p-8 max-w-4xl space-y-8">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-[#0052cc]/10 to-[#0052cc]/5 dark:from-[#0052cc]/20 dark:to-[#0052cc]/10 border border-[#0052cc]/20 dark:border-[#0052cc]/30 shadow-xs mt-0.5">
            <Calendar size={20} className="text-[#0052cc] dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-[#142843] dark:text-white tracking-tight">
              Event Categories
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 max-w-xl leading-relaxed">
              Manage workspace-scoped categories for your Calendar events. Changes sync in real-time
              across all workspace members.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0052cc] dark:text-blue-400 bg-[#0052cc]/8 dark:bg-[#0052cc]/15 border border-[#0052cc]/20 dark:border-[#0052cc]/30 px-3 py-1.5 rounded-full">
            <Tags size={12} />
            {eventCategories.length} {eventCategories.length === 1 ? "Category" : "Categories"}
          </span>
        </div>
      </div>

      {/* ── Create New Category ── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/70 bg-white dark:bg-[#14263e]/60 shadow-xs overflow-hidden">
        {/* Card Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <Plus size={15} className="text-[#0052cc]" />
          <span className="text-sm font-bold text-[#142843] dark:text-white">Add New Category</span>
        </div>

        <div className="p-5 space-y-4">
          {/* Input Row */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex-1">
              <Tag
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                ref={newInputRef}
                aria-label="New event category name"
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAdd();
                  }
                }}
                placeholder="Category name (e.g. Sprint Review, Standup, Deploy…)"
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-[#1c304a] text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0052cc]/40 focus:border-[#0052cc] transition-all placeholder:text-slate-400"
                disabled={isSubmitting}
              />
            </div>
            <button
              type="button"
              onClick={() => handleAdd()}
              disabled={isSubmitting || !newCategory.trim()}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#0052cc] hover:bg-[#003fa3] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl shadow-xs transition-all whitespace-nowrap cursor-pointer"
            >
              <Plus size={15} />
              Add
            </button>
          </div>

          {/* Quick Preset Chips */}
          {availablePresets.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Quick add suggestions
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {availablePresets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleAdd(preset.label)}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-[#0052cc]/60 hover:bg-[#0052cc]/5 dark:hover:bg-[#0052cc]/10 hover:text-[#0052cc] text-slate-600 dark:text-slate-300 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                  >
                    <span>{preset.label}</span>
                    <Plus size={11} className="opacity-60" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Category List Card ── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/70 bg-white dark:bg-[#14263e]/60 shadow-xs overflow-hidden">
        {/* Card Header: Search + Sort + Reset */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Tags size={15} className="text-[#0052cc]" />
            <span className="text-sm font-bold text-[#142843] dark:text-white">
              All Categories
            </span>
            <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
              {filteredCategories.length}
              {filteredCategories.length !== eventCategories.length &&
                ` / ${eventCategories.length}`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                aria-label="Filter event categories"
                type="text"
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                placeholder="Search…"
                className="w-36 pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1c304a] text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0052cc]/30 focus:border-[#0052cc] transition-all"
              />
            </div>

            {/* Sort Toggle */}
            <button
              type="button"
              onClick={cycleSortOrder}
              title="Toggle sort order"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                sortOrder !== "default"
                  ? "bg-[#0052cc] text-white border-[#0052cc] shadow-xs"
                  : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-[#0052cc]/60 hover:text-[#0052cc] bg-slate-50 dark:bg-slate-800/50"
              }`}
            >
              <SortIcon size={13} />
              <span className="hidden sm:inline">{sortLabel}</span>
            </button>
          </div>
        </div>

        {/* Category Grid */}
        <div className="p-5">
          {filteredCategories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {filteredCategories.map((cat, idx) => {
                const color = COLOR_PALETTE[
                  eventCategories.findIndex((e) => e.id === cat.id) % COLOR_PALETTE.length
                ];
                const isEditing = editingId === cat.id;
                const isDeleting = deleteConfirmId === cat.id;

                return (
                  <div
                    key={cat.id}
                    className={`group relative flex flex-col gap-2.5 p-3.5 rounded-xl border transition-all ${
                      isEditing
                        ? "border-[#0052cc]/60 bg-[#0052cc]/5 dark:bg-[#0052cc]/10 shadow-sm"
                        : isDeleting
                          ? "border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/20"
                          : "border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/30 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-white dark:hover:bg-[#1c304a]/70 hover:shadow-xs"
                    }`}
                  >
                    {/* Top Row: Color dot + Name/Input + actions */}
                    <div className="flex items-center gap-2.5">
                      {/* Color Avatar */}
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white text-[13px] font-extrabold shadow-xs ring-2 ring-white/50 dark:ring-black/20"
                        style={{ backgroundColor: color }}
                      >
                        {cat.name.charAt(0).toUpperCase()}
                      </div>

                      {/* Name / Edit Input */}
                      <div className="flex-1 min-w-0">
                        {isEditing ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              aria-label="Edit category name"
                              type="text"
                              value={editCategoryName}
                              onChange={(e) => setEditCategoryName(e.target.value)}
                              className="flex-1 px-2.5 py-1 text-sm font-bold border border-[#0052cc] rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none min-w-0"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleSaveRename(cat.id, cat.name);
                                } else if (e.key === "Escape") {
                                  setEditingId(null);
                                }
                              }}
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveRename(cat.id, cat.name)}
                              className="p-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer transition-colors shadow-xs"
                              title="Save"
                            >
                              <Check size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 cursor-pointer transition-colors"
                              title="Cancel"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        ) : isDeleting ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-red-600 dark:text-red-400 truncate">
                              Delete &ldquo;{cat.name}&rdquo;?
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate block">
                            {cat.name}
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      {!isEditing && !isDeleting && (
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(cat.id);
                              setEditCategoryName(cat.name);
                              setDeleteConfirmId(null);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#0052cc] hover:bg-[#0052cc]/10 transition-colors cursor-pointer"
                            title={`Rename ${cat.name}`}
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(cat.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                            title={`Remove ${cat.name}`}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Delete Confirmation Row */}
                    {isDeleting && (
                      <div className="flex items-center gap-2 pt-0.5 animate-in fade-in slide-in-from-top-1 duration-150">
                        <button
                          type="button"
                          onClick={() => handleDelete(cat.id, cat.name)}
                          className="flex-1 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                        >
                          Yes, delete
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(null)}
                          className="flex-1 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-14 text-center border border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-800/10">
              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800">
                <Tags size={22} className="text-slate-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  {categorySearch ? "No matching categories" : "No event categories yet"}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {categorySearch
                    ? "Try a different search term."
                    : "Add your first category using the form above."}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Card Footer: Reset */}
        <div className="px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-[#0f1d31]/30">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Clock size={11} />
            <span>Synced across all workspace members</span>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
              resetConfirm
                ? "bg-amber-500 border-amber-500 text-white hover:bg-amber-600 shadow-xs"
                : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-700 dark:hover:text-white bg-white dark:bg-[#1c304a]"
            }`}
          >
            <RotateCcw size={12} />
            {resetConfirm ? "Confirm reset?" : "Reset to defaults"}
          </button>
        </div>
      </div>
    </div>
  );
}
