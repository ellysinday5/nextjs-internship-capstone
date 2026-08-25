import { describe, it, expect } from "vitest";
import { matchFilterRule, type FilterRule } from "@/hooks/use-task-filters";
import type { TaskItem } from "@/components/tasks/task-details";

const mockTasks: TaskItem[] = [
  {
    id: "task-1",
    title: "Implement auth flow",
    priority: "High",
    status: "On track",
    assignee: { id: "u1", name: "Ellen Grace Sinday", initials: "ES" },
    dueDate: "Aug 20",
    dueDateISO: "2026-08-20",
    sectionId: "Todo",
  },
  {
    id: "task-2",
    title: "Fix navigation bug",
    priority: "Medium",
    status: "At risk",
    assignee: { id: "u2", name: "John Doe", initials: "JD" },
    dueDate: "Aug 25",
    dueDateISO: "2026-08-25",
    sectionId: "Todo",
  },
  {
    id: "task-3",
    title: "Write documentation",
    priority: "Low",
    status: "Complete",
    assignee: undefined,
    dueDate: undefined,
    dueDateISO: undefined,
    sectionId: "Done",
  },
  {
    id: "task-4",
    title: "Design dashboard widgets",
    priority: "High",
    status: "At risk",
    assignee: { id: "u1", name: "Ellen Grace Sinday", initials: "ES" },
    dueDate: "Sep 05",
    dueDateISO: "2026-09-05",
    sectionId: "In Progress",
  },
];

describe("matchFilterRule", () => {
  it("filters by Status with 'Is' operator", () => {
    const rule: FilterRule = { id: "1", field: "Status", operator: "Is", value: "On track" };
    const filtered = mockTasks.filter((t) => matchFilterRule(t, rule));
    expect(filtered.map((t) => t.id)).toEqual(["task-1"]);
  });

  it("filters by Status with 'Is not' operator", () => {
    const rule: FilterRule = { id: "1", field: "Status", operator: "Is not", value: "Complete" };
    const filtered = mockTasks.filter((t) => matchFilterRule(t, rule));
    expect(filtered.map((t) => t.id)).toEqual(["task-1", "task-2", "task-4"]);
  });

  it("filters by Priority with 'Is' operator", () => {
    const rule: FilterRule = { id: "1", field: "Priority", operator: "Is", value: "High" };
    const filtered = mockTasks.filter((t) => matchFilterRule(t, rule));
    expect(filtered.map((t) => t.id)).toEqual(["task-1", "task-4"]);
  });

  it("filters by Assignee with 'Is' operator", () => {
    const rule: FilterRule = { id: "1", field: "Assignee", operator: "Is", value: "Ellen Grace Sinday" };
    const filtered = mockTasks.filter((t) => matchFilterRule(t, rule));
    expect(filtered.map((t) => t.id)).toEqual(["task-1", "task-4"]);
  });

  it("filters by Assignee with 'Is set' and 'Is not set' operators", () => {
    const ruleSet: FilterRule = { id: "1", field: "Assignee", operator: "Is set", value: "" };
    const filteredSet = mockTasks.filter((t) => matchFilterRule(t, ruleSet));
    expect(filteredSet.map((t) => t.id)).toEqual(["task-1", "task-2", "task-4"]);

    const ruleNotSet: FilterRule = { id: "2", field: "Assignee", operator: "Is not set", value: "" };
    const filteredNotSet = mockTasks.filter((t) => matchFilterRule(t, ruleNotSet));
    expect(filteredNotSet.map((t) => t.id)).toEqual(["task-3"]);
  });

  it("combines multiple filter rules using AND logic", () => {
    const rules: FilterRule[] = [
      { id: "1", field: "Priority", operator: "Is", value: "High" },
      { id: "2", field: "Status", operator: "Is", value: "At risk" },
      { id: "3", field: "Assignee", operator: "Is", value: "Ellen Grace Sinday" },
    ];

    const filtered = mockTasks.filter((t) => rules.every((rule) => matchFilterRule(t, rule)));
    expect(filtered.map((t) => t.id)).toEqual(["task-4"]);
  });

  it("filters by Due date", () => {
    const rule: FilterRule = { id: "1", field: "Due date", operator: "Is", value: "Aug" };
    const filtered = mockTasks.filter((t) => matchFilterRule(t, rule));
    expect(filtered.map((t) => t.id)).toEqual(["task-1", "task-2"]);
  });

  it("filters by Task Name using 'Contains'", () => {
    const rule: FilterRule = { id: "1", field: "Task Name", operator: "Contains", value: "dashboard" };
    const filtered = mockTasks.filter((t) => matchFilterRule(t, rule));
    expect(filtered.map((t) => t.id)).toEqual(["task-4"]);
  });
});
