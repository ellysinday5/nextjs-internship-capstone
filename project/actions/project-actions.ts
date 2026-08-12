"use server";

import { revalidatePath } from "next/cache";
import { eq, and, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { projects, projectMembers, lists, tasks } from "@/lib/db/schema";
import { syncUser } from "@/lib/auth";
import { toSlug } from "@/lib/project-data";
import {
  createProjectSchema,
  updateProjectSchema,
  CreateProjectFormValues,
  UpdateProjectFormValues,
} from "@/lib/project-schemas";

export interface ProjectWithStats {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  ownerName: string; // NEW
  dueDate: Date | null;
  categories: string[];
  techStack: string[];
  status: string;
  priority: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  listCount: number;
  taskCount: number;
  completedTaskCount: number;
  memberCount: number;
  members: { id: string; name: string; role: string }[];
}

export async function getProjectsAction(): Promise<ProjectWithStats[]> {
  try {
    const user = await syncUser();
    if (!user) return [];

    const userProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.ownerId, user.id))
      .orderBy(sql`${projects.createdAt} DESC`);

    if (userProjects.length === 0) return [];

    const results: ProjectWithStats[] = await Promise.all(
      userProjects.map(async (p) => {
        const projectLists = await db
          .select({ id: lists.id })
          .from(lists)
          .where(eq(lists.projectId, p.id));

        let totalTasks = 0;
        let completedTasks = 0;

        if (projectLists.length > 0) {
          const listIds = projectLists.map((l) => l.id);
          for (const lId of listIds) {
            const listTasks = await db
              .select({ id: tasks.id, priority: tasks.priority, status: tasks.status })
              .from(tasks)
              .where(eq(tasks.listId, lId));

            totalTasks += listTasks.length;
            completedTasks += listTasks.filter(
              (t) => t.status === "Completed" || t.status === "Done",
            ).length;
          }
        }

        const members = await db
          .select()
          .from(projectMembers)
          .where(eq(projectMembers.projectId, p.id));

        return {
          ...p,
          ownerName: user.name, // since these are always the current user's own projects
          listCount: projectLists.length,
          taskCount: totalTasks,
          completedTaskCount: completedTasks,
          memberCount: members.length,
          members,
        };
      }),
    );

    return results;
  } catch (error) {
    console.error("[getProjectsAction] Error fetching projects:", error);
    return [];
  }
}

export async function getProjectBySlugAction(slug: string): Promise<ProjectWithStats | null> {
  try {
    const user = await syncUser();
    if (!user) return null;

    const userProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.ownerId, user.id));

    const match = userProjects.find((p) => toSlug(p.name) === slug);
    if (!match) return null;

    const projectLists = await db
      .select({ id: lists.id })
      .from(lists)
      .where(eq(lists.projectId, match.id));

    let totalTasks = 0;
    let completedTasks = 0;

    if (projectLists.length > 0) {
      const listIds = projectLists.map((l) => l.id);
      for (const lId of listIds) {
        const listTasks = await db
          .select({ id: tasks.id, priority: tasks.priority, status: tasks.status })
          .from(tasks)
          .where(eq(tasks.listId, lId));

        totalTasks += listTasks.length;
        completedTasks += listTasks.filter(
          (t) => t.status === "Completed" || t.status === "Done",
        ).length;
      }
    }

    const members = await db
      .select()
      .from(projectMembers)
      .where(eq(projectMembers.projectId, match.id));

    return {
          ...match,
          ownerName: user.name, 
          listCount: projectLists.length,
          taskCount: totalTasks,
          completedTaskCount: completedTasks,
          memberCount: members.length,
          members,
    };
  } catch (error) {
    console.error("[getProjectBySlugAction] Error resolving slug:", error);
    return null;
  }
}

