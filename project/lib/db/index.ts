import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);

export const db = drizzle(sql, { schema });

export const queries = {
  projects: {
    getAll: () => {
      console.log("TODO: Task 4.1 - Implement project CRUD operations");
      return [];
    },
    getById: (id: string) => {
      console.log(`TODO: Get project by ID: ${id}`);
      return null;
    },
    create: (data: any) => {
      console.log("TODO: Create project", data);
      return null;
    },
    update: (id: string, data: any) => {
      console.log(`TODO: Update project ${id}`, data);
      return null;
    },
    delete: (id: string) => {
      console.log(`TODO: Delete project ${id}`);
      return null;
    },
  },
  tasks: {
    getByProject: (projectId: string) => {
      console.log(`TODO: Task 4.4 - Get tasks for project ${projectId}`);
      return [];
    },
    create: (data: any) => {
      console.log("TODO: Create task", data);
      return null;
    },
    update: (id: string, data: any) => {
      console.log(`TODO: Update task ${id}`, data);
      return null;
    },
    delete: (id: string) => {
      console.log(`TODO: Delete task ${id}`);
      return null;
    },
  },
};
