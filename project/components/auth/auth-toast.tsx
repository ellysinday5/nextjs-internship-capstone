"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { sileo } from "@/utils/alerts";

export function AuthToast() {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded) return;

    const stored = sessionStorage.getItem("auth_session_id");

    if (user?.id) {
      if (!stored) {
        sessionStorage.setItem("auth_session_id", user.id);
        const name =
          user.firstName ||
          user.username ||
          user.primaryEmailAddress?.emailAddress?.split("@")[0] ||
          "there";
        sileo.success(`You have successfully logged in. Welcome, ${name}!`, "Login Success");
      } else if (stored !== user.id) {
        sessionStorage.setItem("auth_session_id", user.id);
        sileo.success("You have successfully logged in.", "Login Success");
      }
    } else {
      if (stored) {
        sessionStorage.removeItem("auth_session_id");
        sileo.info("You have been signed out successfully.", "Signed Out");
      }
    }
  }, [user, isLoaded]);

  return null;
}
