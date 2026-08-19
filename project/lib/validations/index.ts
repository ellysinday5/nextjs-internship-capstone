/**
 * lib/validations/index.ts
 *
 * Central barrel export for all Zod validation schemas.
 * Import from "@/lib/validations" to access any schema,
 * or import directly from the specific sub-module for
 * better tree-shaking (e.g. "@/lib/validations/project").
 */

export * from "./project";
export * from "./task";
export * from "./auth";
export * from "./list";
export * from "./comment";
export * from "./workspace";
