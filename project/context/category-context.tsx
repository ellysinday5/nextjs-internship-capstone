"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { PROJECT_CATEGORIES } from "@/lib/project-schemas"; // Use as defaults

interface CategoryContextType {
  categories: string[];
  addCategory: (name: string) => void;
  removeCategory: (name: string) => void;
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

  // Prevent hydration mismatch by not rendering children until loaded, or just render with defaults.
  // We'll render with defaults (initial state) to avoid flickering, hydration handles the rest.
  return (
    <CategoryContext.Provider value={{ categories, addCategory, removeCategory }}>
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
