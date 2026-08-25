/**
 * lib/project-stats.ts
 *
 * Single source of truth for project completion percentage and task completion checks.
 */

/**
 * Determines whether a task status string represents a completed state.
 * Canonical completed statuses: "Complete", "Completed", "Done" (case-insensitive).
 */
export function isTaskCompleted(status?: string | null): boolean {
  if (!status) return false;
  return status.trim().toLowerCase() === "complete";
}

/**
 * Calculates completion percentage given completed task count and total task count.
 *
 * Edge cases:
 * - Zero tasks -> strictly 0% (not NaN, not undefined, not skipped).
 * - All tasks completed -> strictly 100%.
 * - Clamped strictly between 0 and 100.
 */
export function calculateCompletionPercentage(
  completedTasks: number,
  totalTasks: number,
): number {
  if (!totalTasks || totalTasks <= 0) return 0;
  if (!completedTasks || completedTasks <= 0) return 0;
  if (completedTasks >= totalTasks) return 100;
  const percentage = Math.round((completedTasks / totalTasks) * 100);
  return Math.min(100, Math.max(0, percentage));
}
