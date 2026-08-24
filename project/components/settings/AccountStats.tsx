"use client";

import { useProjects } from "@/hooks/use-projects";
import { useUser } from "@clerk/nextjs";
import React from "react";

interface AccountStatsProps {
  memberSince?: string;
  projectsCount?: string | number;
  tasksDoneCount?: string | number;
  teamsCount?: string | number;
}

export function AccountStats({
  memberSince,
  projectsCount,
  tasksDoneCount,
  teamsCount,
}: AccountStatsProps) {
  const { user } = useUser();
  const { projects } = useProjects();

  const realProjectsCount = projectsCount ?? (projects?.length || 0);
  const calculatedTasksDone =
    tasksDoneCount ?? (projects?.reduce((sum, p) => sum + (p.taskCount ?? 0), 0) || 0);
  const realTeamsCount = teamsCount ?? 1;

  const realMemberSince =
    memberSince ??
    (user?.createdAt
      ? new Date(user.createdAt).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        })
      : "Aug 2026");

  const stats = [
    { label: "Projects", value: realProjectsCount },
    { label: "Tasks Done", value: calculatedTasksDone },
    { label: "Teams", value: realTeamsCount },
  ];

  return (
    <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#14263e] space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Account Overview</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Your workspace metrics and membership.
          </p>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Member since {realMemberSince}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 pt-1">
        {stats.map((item) => (
          <div
            key={item.label}
            className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 text-center"
          >
            <span className="block text-2xl font-bold text-slate-900 dark:text-white">
              {item.value}
            </span>
            <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
