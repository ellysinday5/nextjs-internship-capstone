export const VALID_STATUSES = [
  "On track",
  "At risk",
  "Off track",
  "On hold",
  "Complete",
  "Dropped",
] as const;

export type TaskStatus = (typeof VALID_STATUSES)[number];

export function deriveStatusForList(
  list: { id: string; name: string },
  allLists: { id: string; name: string }[],
): TaskStatus {
  const name = list.name.toLowerCase();
  const isLastList = allLists[allLists.length - 1]?.id === list.id;

  if (/done|complete|finish/.test(name) || isLastList) return "Complete";
  if (/risk|block|stuck/.test(name)) return "At risk";
  if (/off.?track|delay/.test(name)) return "Off track";
  if (/hold|backlog|paused/.test(name)) return "On hold";
  if (/drop|cancel|archiv/.test(name)) return "Dropped";

  return "On track";
}
