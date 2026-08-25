"use client";

import { type ProjectWithStats, getProjectsAction } from "@/actions/project-actions";
import type { ProjectItem } from "@/lib/project-data";
import { calculateCompletionPercentage } from "@/lib/project-stats";
import { getCachedCount, setCachedCount } from "@/lib/skeleton-cache";
import { useUser } from "@clerk/nextjs";
import { useCallback, useEffect, useMemo, useState } from "react";

export type DropdownKey = "status" | "priority" | "owner" | "team" | "members" | null;
export type ViewMode = "grid" | "table";

export function useProjectFilters() {
  const { user } = useUser();
  const userId = user?.id;

  const [dbProjects, setDbProjects] = useState<ProjectWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [skeletonCount, setSkeletonCount] = useState(3);

  useEffect(() => {
    setSkeletonCount(getCachedCount("projects", userId, 3));
  }, [userId]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedPriority, setSelectedPriority] = useState("All");
  const [selectedOwner, setSelectedOwner] = useState("All");
  const [selectedTeam, setSelectedTeam] = useState("All");
  const [selectedMembers, setSelectedMembers] = useState("All");
  const [openDropdown, setOpenDropdown] = useState<DropdownKey>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    const result = await getProjectsAction();
    setDbProjects(result);
    if (result.length > 0) {
      setCachedCount("projects", userId, result.length);
      setSkeletonCount(result.length);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const allProjectItems = useMemo<ProjectItem[]>(() => {
    return dbProjects.map((p) => {
      const completionPercent =
        p.completionPercentage ??
        calculateCompletionPercentage(p.completedTaskCount || 0, p.taskCount || 0);

      return {
        id: p.id,
        name: p.name,
        description: p.description || "No description provided.",
        techStack: p.techStack && p.techStack.length > 0 ? p.techStack : ["Drizzle", "PostgreSQL", "Clerk"],
        status: completionPercent === 100 ? "Completed" : p.status || "In Progress",
        priority: p.priority || "Medium",
        progress: completionPercent,
        members: p.memberCount || 1,
        owner: p.ownerName || "Unassigned",
        teamName: "General",
        tasksCount: p.taskCount,
        updatedAt: p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : "Just now",
        color: "bg-[#00b4d8]",
        isDb: true,
        dbProject: p,
      };
    });
  }, [dbProjects]);

  const filteredProjects = useMemo(() => {
    return allProjectItems.filter((project) => {
      const matchesSearch =
        searchQuery === "" ||
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.techStack.some((tech) => tech.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = selectedStatus === "All" || project.status === selectedStatus;
      const matchesPriority = selectedPriority === "All" || project.priority === selectedPriority;
      const matchesOwner = selectedOwner === "All" || project.owner === selectedOwner;
      const matchesTeam = selectedTeam === "All" || project.teamName === selectedTeam;

      let matchesMembers = true;
      if (selectedMembers === "1 Dev") matchesMembers = project.members === 1;
      else if (selectedMembers === "2-4 Devs")
        matchesMembers = project.members >= 2 && project.members <= 4;
      else if (selectedMembers === "5+ Devs") matchesMembers = project.members >= 5;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority &&
        matchesOwner &&
        matchesTeam &&
        matchesMembers
      );
    });
  }, [
    allProjectItems,
    searchQuery,
    selectedStatus,
    selectedPriority,
    selectedOwner,
    selectedTeam,
    selectedMembers,
  ]);

  const hasActiveFilters =
    searchQuery !== "" ||
    selectedStatus !== "All" ||
    selectedPriority !== "All" ||
    selectedOwner !== "All" ||
    selectedTeam !== "All" ||
    selectedMembers !== "All";

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedStatus("All");
    setSelectedPriority("All");
    setSelectedOwner("All");
    setSelectedTeam("All");
    setSelectedMembers("All");
  };

  const toggleDropdown = (key: DropdownKey) => {
    setOpenDropdown((prev) => (prev === key ? null : key));
  };

  const teamOptions = useMemo(() => {
    const teams = new Set<string>();
    for (const p of allProjectItems) {
      if (p.teamName) teams.add(p.teamName);
    }
    return ["All", ...(teams.size > 0 ? Array.from(teams) : ["General"])];
  }, [allProjectItems]);

  return {
    loading,
    filteredProjects,
    fetchProjects,
    searchQuery,
    setSearchQuery,
    selectedStatus,
    setSelectedStatus,
    selectedPriority,
    setSelectedPriority,
    selectedOwner,
    setSelectedOwner,
    selectedTeam,
    setSelectedTeam,
    teamOptions,
    selectedMembers,
    setSelectedMembers,
    openDropdown,
    setOpenDropdown,
    viewMode,
    setViewMode,
    hasActiveFilters,
    clearFilters,
    toggleDropdown,
    skeletonCount,
  };
}
