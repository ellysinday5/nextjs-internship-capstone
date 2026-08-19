"use client";

import type React from "react";
import { createContext, useContext, useState } from "react";

interface ProjectTitleContextType {
  projectTitle: string | null;
  setProjectTitle: (title: string | null) => void;
}

const ProjectTitleContext = createContext<ProjectTitleContextType>({
  projectTitle: null,
  setProjectTitle: () => {},
});

export function ProjectTitleProvider({ children }: { children: React.ReactNode }) {
  const [projectTitle, setProjectTitle] = useState<string | null>(null);
  return (
    <ProjectTitleContext.Provider value={{ projectTitle, setProjectTitle }}>
      {children}
    </ProjectTitleContext.Provider>
  );
}

export function useProjectTitle() {
  return useContext(ProjectTitleContext);
}