/* ─────────────────────────────────────────────────────────────
   Create Project Action
───────────────────────────────────────────────────────────── */
export async function createProjectAction(data: CreateProjectFormValues) {
  try {
    const user = await syncUser();
    if (!user) {
      return { success: false, error: "Unauthorized. Please sign in." };
    }

    const validated = createProjectSchema.safeParse(data);
    if (!validated.success) {
      const firstError = validated.error.issues[0]?.message || "Invalid project data";
      return { success: false, error: firstError };
    }

    const { name, description, dueDate, categories, techStack, status, priority, members } =
      validated.data;

    const newProject = await db.transaction(async (tx) => {
      const [project] = await tx
        .insert(projects)
        .values({
          name,
          description: description || null,
          ownerId: user.id,
          dueDate: dueDate ? new Date(dueDate) : null,
          categories,
          techStack,
          status,
          priority,
        })
        .returning();

      if (members.length > 0) {
        await tx.insert(projectMembers).values(
          members.map((m) => ({
            projectId: project.id,
            name: m.name,
            role: m.role,
          })),
        );
      }

      // Seed the four default Kanban columns
      await tx.insert(lists).values([
        { name: "To Do",       projectId: project.id, position: 0 },
        { name: "In Progress", projectId: project.id, position: 1 },
        { name: "Review",      projectId: project.id, position: 2 },
        { name: "Done",        projectId: project.id, position: 3 },
      ]);

      return project;
    });

    revalidatePath("/dashboard");
    revalidatePath("/projects");

    return { success: true, project: newProject };
  } catch (error: unknown) {
    console.error("[createProjectAction] Error creating project:", error);
    return { success: false, error: "Failed to create project. Please try again." };
  }
}

/* ─────────────────────────────────────────────────────────────
   Update Project Action
───────────────────────────────────────────────────────────── */
export async function updateProjectAction(data: UpdateProjectFormValues) {
  try {
    const user = await syncUser();
    if (!user) {
      return { success: false, error: "Unauthorized. Please sign in." };
    }

    const validated = updateProjectSchema.safeParse(data);
    if (!validated.success) {
      const firstError = validated.error.issues[0]?.message || "Invalid project data";
      return { success: false, error: firstError };
    }

    const { id, name, description, dueDate, categories, techStack, status, priority, members } =
      validated.data;

    const existing = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, id), eq(projects.ownerId, user.id)));

    if (existing.length === 0) {
      return { success: false, error: "Project not found or access denied." };
    }

    const updatedProject = await db.transaction(async (tx) => {
      const [project] = await tx
        .update(projects)
        .set({
          name,
          description: description || null,
          dueDate: dueDate ? new Date(dueDate) : null,
          categories,
          techStack,
          status,
          priority,
          updatedAt: new Date(),
        })
        .where(eq(projects.id, id))
        .returning();

      // Simplest correct approach: replace members wholesale
      await tx.delete(projectMembers).where(eq(projectMembers.projectId, id));

      if (members.length > 0) {
        await tx.insert(projectMembers).values(
          members.map((m) => ({
            projectId: id,
            name: m.name,
            role: m.role,
          })),
        );
      }

      return project;
    });

    revalidatePath("/dashboard");
    revalidatePath("/projects");
    revalidatePath(`/projects/${id}`);

    return { success: true, project: updatedProject };
  } catch (error: unknown) {
    console.error("[updateProjectAction] Error updating project:", error);
    return { success: false, error: "Failed to update project. Please try again." };
  }
}

/* ─────────────────────────────────────────────────────────────
   Delete Project Action (Cascades to lists, tasks, comments, members)
───────────────────────────────────────────────────────────── */
export async function deleteProjectAction(projectId: string) {
  try {
    const user = await syncUser();
    if (!user) {
      return { success: false, error: "Unauthorized. Please sign in." };
    }

    const existing = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.ownerId, user.id)));

    if (existing.length === 0) {
      return { success: false, error: "Project not found or access denied." };
    }

    await db.delete(projects).where(eq(projects.id, projectId));

    revalidatePath("/dashboard");
    revalidatePath("/projects");

    return { success: true };
  } catch (error: unknown) {
    console.error("[deleteProjectAction] Error deleting project:", error);
    return { success: false, error: "Failed to delete project. Please try again." };
  }
}