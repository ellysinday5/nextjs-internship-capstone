import { SignUp } from "@clerk/nextjs"
import Link from "next/link"
// import { CodeBackground } from "@/components/code-background"

export default function SignUpPage() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white px-4 py-8 overflow-hidden">
      {/* <CodeBackground /> */}

      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        {/* Clean Header Title requested by user */}
        <h1 className="text-2xl font-bold text-white mb-6 text-center">
          Sign up for <span className="text-indigo-400 font-extrabold">ProjectFlow</span>
        </h1>

        {/* Clerk Sign Up Card */}
        <div className="w-full flex justify-center">
          <SignUp
            signInUrl="/sign-in"
            appearance={{
              elements: {
                rootBox: "w-full shadow-2xl rounded-xl overflow-hidden backdrop-blur-md",
                card: "bg-slate-900/90 border border-slate-800 shadow-xl w-full",
                headerTitle: "hidden", // We use our custom header title above
                headerSubtitle: "text-slate-300 text-center text-sm",
                socialButtonsBlockButton:
                  "bg-slate-800 hover:bg-slate-700 border-slate-700 text-white",
                socialButtonsBlockButtonText: "text-white font-medium",
                dividerLine: "bg-slate-700",
                dividerText: "text-slate-300 font-medium",
                formFieldLabel: "text-slate-200 font-semibold text-sm",
                formFieldInput:
                  "bg-slate-950 border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500 font-mono text-sm",
                formFieldInputShowPasswordButton:
                  "text-indigo-400 hover:text-indigo-300 focus:text-indigo-300",
                formFieldInputShowPasswordIcon: "w-5 h-5 text-indigo-400",
                formFieldErrorText: "text-red-400 text-xs mt-1",
                formFieldSuccessText: "text-emerald-400 text-xs mt-1",
                formButtonPrimary:
                  "bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-md transition-colors",
                footerActionLink: "text-indigo-400 hover:text-indigo-300 font-semibold",
                footerActionText: "text-slate-300",
                identityPreviewText: "text-white font-medium",
                identityPreviewEditButtonIcon: "text-indigo-400",
              },
            }}
          />
        </div>

        {/* Shortcut Button / Textlink for Sign In at bottom of container */}
        <div className="mt-6 text-sm text-slate-400 text-center">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-4 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
