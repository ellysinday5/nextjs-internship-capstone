"use server";

import { db } from "@/lib/db";
import { syncUser } from "@/lib/db/auth";
import { categories } from "@/lib/db/schema";
import { getActiveWorkspaceId } from "@/lib/workspace-helpers";
import { and, asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { DEFAULT_EVENT_CATEGORIES, type CategoryItem } from "@/lib/category-constants";

/**
 * Fetch event categories for the current workspace.
 * If no categories exist yet for this workspace, automatically seeds defaults
 * using ON CONFLICT DO NOTHING to prevent concurrent insertion race conditions.
 */
export async function getCategoriesAction(): Promise<CategoryItem[]> {
  try {
    const user = await syncUser();
    if (!user) return [];

    const activeWorkspaceId = await getActiveWorkspaceId(user.id);
    if (!activeWorkspaceId) return [];

    // Query existing categories
    let existing = await db
      .select()
      .from(categories)
      .where(eq(categories.workspaceId, activeWorkspaceId))
      .orderBy(asc(categories.name));

    // If none exist, seed defaults with onConflictDoNothing
    if (existing.length === 0) {
      const seedValues = DEFAULT_EVENT_CATEGORIES.map((name) => ({
        name,
        workspaceId: activeWorkspaceId,
        createdBy: user.id,
      }));

      try {
        await db.insert(categories).values(seedValues).onConflictDoNothing();
      } catch (seedErr) {
        console.warn("[getCategoriesAction] Seed conflict handled:", seedErr);
      }

      existing = await db
        .select()
        .from(categories)
        .where(eq(categories.workspaceId, activeWorkspaceId))
        .orderBy(asc(categories.name));
    }

    return existing.map((c) => ({
      id: c.id,
      name: c.name,
      workspaceId: c.workspaceId,
      createdBy: c.createdBy,
      createdAt: c.createdAt,
    }));
  } catch (error) {
    console.error("[getCategoriesAction] Error fetching event categories:", error);
    return [];
  }
}

/**
 * Creates a new event category scoped to the current user's active workspace.
 */
export async function createCategoryAction(
  name: string,
): Promise<{ success: boolean; category?: CategoryItem; error?: string }> {
  try {
    const trimmed = name.trim();
    if (!trimmed) {
      return { success: false, error: "Category name cannot be empty." };
    }

    const user = await syncUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const activeWorkspaceId = await getActiveWorkspaceId(user.id);
    if (!activeWorkspaceId) return { success: false, error: "No active workspace found." };

    // Check for duplicate in the same workspace
    const [existing] = await db
      .select()
      .from(categories)
      .where(
        and(
          eq(categories.workspaceId, activeWorkspaceId),
          eq(categories.name, trimmed),
        ),
      );

    if (existing) {
      return { success: false, error: `Category "${trimmed}" already exists.` };
    }

    const [inserted] = await db
      .insert(categories)
      .values({
        name: trimmed,
        workspaceId: activeWorkspaceId,
        createdBy: user.id,
      })
      .returning();

    revalidatePath("/settings");
    revalidatePath("/calendar");

    return {
      success: true,
      category: {
        id: inserted.id,
        name: inserted.name,
        workspaceId: inserted.workspaceId,
        createdBy: inserted.createdBy,
        createdAt: inserted.createdAt,
      },
    };
  } catch (error: any) {
    console.error("[createCategoryAction] Error creating category:", error);
    return { success: false, error: error.message || "Failed to create category." };
  }
}

/**
 * Renames an existing category.
 */
export async function updateCategoryAction(
  id: string,
  newName: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const trimmed = newName.trim();
    if (!trimmed) {
      return { success: false, error: "Category name cannot be empty." };
    }

    const user = await syncUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const activeWorkspaceId = await getActiveWorkspaceId(user.id);
    if (!activeWorkspaceId) return { success: false, error: "No active workspace found." };

    // Check for duplicate name
    const [duplicate] = await db
      .select()
      .from(categories)
      .where(
        and(
          eq(categories.workspaceId, activeWorkspaceId),
          eq(categories.name, trimmed),
        ),
      );

    if (duplicate && duplicate.id !== id) {
      return { success: false, error: `Category "${trimmed}" already exists.` };
    }

    await db
      .update(categories)
      .set({ name: trimmed })
      .where(and(eq(categories.id, id), eq(categories.workspaceId, activeWorkspaceId)));

    revalidatePath("/settings");
    revalidatePath("/calendar");

    return { success: true };
  } catch (error: any) {
    console.error("[updateCategoryAction] Error updating category:", error);
    return { success: false, error: error.message || "Failed to update category." };
  }
}

/**
 * Deletes a category by id.
 */
export async function deleteCategoryAction(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await syncUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const activeWorkspaceId = await getActiveWorkspaceId(user.id);
    if (!activeWorkspaceId) return { success: false, error: "No active workspace found." };

    await db
      .delete(categories)
      .where(and(eq(categories.id, id), eq(categories.workspaceId, activeWorkspaceId)));

    revalidatePath("/settings");
    revalidatePath("/calendar");

    return { success: true };
  } catch (error: any) {
    console.error("[deleteCategoryAction] Error deleting category:", error);
    return { success: false, error: error.message || "Failed to delete category." };
  }
}

/**
 * Resets categories to default event values.
 */
export async function resetCategoriesAction(): Promise<{
  success: boolean;
  categories?: CategoryItem[];
  error?: string;
}> {
  try {
    const user = await syncUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const activeWorkspaceId = await getActiveWorkspaceId(user.id);
    if (!activeWorkspaceId) return { success: false, error: "No active workspace found." };

    // Delete existing
    await db
      .delete(categories)
      .where(eq(categories.workspaceId, activeWorkspaceId));

    // Re-seed defaults
    const seedValues = DEFAULT_EVENT_CATEGORIES.map((name) => ({
      name,
      workspaceId: activeWorkspaceId,
      createdBy: user.id,
    }));

    await db.insert(categories).values(seedValues).onConflictDoNothing();

    const freshlySeeded = await db
      .select()
      .from(categories)
      .where(eq(categories.workspaceId, activeWorkspaceId))
      .orderBy(asc(categories.name));

    revalidatePath("/settings");
    revalidatePath("/calendar");

    return {
      success: true,
      categories: freshlySeeded.map((c) => ({
        id: c.id,
        name: c.name,
        workspaceId: c.workspaceId,
        createdBy: c.createdBy,
        createdAt: c.createdAt,
      })),
    };
  } catch (error: any) {
    console.error("[resetCategoriesAction] Error resetting categories:", error);
    return { success: false, error: error.message || "Failed to reset categories." };
  }
}
