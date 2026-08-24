"use client";

import { useCategories } from "@/context/category-context";
import { sileo } from "@/utils/alerts";
import { Check, Pencil, Plus, RotateCcw, Search, Tags, Trash2, X } from "lucide-react";
import React, { useState, useMemo } from "react";

export function CategoriesTab() {
  const { categories, addCategory, removeCategory, updateCategory, resetCategories } =
    useCategories();

  const [newCategory, setNewCategory] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("#0052cc");
  const [categorySearch, setCategorySearch] = useState("");
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");

  const filteredCategories = useMemo(() => {
    if (!categorySearch.trim()) return categories;
    return categories.filter((c) => c.toLowerCase().includes(categorySearch.toLowerCase()));
  }, [categories, categorySearch]);

  const handleAddCategory = () => {
    const trimmed = newCategory.trim();
    if (!trimmed) return;
    if (categories.includes(trimmed)) {
      sileo.error(`Category "${trimmed}" already exists.`, "Duplicate Category");
      return;
    }
    addCategory(trimmed);
    setNewCategory("");
    sileo.success(`Category "${trimmed}" added successfully!`, "Category Created");
  };

  const handleSaveRenameCategory = (oldName: string) => {
    const trimmed = editCategoryName.trim();
    if (!trimmed) return;
    if (trimmed !== oldName && categories.includes(trimmed)) {
      sileo.error(`Category "${trimmed}" already exists.`, "Duplicate Name");
      return;
    }
    updateCategory(oldName, trimmed);
    setEditingCategory(null);
    sileo.success(`Category renamed to "${trimmed}".`, "Updated");
  };

  const inputClass =
    "w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-[#1c304a] text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0052cc] focus:border-[#0052cc] transition-all shadow-xs";

  return (
    <div className="p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#142843] dark:text-white">Project Categories</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Organize your projects with color-coded category labels.
          </p>
        </div>
        <span className="self-start sm:self-center text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
          {categories.length} Total
        </span>
      </div>
      <div className="border-b border-slate-100 dark:border-slate-800" />

      {/* Add new category */}
      <div className="p-5 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800">
        <h3 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
          Add New Category
        </h3>
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <input
              id="cat-color-input"
              aria-label="Category color"
              type="color"
              value={newCategoryColor}
              onChange={(e) => setNewCategoryColor(e.target.value)}
              className="w-11 h-11 rounded-xl border-2 border-slate-200 dark:border-slate-600 cursor-pointer p-0.5 bg-white dark:bg-[#1c304a]"
              title="Pick color"
            />
          </div>
          <input
            id="new-category-input"
            aria-label="New category name"
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddCategory();
              }
            }}
            placeholder="e.g. Blockchain, AI/ML, DevOps, Marketing…"
            className={`flex-1 ${inputClass}`}
          />
          <button
            type="button"
            onClick={handleAddCategory}
            className="inline-flex items-center gap-1.5 px-4 py-3 bg-[#0f2d5a] hover:bg-[#0c2447] text-white font-bold text-sm rounded-xl shadow-sm transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus size={14} /> Add
          </button>
        </div>
        <p className="text-[10px] text-slate-400 mt-2">
          Press Enter or click Add to save the category.
        </p>
      </div>

      {/* Active categories list with search filter */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <h3 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Active Categories
          </h3>
          <div className="relative w-full sm:w-56">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="filter-categories-input"
              aria-label="Filter active categories"
              type="text"
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              placeholder="Filter categories..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1c304a] text-slate-800 dark:text-white placeholder:text-slate-400"
            />
          </div>
        </div>

        {filteredCategories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {filteredCategories.map((cat: string, idx: number) => {
              const catColors = [
                "#0052cc",
                "#7c3aed",
                "#059669",
                "#dc2626",
                "#d97706",
                "#0891b2",
                "#db2777",
                "#475569",
              ];
              const color = catColors[idx % catColors.length];
              const isEditing = editingCategory === cat;

              return (
                <div
                  key={cat}
                  className="group flex items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1c304a] hover:border-slate-300 dark:hover:border-slate-600 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white text-xs font-black"
                      style={{ backgroundColor: color }}
                    >
                      {cat.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <input
                            aria-label="Edit category name"
                            type="text"
                            value={editCategoryName}
                            onChange={(e) => setEditCategoryName(e.target.value)}
                            className="px-2 py-0.5 text-xs font-bold border border-[#0052cc] rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white w-full"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveRenameCategory(cat)}
                            className="p-1 rounded bg-emerald-500 text-white cursor-pointer"
                            title="Save"
                          >
                            <Check size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCategory(null)}
                            className="p-1 rounded bg-slate-200 text-slate-700 cursor-pointer"
                            title="Cancel"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate block">
                          {cat}
                        </span>
                      )}
                      <div className="flex items-center gap-1 mt-0.5">
                        <div
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-[10px] text-slate-400">{color}</span>
                      </div>
                    </div>
                  </div>

                  {!isEditing && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCategory(cat);
                          setEditCategoryName(cat);
                        }}
                        className="p-1.5 rounded-lg text-slate-300 hover:text-[#0052cc] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title={`Rename ${cat}`}
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeCategory(cat)}
                        className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                        title={`Remove ${cat}`}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
            <Tags size={24} className="text-slate-400" />
            <div>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                No categories found
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Add a category above to get started.</p>
            </div>
          </div>
        )}
      </div>

      {/* Reset categories */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
        <button
          type="button"
          onClick={() => {
            resetCategories();
            sileo.success("Restored default project categories.", "Categories Reset");
          }}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
        >
          <RotateCcw size={12} /> Reset to defaults
        </button>
      </div>
    </div>
  );
}
