"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { getProjectsAction, ProjectWithStats } from "@/actions/project-actions";
import { ProjectItem } from "@/lib/project-data";

export type DropdownKey = "status" | "priority" | "category" | "owner" | "team" | "members" | null;
export type ViewMode = "grid" | "table";

export function useProjectFilters() {
  const [dbProjects, setDbProjects] = useState<ProjectWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
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
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const allProjectItems = useMemo<ProjectItem[]>(() => {
    const ownerOptions = ["Ellen Grace Sinday", "Aj Lopez", "John Doe"];
    const teamOptions = ["Core Platform", "Frontend Squad", "AI & Mobile", "DevOps Team"];

    return dbProjects.map((p, idx) => {
      const completionPercent =
        p.taskCount > 0 ? Math.round((p.completedTaskCount / p.taskCount) * 100) : 0;

      return {
        id: p.id,
        name: p.name,
        description: p.description || "No description provided.",
        techStack: ["Drizzle", "PostgreSQL", "Clerk"],
        category: "Frontend",
        status: completionPercent === 100 ? "Completed" : "In Progress",
        priority: "High",
        progress: completionPercent,
        members: 1,
        owner: ownerOptions[idx % ownerOptions.length],
        teamName: teamOptions[idx % teamOptions.length],
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

      const matchesCategory = selectedCategory === "All" || project.category === selectedCategory;
      const matchesStatus = selectedStatus === "All" || project.status === selectedStatus;
      const matchesPriority = selectedPriority === "All" || project.priority === selectedPriority;
      const matchesOwner = selectedOwner === "All" || project.owner === selectedOwner;
      const matchesTeam = selectedTeam === "All" || project.teamName === selectedTeam;

      let matchesMembers = true;
      if (selectedMembers === "1 Dev") matchesMembers = project.members === 1;
      else if (selectedMembers === "2-4 Devs") matchesMembers = project.members >= 2 && project.members <= 4;
      else if (selectedMembers === "5+ Devs") matchesMembers = project.members >= 5;

      return matchesSearch && matchesCategory && matchesStatus && matchesPriority && matchesOwner && matchesTeam && matchesMembers;
    });
  }, [allProjectItems, searchQuery, selectedCategory, selectedStatus, selectedPriority, selectedOwner, selectedTeam, selectedMembers]);

  const hasActiveFilters =
    searchQuery !== "" ||
    selectedCategory !== "All" ||
    selectedStatus !== "All" ||
    selectedPriority !== "All" ||
    selectedOwner !== "All" ||
    selectedTeam !== "All" ||
    selectedMembers !== "All";

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedStatus("All");
    setSelectedPriority("All");
    setSelectedOwner("All");
    setSelectedTeam("All");
    setSelectedMembers("All");
  };

  const toggleDropdown = (key: DropdownKey) => {
    setOpenDropdown((prev) => (prev === key ? null : key));
  };

  return {
    loading,
    filteredProjects,
    fetchProjects,
    searchQuery, setSearchQuery,
    selectedCategory, setSelectedCategory,
    selectedStatus, setSelectedStatus,
    selectedPriority, setSelectedPriority,
    selectedOwner, setSelectedOwner,
    selectedTeam, setSelectedTeam,
    selectedMembers, setSelectedMembers,
    openDropdown, setOpenDropdown,
    viewMode, setViewMode,
    hasActiveFilters,
    clearFilters,
    toggleDropdown,
  };
}
