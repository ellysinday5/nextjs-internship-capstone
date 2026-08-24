"use client";

import { useUser } from "@clerk/nextjs";
import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";

export interface UserProfile {
  fullName: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

interface UserProfileContextType {
  profile: UserProfile;
  updateProfile: (newProfile: Partial<UserProfile>) => void;
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

      setProfile({
        fullName: savedProfile.fullName || clerkName || "User",
        email: savedProfile.email || clerkEmail || "",
        role: savedProfile.role || "Member",
        avatarUrl: savedProfile.avatarUrl || clerkAvatar,
      });
    } else if (Object.keys(savedProfile).length > 0) {
      setProfile((prev) => ({ ...prev, ...savedProfile }));
    }
  }, [isLoaded, user]);

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
    <UserProfileContext.Provider value={{ profile, updateProfile }}>
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
    };
  }
  return context;
}
