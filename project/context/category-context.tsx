"use client";

import { PROJECT_CATEGORIES } from "@/lib/validations/project"; // Use as defaults
import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";

interface CategoryContextType {
  categories: string[];
  addCategory: (name: string) => void;
  removeCategory: (name: string) => void;
  updateCategory: (oldName: string, newName: string) => void;
  resetCategories: () => void;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

const STORAGE_KEY = "syntraflow_custom_categories";

export function CategoryProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<string[]>([...PROJECT_CATEGORIES]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setCategories(JSON.parse(stored));
      }
      setIsLoaded(true);
    } catch {
      setIsLoaded(true);
    }
  }, []);

  const addCategory = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    setCategories((prev) => {
      if (prev.includes(trimmed)) return prev;
      const next = [...prev, trimmed];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const removeCategory = (name: string) => {
    setCategories((prev) => {
      const next = prev.filter((c) => c !== name);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const updateCategory = (oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setCategories((prev) => {
      const next = prev.map((c) => (c === oldName ? trimmed : c));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const resetCategories = () => {
    setCategories([...PROJECT_CATEGORIES]);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(PROJECT_CATEGORIES));
  };

  return (
    <CategoryContext.Provider
      value={{ categories, addCategory, removeCategory, updateCategory, resetCategories }}
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
