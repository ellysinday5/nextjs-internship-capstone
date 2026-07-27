"use client"

import { SignIn } from "@clerk/nextjs"
import Link from "next/link"
import { AuthIllustration } from "@/components/auth-illustration"

export default function SignInPage() {
  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center p-4 sm:p-6 md:p-10 font-sans">
      {/* Centered Dark Navy Container matching Canva reference UI */}
      <div className="w-full max-w-[840px] bg-[#142843] rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 min-h-[460px]">
        {/* Left Side: White Illustration Card with Animated Spaceship */}
        <div className="w-full md:w-[350px] lg:w-[370px] h-[280px] sm:h-[320px] md:h-[360px] shrink-0">
          <AuthIllustration />
        </div>

        {/* Right Side: Clerk Sign In Form */}
        <div className="w-full md:w-[360px] flex flex-col items-center justify-center">
          {/* Custom Header matching mockup */}
          <div className="text-center mb-5">
            <h1 className="text-white text-2xl sm:text-3xl font-bold tracking-tight">
              Sign in to Syntra
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1.5 font-normal">
              Welcome back! Please enter your details to sign in.
            </p>
          </div>

          <div className="w-full">
            <SignIn
              signUpUrl="/sign-up"
              forceRedirectUrl="/dashboard"
              appearance={{
                // layout: {
                //   unsafe_disableDevelopmentModeWarnings: true,
                // },
                elements: {
                  rootBox: "w-full !bg-transparent",
                  cardBox: "!bg-transparent !shadow-none !border-0 !p-0 !m-0 !w-full",
                  card: "!bg-transparent !shadow-none !border-0 !p-0 !m-0 !w-full",
                  main: "!bg-transparent",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  formFieldLabel: "!text-white !font-semibold !text-xs !mb-1",
                  formFieldInput:
                    "!bg-[#c8d3e6] !border-0 !text-[#1e293b] placeholder:!text-[#64748b] !rounded-full !px-4 !py-2.5 !text-sm !font-medium focus:!ring-2 focus:!ring-[#00b4d8]",
                  socialButtonsBlockButton:
                    "!bg-[#c8d3e6] hover:!bg-[#b8c7dc] !border-0 !rounded-full !text-[#1e293b] !font-medium !text-sm !py-2.5",
                  socialButtonsBlockButtonText: "!text-[#1e293b] !font-semibold !text-xs",
                  dividerLine: "!bg-white/40",
                  dividerText: "!text-white/80 !text-xs !px-2",
                  formButtonPrimary:
                    "!bg-[#00b4d8] hover:!bg-[#0096b8] !text-white !font-bold !rounded-full !py-2.5 !text-sm transition-all shadow-md !mt-2",
                  footer: "hidden",
                  footerActionLink: "hidden",
                  footerActionText: "hidden",
                  identityPreviewText: "!text-white",
                  identityPreviewEditButtonIcon: "!text-[#00b4d8]",
                  formFieldRow: "!mb-3",
                },
                variables: {
                  colorPrimary: "#00b4d8",
                  colorBackground: "transparent",
                  borderRadius: "12px",
                },
              }}
            />
            {/* Custom switch link exactly matching mockup style */}
            <div className="mt-5 text-sm text-slate-300 text-center font-medium">
              Don&apos;t you have an account?{" "}
              <Link
                href="/sign-up"
                className="text-white hover:underline font-bold transition-all"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
