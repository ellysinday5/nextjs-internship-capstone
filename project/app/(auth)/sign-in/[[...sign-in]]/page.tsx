"use client";

import { AuthIllustration } from "@/components/auth/auth-illustration";
import { type SignInFormValues, signInSchema } from "@/lib/db/auth-schemas";
import { useSignIn } from "@clerk/nextjs/legacy";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowLeft, Eye, EyeOff, KeyRound, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// ─── Shared UI helpers ────────────────────────────────────────────────────────

function RequiredLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-semibold text-[#142843] mb-1">
      {children}
      <span className="text-red-500 ml-0.5" aria-hidden="true">
        *
      </span>
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="flex items-center gap-1 mt-1">
      <AlertCircle className="w-3 h-3 text-red-500 shrink-0" />
      <p className="text-xs text-red-500">{message}</p>
    </div>
  );
}

function ServerErrorBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="w-full mb-4 flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
      <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
      <p className="text-xs text-red-600 font-medium">{message}</p>
    </div>
  );
}

// ─── Zod schemas for forgot-password sub-forms ────────────────────────────────

const forgotEmailSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
});
type ForgotEmailValues = z.infer<typeof forgotEmailSchema>;

const resetPasswordSchema = z
  .object({
    code: z
      .string()
      .min(1, "Code is required")
      .min(6, "Code must be at least 6 characters"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

// ─── View types ───────────────────────────────────────────────────────────────

type View = "sign-in" | "forgot-request" | "forgot-confirm" | "reset-success";

// ─── Main component ───────────────────────────────────────────────────────────

export default function SignInPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();

  // Global state
  const [view, setView] = useState<View>("sign-in");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [lastUsed, setLastUsed] = useState<"google" | "email" | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("syntraflow_last_auth") as "google" | "email" | null;
    setLastUsed(stored);
  }, []);

  // ── Sign-in form ────────────────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: SignInFormValues) => {
    if (!isLoaded) return;
    setServerError(null);
    setIsSubmitting(true);
    try {
      const result = await signIn.create({
        identifier: data.email,
        password: data.password,
      });
      if (result.status === "complete") {
        localStorage.setItem("syntraflow_last_auth", "email");
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      const clerkError = err as { errors?: Array<{ message?: string; longMessage?: string }> };
      const msg =
        clerkError?.errors?.[0]?.longMessage ||
        clerkError?.errors?.[0]?.message ||
        "Invalid email or password. Please try again.";
      setServerError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!isLoaded || !signIn) return;
    setGoogleLoading(true);
    setServerError(null);
    try {
      localStorage.setItem("syntraflow_last_auth", "google");
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/dashboard",
      });
    } catch (err: unknown) {
      console.error("Google auth error:", err);
      const clerkError = err as { errors?: Array<{ message?: string }> };
      setServerError(
        clerkError?.errors?.[0]?.message || "Could not sign in with Google. Please try again.",
      );
      setGoogleLoading(false);
    }
  };

  // ── Forgot-password: step 1 — request code ──────────────────────────────────
  const {
    register: registerForgot,
    handleSubmit: handleSubmitForgot,
    formState: { errors: forgotErrors },
    reset: resetForgotForm,
  } = useForm<ForgotEmailValues>({
    resolver: zodResolver(forgotEmailSchema),
    mode: "onBlur",
  });

  const onRequestReset = async (data: ForgotEmailValues) => {
    if (!isLoaded) return;
    setServerError(null);
    setIsSubmitting(true);
    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: data.email,
      });
      setView("forgot-confirm");
    } catch (err: unknown) {
      const clerkError = err as { errors?: Array<{ message?: string; longMessage?: string }> };
      const msg =
        clerkError?.errors?.[0]?.longMessage ||
        clerkError?.errors?.[0]?.message ||
        "Could not send reset code. Please check the email and try again.";
      setServerError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Forgot-password: step 2 — confirm code + new password ──────────────────
  const {
    register: registerReset,
    handleSubmit: handleSubmitReset,
    formState: { errors: resetErrors },
    reset: resetResetForm,
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onBlur",
  });

  const onConfirmReset = async (data: ResetPasswordValues) => {
    if (!isLoaded) return;
    setServerError(null);
    setIsSubmitting(true);
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: data.code,
        password: data.password,
      });
      if (result.status === "complete") {
        localStorage.setItem("syntraflow_last_auth", "email");
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard");
      } else {
        // Clerk may require additional factors — show success and redirect to sign-in
        setView("reset-success");
      }
    } catch (err: unknown) {
      const clerkError = err as { errors?: Array<{ code?: string; message?: string; longMessage?: string }> };
      const clerkCode = clerkError?.errors?.[0]?.code;
      let msg =
        clerkError?.errors?.[0]?.longMessage ||
        clerkError?.errors?.[0]?.message ||
        "Could not reset password. Please try again.";

      if (clerkCode === "form_code_incorrect") msg = "Incorrect code. Please check your email and try again.";
      if (clerkCode === "verification_expired") msg = "The code has expired. Please request a new one.";
      if (clerkCode === "form_password_pwned") msg = "That password has appeared in a data breach. Please choose a different one.";
      if (clerkCode === "form_password_not_strong_enough") msg = "Password is too weak. Use at least 8 characters, one uppercase letter, and one number.";

      setServerError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Navigate away helpers ───────────────────────────────────────────────────
  const goToSignIn = () => {
    setView("sign-in");
    setServerError(null);
    resetForgotForm();
    resetResetForm();
  };

  const goToForgot = () => {
    setView("forgot-request");
    setServerError(null);
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen w-full bg-[url('/bg-logo.png')] bg-cover bg-center bg-no-repeat flex items-center justify-center p-4 sm:p-6 md:p-10 font-sans relative">
      <div id="clerk-captcha" />
      <div className="w-full max-w-[940px] bg-white rounded-2xl shadow-2xl border border-slate-100 p-8 sm:p-10 md:p-12 flex flex-col md:flex-row items-center justify-between gap-10 md:gap-16 min-h-[480px]">

        {/* Left — illustration */}
        <div className="w-full md:w-[360px] lg:w-[390px] h-[300px] sm:h-[340px] md:h-[380px] shrink-0 flex items-center justify-center">
          <AuthIllustration />
        </div>

        {/* Right — dynamic form panel */}
        <div className="w-full md:w-[380px] flex flex-col items-center justify-center">

          {/* ── VIEW: Sign-in ─────────────────────────────────────────── */}
          {view === "sign-in" && (
            <>
              <div className="flex flex-col items-center justify-center text-center mb-6">
                <img
                  src="/syntraflow-icon.svg"
                  alt="SyntraFlow Logo"
                  className="w-11 h-11 object-contain drop-shadow-sm mb-1.5"
                />
                <span className="text-xs font-bold tracking-widest text-[#142843] uppercase mb-3">
                  SyntraFlow
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#142843] tracking-tight mt-1">
                  Sign in
                </h1>
                <p className="text-slate-500 text-xs sm:text-sm mt-1.5 font-normal">
                  Welcome back! Please enter your details to sign in
                </p>
              </div>

              <button
                type="button"
                suppressHydrationWarning
                onClick={handleGoogleSignIn}
                disabled={googleLoading || !isLoaded}
                className="w-full flex items-center justify-center gap-3 border border-slate-200 rounded-full py-2.5 px-4 text-sm font-semibold text-[#142843] bg-white hover:bg-slate-50 transition-all shadow-sm mb-4 disabled:opacity-60 disabled:cursor-not-allowed relative cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                {googleLoading ? "Connecting to Google..." : "Continue with Google"}
                {lastUsed === "google" && !googleLoading && (
                  <span className="absolute right-4 text-[10px] font-bold text-[#00b4d8] bg-[#e8f8fd] rounded-full px-2 py-0.5">
                    Last used
                  </span>
                )}
              </button>

              <div className="flex items-center w-full gap-3 mb-4">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs text-slate-400 font-medium">or</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              <ServerErrorBanner message={serverError} />

              <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4" noValidate>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <RequiredLabel htmlFor="signin-email">Email address</RequiredLabel>
                    {lastUsed === "email" && (
                      <span className="text-[10px] font-bold text-[#00b4d8] bg-[#e8f8fd] rounded-full px-2 py-0.5">
                        Last used
                      </span>
                    )}
                  </div>
                  <input
                    id="signin-email"
                    type="email"
                    autoComplete="email"
                    placeholder="Enter your email address"
                    suppressHydrationWarning
                    {...register("email")}
                    className={`w-full bg-slate-100 border text-[#1e293b] placeholder:text-[#94a3b8] rounded-full px-4 py-2.5 text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-[#00b4d8] focus:border-transparent ${
                      errors.email ? "border-red-400 bg-red-50 focus:ring-red-400" : "border-slate-200"
                    }`}
                  />
                  <FieldError message={errors.email?.message} />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <RequiredLabel htmlFor="signin-password">Password</RequiredLabel>
                    {/* Forgot password link — standard placement: right-aligned next to label */}
                    <button
                      type="button"
                      onClick={goToForgot}
                      className="text-[10px] font-semibold text-[#00b4d8] hover:text-[#0096b8] hover:underline transition-colors cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id="signin-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      suppressHydrationWarning
                      {...register("password")}
                      className={`w-full bg-slate-100 border text-[#1e293b] placeholder:text-[#94a3b8] rounded-full px-4 py-2.5 pr-11 text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-[#00b4d8] focus:border-transparent ${
                        errors.password
                          ? "border-red-400 bg-red-50 focus:ring-red-400"
                          : "border-slate-200"
                      }`}
                    />
                    <button
                      type="button"
                      suppressHydrationWarning
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <FieldError message={errors.password?.message} />
                </div>

                <button
                  type="submit"
                  suppressHydrationWarning
                  disabled={isSubmitting}
                  className="w-full bg-[#00b4d8] hover:bg-[#0096b8] active:bg-[#007fa3] text-white font-bold rounded-full py-2.5 text-sm transition-all shadow-md mt-1 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Continue"
                  )}
                </button>
              </form>

              <div className="mt-5 text-sm text-slate-500 text-center font-medium">
                Don&apos;t have an account?{" "}
                <Link
                  href="/sign-up"
                  className="text-[#00b4d8] hover:underline font-bold transition-all"
                >
                  Sign up
                </Link>
              </div>
            </>
          )}

          {/* ── VIEW: Forgot — request code ───────────────────────────── */}
          {view === "forgot-request" && (
            <>
              <div className="flex flex-col items-center justify-center text-center mb-6">
                <div className="w-12 h-12 rounded-full bg-[#e8f8fd] flex items-center justify-center mb-3">
                  <Mail className="w-6 h-6 text-[#00b4d8]" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#142843] tracking-tight">
                  Reset password
                </h1>
                <p className="text-slate-500 text-xs sm:text-sm mt-1.5 font-normal max-w-[280px]">
                  Enter the email linked to your account and we&apos;ll send you a reset code.
                </p>
              </div>

              <ServerErrorBanner message={serverError} />

              <form
                onSubmit={handleSubmitForgot(onRequestReset)}
                className="w-full space-y-4"
                noValidate
              >
                <div>
                  <RequiredLabel htmlFor="forgot-email">Email address</RequiredLabel>
                  <input
                    id="forgot-email"
                    type="email"
                    autoComplete="email"
                    placeholder="Enter your email address"
                    suppressHydrationWarning
                    {...registerForgot("email")}
                    className={`w-full bg-slate-100 border text-[#1e293b] placeholder:text-[#94a3b8] rounded-full px-4 py-2.5 text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-[#00b4d8] focus:border-transparent ${
                      forgotErrors.email
                        ? "border-red-400 bg-red-50 focus:ring-red-400"
                        : "border-slate-200"
                    }`}
                  />
                  <FieldError message={forgotErrors.email?.message} />
                </div>

                <button
                  type="submit"
                  suppressHydrationWarning
                  disabled={isSubmitting || !isLoaded}
                  className="w-full bg-[#00b4d8] hover:bg-[#0096b8] active:bg-[#007fa3] text-white font-bold rounded-full py-2.5 text-sm transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Sending code...
                    </>
                  ) : (
                    "Send reset code"
                  )}
                </button>
              </form>

              <button
                type="button"
                onClick={goToSignIn}
                className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#142843] transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to sign in
              </button>
            </>
          )}

          {/* ── VIEW: Forgot — confirm code + new password ────────────── */}
          {view === "forgot-confirm" && (
            <>
              <div className="flex flex-col items-center justify-center text-center mb-6">
                <div className="w-12 h-12 rounded-full bg-[#e8f8fd] flex items-center justify-center mb-3">
                  <KeyRound className="w-6 h-6 text-[#00b4d8]" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#142843] tracking-tight">
                  Check your email
                </h1>
                <p className="text-slate-500 text-xs sm:text-sm mt-1.5 font-normal max-w-[280px]">
                  We sent a 6-digit code to your email. Enter it below along with your new password.
                </p>
              </div>

              <ServerErrorBanner message={serverError} />

              <form
                onSubmit={handleSubmitReset(onConfirmReset)}
                className="w-full space-y-4"
                noValidate
              >
                {/* Code field */}
                <div>
                  <RequiredLabel htmlFor="reset-code">Reset code</RequiredLabel>
                  <input
                    id="reset-code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="Enter 6-digit code"
                    maxLength={8}
                    suppressHydrationWarning
                    {...registerReset("code")}
                    className={`w-full bg-slate-100 border text-[#1e293b] placeholder:text-[#94a3b8] rounded-full px-4 py-2.5 text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-[#00b4d8] focus:border-transparent tracking-widest ${
                      resetErrors.code
                        ? "border-red-400 bg-red-50 focus:ring-red-400"
                        : "border-slate-200"
                    }`}
                  />
                  <FieldError message={resetErrors.code?.message} />
                </div>

                {/* New password */}
                <div>
                  <RequiredLabel htmlFor="reset-password">New password</RequiredLabel>
                  <div className="relative">
                    <input
                      id="reset-password"
                      type={showNewPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="New password (min. 8 chars)"
                      suppressHydrationWarning
                      {...registerReset("password")}
                      className={`w-full bg-slate-100 border text-[#1e293b] placeholder:text-[#94a3b8] rounded-full px-4 py-2.5 pr-11 text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-[#00b4d8] focus:border-transparent ${
                        resetErrors.password
                          ? "border-red-400 bg-red-50 focus:ring-red-400"
                          : "border-slate-200"
                      }`}
                    />
                    <button
                      type="button"
                      suppressHydrationWarning
                      onClick={() => setShowNewPassword((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      aria-label={showNewPassword ? "Hide password" : "Show password"}
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <FieldError message={resetErrors.password?.message} />
                </div>

                {/* Confirm new password */}
                <div>
                  <RequiredLabel htmlFor="reset-confirm-password">Confirm new password</RequiredLabel>
                  <div className="relative">
                    <input
                      id="reset-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Re-enter new password"
                      suppressHydrationWarning
                      {...registerReset("confirmPassword")}
                      className={`w-full bg-slate-100 border text-[#1e293b] placeholder:text-[#94a3b8] rounded-full px-4 py-2.5 pr-11 text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-[#00b4d8] focus:border-transparent ${
                        resetErrors.confirmPassword
                          ? "border-red-400 bg-red-50 focus:ring-red-400"
                          : "border-slate-200"
                      }`}
                    />
                    <button
                      type="button"
                      suppressHydrationWarning
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <FieldError message={resetErrors.confirmPassword?.message} />
                </div>

                <button
                  type="submit"
                  suppressHydrationWarning
                  disabled={isSubmitting || !isLoaded}
                  className="w-full bg-[#00b4d8] hover:bg-[#0096b8] active:bg-[#007fa3] text-white font-bold rounded-full py-2.5 text-sm transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Resetting password...
                    </>
                  ) : (
                    "Reset password"
                  )}
                </button>
              </form>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setServerError(null);
                    setView("forgot-request");
                    resetResetForm();
                  }}
                  className="text-xs text-[#00b4d8] hover:underline font-semibold cursor-pointer"
                >
                  Didn&apos;t receive a code? Resend
                </button>
              </div>

              <button
                type="button"
                onClick={goToSignIn}
                className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#142843] transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to sign in
              </button>
            </>
          )}

          {/* ── VIEW: Reset success (Clerk required re-login) ─────────── */}
          {view === "reset-success" && (
            <div className="flex flex-col items-center justify-center text-center gap-4">
              <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-[#142843]">Password reset!</h1>
              <p className="text-slate-500 text-sm max-w-[260px]">
                Your password has been updated. Sign in with your new password to continue.
              </p>
              <button
                type="button"
                onClick={goToSignIn}
                className="mt-2 w-full bg-[#00b4d8] hover:bg-[#0096b8] text-white font-bold rounded-full py-2.5 text-sm transition-all shadow-md cursor-pointer"
              >
                Back to sign in
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
