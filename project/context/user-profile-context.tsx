"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface UserProfile {
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
  fullName: "Ellen Grace Sinday",
  email: "ellen.sinday@stratpoint.com",
  role: "Full Stack Developer",
};

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export function UserProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);

  // Load saved profile from localStorage if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem("syntraflow_user_profile");
      if (saved) {
        setProfile(JSON.parse(saved));
      }
    } catch {
      // Ignore fallback
    }
  }, []);

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
