"use client";

import {
  createCategoryAction,
  deleteCategoryAction,
  getCategoriesAction,
  resetCategoriesAction,
  updateCategoryAction,
} from "@/actions/category-actions";
import { DEFAULT_EVENT_CATEGORIES, type CategoryItem } from "@/lib/category-constants";
import type React from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

interface CategoryContextType {
  eventCategories: CategoryItem[];
  /** Array of category names for easy select mapping */
  categories: string[];
  /** Alias for categories */
  eventCategoryNames: string[];
  isLoading: boolean;
  isLoaded: boolean;
  addCategory: (name: string) => Promise<boolean>;
  removeCategory: (idOrName: string) => Promise<boolean>;
  updateCategory: (idOrOldName: string, newName: string) => Promise<boolean>;
  resetCategories: () => Promise<boolean>;
  refreshCategories: () => Promise<void>;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export function CategoryProvider({ children }: { children: React.ReactNode }) {
  const [eventCategories, setEventCategories] = useState<CategoryItem[]>(() =>
    DEFAULT_EVENT_CATEGORIES.map((name) => ({
      id: `default-${name}`,
      name,
      workspaceId: "",
      createdBy: "",
      createdAt: null,
    })),
  );

  const [isLoading, setIsLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  const refreshCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const list = await getCategoriesAction();
      if (list && list.length > 0) {
        setEventCategories(list);
      }
    } catch (err) {
      console.error("[CategoryProvider] Failed to fetch categories:", err);
    } finally {
      setIsLoading(false);
      setIsLoaded(true);
    }
  }, []);

  // Hydration-safe mount fetch
  useEffect(() => {
    refreshCategories();
  }, [refreshCategories]);

  const addCategory = async (name: string): Promise<boolean> => {
    const trimmed = name.trim();
    if (!trimmed) return false;

    // Optimistic check
    if (eventCategories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      return false;
    }

    const tempId = `temp-${Date.now()}`;
    const optimisticItem: CategoryItem = {
      id: tempId,
      name: trimmed,
      workspaceId: "",
      createdBy: "",
      createdAt: new Date(),
    };

    setEventCategories((prev) => [...prev, optimisticItem]);

    const res = await createCategoryAction(trimmed);
    if (!res.success) {
      setEventCategories((prev) => prev.filter((c) => c.id !== tempId));
      return false;
    }

    if (res.category) {
      const realItem = res.category;
      setEventCategories((prev) => prev.map((c) => (c.id === tempId ? realItem : c)));
    }
    return true;
  };

  const removeCategory = async (idOrName: string): Promise<boolean> => {
    const target = eventCategories.find((c) => c.id === idOrName || c.name === idOrName);
    if (!target) return false;

    setEventCategories((prev) => prev.filter((c) => c.id !== target.id));

    if (target.id.startsWith("temp-") || target.id.startsWith("default-")) {
      return true;
    }

    const res = await deleteCategoryAction(target.id);
    if (!res.success) {
      setEventCategories((prev) => [...prev, target]);
      return false;
    }
    return true;
  };

  const updateCategory = async (idOrOldName: string, newName: string): Promise<boolean> => {
    const trimmed = newName.trim();
    if (!trimmed) return false;

    const target = eventCategories.find((c) => c.id === idOrOldName || c.name === idOrOldName);
    if (!target) return false;

    const prevName = target.name;
    setEventCategories((prev) =>
      prev.map((c) => (c.id === target.id ? { ...c, name: trimmed } : c)),
    );

    if (target.id.startsWith("temp-") || target.id.startsWith("default-")) {
      return true;
    }

    const res = await updateCategoryAction(target.id, trimmed);
    if (!res.success) {
      setEventCategories((prev) =>
        prev.map((c) => (c.id === target.id ? { ...c, name: prevName } : c)),
      );
      return false;
    }
    return true;
  };

  const resetCategories = async (): Promise<boolean> => {
    const res = await resetCategoriesAction();
    if (res.success && res.categories) {
      setEventCategories(res.categories);
      return true;
    }
    return false;
  };

  const categoryNames = useMemo(() => eventCategories.map((c) => c.name), [eventCategories]);

  return (
    <CategoryContext.Provider
      value={{
        eventCategories,
        categories: categoryNames,
        eventCategoryNames: categoryNames,
        isLoading,
        isLoaded,
        addCategory,
        removeCategory,
        updateCategory,
        resetCategories,
        refreshCategories,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error("useCategories must be used within a CategoryProvider");
  }
  return context;
}
