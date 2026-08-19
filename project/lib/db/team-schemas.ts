/**
 * lib/db/team-schemas.ts
 *
 * Canonical definitions have moved to lib/validations/workspace.ts
 * (team schemas are co-located with workspace since teams are a
 * workspace-scoped resource).
 * This file is kept as a compatibility shim so existing imports
 * from "@/lib/db/team-schemas" continue to resolve without change.
 */
export * from "@/lib/validations/workspace";
