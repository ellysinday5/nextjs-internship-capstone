/**
 * lib/skeleton-cache.ts
 *
 * Persists and retrieves last-known item counts to prevent jarring layout shifts / "popping"
 * when data loading skeletons transition into real fetched content.
 *
 * Keys are namespaced by user ID or entity/workspace ID (e.g. `skeleton-count:projects:${userId}`)
 * so that on shared devices or browser profiles, one user's estimate never leaks to another user.
 */

export function getCachedCount(
  category: string,
  namespaceId: string | null | undefined = "anon",
  fallback: number = 3,
): number {
  if (typeof window === "undefined") return fallback;
  try {
    const key = `skeleton-count:${category}:${namespaceId || "anon"}`;
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = parseInt(raw, 10);
    // Enforce bounds: min 1, max 24, NaN check
    if (isNaN(parsed) || parsed <= 0) return fallback;
    return Math.min(Math.max(parsed, 1), 24);
  } catch {
    return fallback;
  }
}

export function setCachedCount(
  category: string,
  namespaceId: string | null | undefined = "anon",
  count: number = 3,
): void {
  if (typeof window === "undefined") return;
  try {
    if (typeof count === "number" && !isNaN(count) && count > 0) {
      const key = `skeleton-count:${category}:${namespaceId || "anon"}`;
      localStorage.setItem(key, String(count));
    }
  } catch {}
}
