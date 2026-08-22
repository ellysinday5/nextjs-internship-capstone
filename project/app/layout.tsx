import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type React from "react";
import "./globals.css";
import { AuthToast } from "@/components/auth/auth-toast";
import { SileoToaster } from "@/components/ui/sileo-toaster";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { UserProfileProvider } from "@/context/user-profile-context";
import { ClerkProvider } from "@clerk/nextjs";
import { QueryProvider } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Project Management Tool",
  description: "Team collaboration and project management platform",
  generator: "v0.dev",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ClerkProvider
          appearance={{
            elements: {
              footer: "hidden",
              footerAction: "hidden",
            },
          }}
        >
          <QueryProvider>
            <ThemeProvider>
              <UserProfileProvider>
                <AuthToast />
                <SileoToaster />
                {children}
              </UserProfileProvider>
            </ThemeProvider>
          </QueryProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
