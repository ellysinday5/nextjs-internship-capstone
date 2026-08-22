"use server";

import { db } from "@/lib/db";
import { syncUser } from "@/lib/db/auth";
import {
  lists,
  projectMembers,
  projects,
  tasks,
  users,
  workspaceMembers,
  workspaces,
} from "@/lib/db/schema";
import { toSlug } from "@/lib/project-data";
import {
  type CreateProjectFormValues,
  type UpdateProjectFormValues,
  createProjectSchema,
  updateProjectSchema,
} from "@/lib/project-schemas";
import { and, eq, inArray, or, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

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

    // 1. Fetch project IDs where the user is a member
    const memberProjectRows = await db
      .select({ projectId: projectMembers.projectId })
      .from(projectMembers)
      .where(eq(projectMembers.userId, user.id));

    const memberProjectIds = memberProjectRows.map((m) => m.projectId);

    // 2. Query projects where user is owner OR member
    const whereClause =
      memberProjectIds.length > 0
        ? or(eq(projects.ownerId, user.id), inArray(projects.id, memberProjectIds))
        : eq(projects.ownerId, user.id);

    const userProjects = await db
      .select({
        id: projects.id,
        name: projects.name,
        description: projects.description,
        ownerId: projects.ownerId,
        workspaceId: projects.workspaceId,
        dueDate: projects.dueDate,
        categories: projects.categories,
        techStack: projects.techStack,
        status: projects.status,
        priority: projects.priority,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
        ownerName: users.name,
      })
      .from(projects)
      .leftJoin(users, eq(projects.ownerId, users.id))
      .where(whereClause)
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
          .select({
            id: projectMembers.id,
            name: projectMembers.name,
            role: projectMembers.role,
          })
          .from(projectMembers)
          .where(eq(projectMembers.projectId, p.id));

        return {
          id: p.id,
          name: p.name,
          description: p.description,
          ownerId: p.ownerId,
          ownerName: p.ownerName || "Project Owner",
          dueDate: p.dueDate,
          categories: p.categories,
          techStack: p.techStack,
          status: p.status,
          priority: p.priority,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
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

    // Check if slug is a UUID
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);

    // 1. Fetch user's member projects
    const memberProjectRows = await db
      .select({ projectId: projectMembers.projectId })
      .from(projectMembers)
      .where(eq(projectMembers.userId, user.id));

    const memberProjectIds = memberProjectRows.map((m) => m.projectId);

    const accessCondition =
      memberProjectIds.length > 0
        ? or(eq(projects.ownerId, user.id), inArray(projects.id, memberProjectIds))
        : eq(projects.ownerId, user.id);

    let projectRow:
      | {
          id: string;
          name: string;
          description: string | null;
          ownerId: string;
          workspaceId: string | null;
          dueDate: Date | null;
          categories: string[];
          techStack: string[];
          status: string;
          priority: string;
          createdAt: Date | null;
          updatedAt: Date | null;
          ownerName: string | null;
        }
      | undefined;

    if (isUuid) {
      const rows = await db
        .select({
          id: projects.id,
          name: projects.name,
          description: projects.description,
          ownerId: projects.ownerId,
          workspaceId: projects.workspaceId,
          dueDate: projects.dueDate,
          categories: projects.categories,
          techStack: projects.techStack,
          status: projects.status,
          priority: projects.priority,
          createdAt: projects.createdAt,
          updatedAt: projects.updatedAt,
          ownerName: users.name,
        })
        .from(projects)
        .leftJoin(users, eq(projects.ownerId, users.id))
        .where(and(eq(projects.id, slug), accessCondition))
        .limit(1);

      projectRow = rows[0];
    } else {
      const rows = await db
        .select({
          id: projects.id,
          name: projects.name,
          description: projects.description,
          ownerId: projects.ownerId,
          workspaceId: projects.workspaceId,
          dueDate: projects.dueDate,
          categories: projects.categories,
          techStack: projects.techStack,
          status: projects.status,
          priority: projects.priority,
          createdAt: projects.createdAt,
          updatedAt: projects.updatedAt,
          ownerName: users.name,
        })
        .from(projects)
        .leftJoin(users, eq(projects.ownerId, users.id))
        .where(accessCondition);

      projectRow = rows.find((p) => toSlug(p.name) === slug || p.id === slug);
    }

    if (!projectRow) return null;

    // Fetch lists, tasks, and members for this single project in parallel
    const [projectLists, projectTaskList, members] = await Promise.all([
      db.select({ id: lists.id }).from(lists).where(eq(lists.projectId, projectRow.id)),
      db
        .select({ id: tasks.id, status: tasks.status })
        .from(tasks)
        .innerJoin(lists, eq(tasks.listId, lists.id))
        .where(eq(lists.projectId, projectRow.id)),
      db
        .select({
          id: projectMembers.id,
          name: projectMembers.name,
          role: projectMembers.role,
        })
        .from(projectMembers)
        .where(eq(projectMembers.projectId, projectRow.id)),
    ]);

    const totalTasks = projectTaskList.length;
    const completedTasks = projectTaskList.filter(
      (t) => t.status === "Completed" || t.status === "Done" || t.status === "Complete",
    ).length;

    return {
      id: projectRow.id,
      name: projectRow.name,
      description: projectRow.description,
      ownerId: projectRow.ownerId,
      ownerName: projectRow.ownerName || "Project Owner",
      dueDate: projectRow.dueDate,
      categories: projectRow.categories || [],
      techStack: projectRow.techStack || [],
      status: projectRow.status,
      priority: projectRow.priority,
      createdAt: projectRow.createdAt,
      updatedAt: projectRow.updatedAt,
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
      // 1. Look up user's owned workspace or auto-create one if none exists
      let [workspace] = await tx
        .select({ id: workspaces.id })
        .from(workspaces)
        .where(eq(workspaces.ownerId, user.id))
        .limit(1);

      if (!workspace) {
        const ownerName = user.name || (user.email ? user.email.split("@")[0] : "User");
        const baseSlug = toSlug(ownerName + "-workspace") || "workspace";
        let slug = baseSlug;
        let counter = 1;
        while (true) {
          const existing = await tx
            .select({ id: workspaces.id })
            .from(workspaces)
            .where(eq(workspaces.slug, slug))
            .limit(1);
          if (existing.length === 0) break;
          counter++;
          slug = `${baseSlug}-${counter}`;
        }

        const [createdWs] = await tx
          .insert(workspaces)
          .values({
            name: `${ownerName}'s Workspace`,
            slug,
            ownerId: user.id,
          })
          .returning({ id: workspaces.id });

        await tx.insert(workspaceMembers).values({
          workspaceId: createdWs.id,
          userId: user.id,
          role: "owner",
        });

        workspace = createdWs;
      }

      const [project] = await tx
        .insert(projects)
        .values({
          name,
          description: description || null,
          ownerId: user.id,
          workspaceId: workspace.id,
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
        { name: "To Do", projectId: project.id, position: 0 },
        { name: "In Progress", projectId: project.id, position: 1 },
        { name: "Review", projectId: project.id, position: 2 },
        { name: "Done", projectId: project.id, position: 3 },
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

async function assertCanManageProject(projectId: string, userId: string): Promise<boolean> {
  const [project] = await db
    .select({ id: projects.id, ownerId: projects.ownerId, workspaceId: projects.workspaceId })
    .from(projects)
    .where(eq(projects.id, projectId));

  if (!project) return false;
  if (project.ownerId === userId) return true;

  // Check project role (owner / pm / admin)
  const [member] = await db
    .select({ role: projectMembers.role })
    .from(projectMembers)
    .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userId)));

  if (member) {
    const r = member.role.toLowerCase();
    if (r === "owner" || r === "pm" || r === "project manager" || r === "admin") {
      return true;
    }
  }

  // Check workspace role (owner / admin)
  if (project.workspaceId) {
    const [ws] = await db
      .select({ ownerId: workspaces.ownerId })
      .from(workspaces)
      .where(eq(workspaces.id, project.workspaceId));
    if (ws && ws.ownerId === userId) return true;

    const [wsMember] = await db
      .select({ role: workspaceMembers.role })
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, project.workspaceId),
          eq(workspaceMembers.userId, userId),
        ),
      );

    if (wsMember) {
      const wr = wsMember.role.toLowerCase();
      if (wr === "owner" || wr === "admin") return true;
    }
  }

  return false;
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

    const canManage = await assertCanManageProject(id, user.id);
    if (!canManage) {
      return { success: false, error: "Only project managers and owners can update this project." };
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

    const canManage = await assertCanManageProject(projectId, user.id);
    if (!canManage) {
      return { success: false, error: "Only project managers and owners can delete this project." };
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
