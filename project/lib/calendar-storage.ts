export interface CalendarEventItem {
  id: string;
  title: string;
  description?: string;
  type: string;
  date: string;
  rawDate: string;
  time?: string;
  priority?: "High" | "Medium" | "Low";
  projectName?: string;
  locationLink?: string;
  completed?: boolean;
  archived?: boolean;
  isDraft?: boolean;
  createdAt?: string;
  invitees?: string[];
  recurringDays?: number[];
}

export const BASE_STORAGE_KEY = "syntraflow_custom_events";

/**
 * Returns a user-scoped storage key if userId is provided,
 * preventing data bleeding between different accounts on the same browser.
 */
export function getCalendarStorageKey(userId?: string | null): string {
  if (userId) {
    return `${BASE_STORAGE_KEY}_${userId}`;
  }
  return BASE_STORAGE_KEY;
}

/**
 * Detects legacy hardcoded seed/mock events (e.g. dl-1, dl-2, or "Ellen's first project").
 */
export function isLegacyMockEvent(e: unknown): boolean {
  if (!e || typeof e !== "object") return true;
  const item = e as Partial<CalendarEventItem>;
  if (typeof item.id === "string" && item.id.startsWith("dl-")) return true;
  if (item.projectName === "Ellen's first project") return true;
  if (
    item.title === "Website Redesign" &&
    (item.rawDate === "2026-07-25" || item.date === "July 25, 2026" || item.date === "Dec 15, 2024")
  ) {
    return true;
  }
  if (
    item.title === "Team Sync Meeting" &&
    (item.rawDate === "2026-07-26" || item.date === "July 26, 2026" || item.date === "Dec 18, 2024")
  ) {
    return true;
  }
  return false;
}

/**
 * Safely loads custom events from localStorage, stripping out any legacy mock data.
 */
export function loadCleanEvents(storageKey: string): CalendarEventItem[] {
  if (typeof window === "undefined") return [];

  // Also purge legacy mock data from the un-scoped key if present
  try {
    const rawLegacy = localStorage.getItem(BASE_STORAGE_KEY);
    if (rawLegacy) {
      const parsedLegacy = JSON.parse(rawLegacy);
      if (Array.isArray(parsedLegacy)) {
        const cleanedLegacy = parsedLegacy.filter((item) => !isLegacyMockEvent(item));
        if (cleanedLegacy.length !== parsedLegacy.length) {
          localStorage.setItem(BASE_STORAGE_KEY, JSON.stringify(cleanedLegacy));
        }
      }
    }
  } catch {}

  let stored: CalendarEventItem[] = [];
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) stored = parsed;
    }
  } catch {}

  // Filter out any legacy mock events
  const cleaned = stored.filter((item) => !isLegacyMockEvent(item));

  // Deduplicate by ID
  const byId = new Map<string, CalendarEventItem>();
  for (const item of cleaned) {
    if (item.id) byId.set(item.id, item);
  }
  const result = Array.from(byId.values());

  // If mock data was stripped or duplicates existed, sync back
  if (cleaned.length !== stored.length) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(result));
    } catch {}
  }

  return result;
}

/**
 * Safely saves custom events to localStorage, deduplicating and removing mock data.
 */
export function saveCleanEvents(storageKey: string, events: CalendarEventItem[]): void {
  if (typeof window === "undefined") return;
  const byId = new Map<string, CalendarEventItem>();
  for (const item of events) {
    if (item.id && !isLegacyMockEvent(item)) {
      byId.set(item.id, item);
    }
  }
  const deduped = Array.from(byId.values());
  try {
    localStorage.setItem(storageKey, JSON.stringify(deduped));
  } catch {}
}
