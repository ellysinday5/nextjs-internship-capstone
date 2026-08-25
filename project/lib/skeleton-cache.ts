/**
 * lib/skeleton-cache.ts
 *
 * Persists and retrieves last-known item counts to prevent jarring layout shifts / "popping"
 * when data loading skeletons transition into real fetched content.
 */

export function getCachedCount(key: string, fallback: number = 3): number {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(`syntraflow_count_${key}`);
    if (!raw) return fallback;
    const parsed = parseInt(raw, 10);
    // Enforce bounds: min 1, max 24, NaN check
    if (isNaN(parsed) || parsed <= 0) return fallback;
    return Math.min(Math.max(parsed, 1), 24);
  } catch {
    return fallback;
  }
}

export function setCachedCount(key: string, count: number): void {
  if (typeof window === "undefined") return;
  try {
    if (typeof count === "number" && !isNaN(count) && count > 0) {
      localStorage.setItem(`syntraflow_count_${key}`, String(count));
    }
  } catch {}
}
