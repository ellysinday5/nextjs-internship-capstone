"use client";

import { getUserWorkspaceRoleAction } from "@/actions/member-actions";
import { useUser } from "@clerk/nextjs";
import type React from "react";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

export interface UserProfile {
  fullName: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

interface UserProfileContextType {
  profile: UserProfile;
  updateProfile: (newProfile: Partial<UserProfile>) => void;
  refreshRole: () => Promise<void>;
}

const defaultProfile: UserProfile = {
  fullName: "",
  email: "",
  role: "Member",
};

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export function UserProfileProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);

  const refreshRole = useCallback(async () => {
    try {
      const res = await getUserWorkspaceRoleAction();
      if (res.role) {
        setProfile((prev) => ({ ...prev, role: res.role }));
      }
    } catch (err) {
      console.error("[UserProfileProvider] Failed to fetch workspace role:", err);
    }
  }, []);

  useEffect(() => {
    let savedProfile: Partial<UserProfile> = {};
    try {
      const saved = localStorage.getItem("syntraflow_user_profile");
      if (saved) {
        savedProfile = JSON.parse(saved);
      }
    } catch {
      // Ignore fallback
    }

    if (isLoaded && user) {
      const clerkName =
        user.fullName ||
        [user.firstName, user.lastName].filter(Boolean).join(" ") ||
        user.username ||
        "";
      const clerkEmail = user.primaryEmailAddress?.emailAddress || "";
      const clerkAvatar = user.imageUrl || "";

      setProfile((prev) => ({
        fullName: savedProfile.fullName || clerkName || "User",
        email: savedProfile.email || clerkEmail || "",
        role: prev.role || "Member",
        avatarUrl: savedProfile.avatarUrl || clerkAvatar,
      }));

      // Fetch actual role from active workspace
      refreshRole();
    } else if (Object.keys(savedProfile).length > 0) {
      setProfile((prev) => ({ ...prev, ...savedProfile }));
    }
  }, [isLoaded, user, refreshRole]);

  // Listen to workspace change events and window focus to keep role in sync
  useEffect(() => {
    function handleWorkspaceChange() {
      refreshRole();
    }
    window.addEventListener("syntraflow:workspace-changed", handleWorkspaceChange);
    window.addEventListener("focus", handleWorkspaceChange);

    return () => {
      window.removeEventListener("syntraflow:workspace-changed", handleWorkspaceChange);
      window.removeEventListener("focus", handleWorkspaceChange);
    };
  }, [refreshRole]);

  const updateProfile = (newProfile: Partial<UserProfile>) => {
    setProfile((prev) => {
      const updated = { ...prev, ...newProfile };
      try {
        localStorage.setItem("syntraflow_user_profile", JSON.stringify(updated));
      } catch {
        // Ignore fallback
      }
      return updated;
    });
  };

  return (
    <UserProfileContext.Provider value={{ profile, updateProfile, refreshRole }}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (!context) {
    return {
      profile: defaultProfile,
      updateProfile: () => {},
      refreshRole: async () => {},
    };
  }
  return context;
}
