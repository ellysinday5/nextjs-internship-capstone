"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSignUp } from "@clerk/nextjs/legacy";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { signUpSchema, SignUpFormValues } from "@/lib/auth-schemas";
import { AuthIllustration } from "@/components/auth/auth-illustration";

/* ─────────────────────────────────────────────────────────────
   Reusable Field Components
───────────────────────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────────────────────
   Password Strength Indicator
───────────────────────────────────────────────────────────── */
function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;

  const checks = [
    { label: "At least 8 characters", pass: password.length >= 8 },
    { label: "One uppercase letter", pass: /[A-Z]/.test(password) },
    { label: "One number", pass: /[0-9]/.test(password) },
  ];

  return (
    <div className="mt-1.5 grid grid-cols-3 gap-1">
      {checks.map((c) => (
        <div key={c.label} className="flex items-center gap-1">
          <CheckCircle2
            className={`w-3 h-3 shrink-0 transition-colors ${
              c.pass ? "text-green-500" : "text-slate-300"
            }`}
          />
          <span
            className={`text-[10px] font-medium truncate ${c.pass ? "text-green-600" : "text-slate-400"}`}
          >
            {c.label}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Sign-Up Page
───────────────────────────────────────────────────────────── */
export default function SignUpPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  /* Email verification state */
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  /* Track "Last used" method via localStorage */
  const [lastUsed, setLastUsed] = useState<"google" | "email" | null>(null);
  useEffect(() => {
    const stored = localStorage.getItem("syntraflow_last_auth") as "google" | "email" | null;
    setLastUsed(stored);
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    mode: "onBlur",
  });

  const passwordValue = watch("password", "");

  /* ── Email / Password sign-up ── */
  const onSubmit = async (data: SignUpFormValues) => {
    if (!isLoaded) return;
    setServerError(null);
    setIsSubmitting(true);
    try {
      await signUp.create({
        firstName: data.firstName,
        lastName: data.lastName,
        emailAddress: data.email,
        password: data.password,
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      localStorage.setItem("syntraflow_last_auth", "email");
      setPendingVerification(true);
    } catch (err: unknown) {
      const clerkError = err as { errors?: Array<{ message?: string; longMessage?: string }> };
      const msg =
        clerkError?.errors?.[0]?.longMessage ||
        clerkError?.errors?.[0]?.message ||
        "Something went wrong. Please try again.";
      setServerError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Email verification ── */
  const onVerify = async () => {
    if (!isLoaded || !verificationCode.trim()) return;
    setVerifyError(null);
    setVerifying(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({ code: verificationCode });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard");
      } else {
        setVerifyError("Verification incomplete. Please try again.");
      }
    } catch (err: unknown) {
      const clerkError = err as { errors?: Array<{ message?: string }> };
      setVerifyError(clerkError?.errors?.[0]?.message || "Invalid code. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  /* ── Google OAuth sign-up ── */
  const handleGoogleSignUp = async () => {
    if (!isLoaded || !signUp) return;
    setGoogleLoading(true);
    setServerError(null);
    try {
      localStorage.setItem("syntraflow_last_auth", "google");
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/dashboard",
      });
    } catch (err: unknown) {
      console.error("Google sign-up error:", err);
      const clerkError = err as { errors?: Array<{ message?: string }> };
      setServerError(
        clerkError?.errors?.[0]?.message || "Could not sign up with Google. Please try again.",
      );
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[url('/bg-logo.png')] bg-cover bg-center bg-no-repeat flex items-center justify-center p-4 sm:p-6 md:p-10 font-sans relative">
      <div className="w-full max-w-[1040px] bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 sm:p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 min-h-[500px]">
        {/* Left Side: Animated Brand Intro */}
        <div className="w-full md:w-[380px] lg:w-[420px] h-[300px] sm:h-[340px] md:h-[400px] shrink-0 flex items-center justify-center">
          <AuthIllustration />
        </div>

        {/* Right Side */}
        <div className="w-full md:w-[440px] flex flex-col items-center justify-center">
          {/* Header */}
          <div className="flex flex-col items-center justify-center text-center mb-5">
            <img
              src="/syntraflow-icon.svg"
              alt="SyntraFlow Logo"
              className="w-11 h-11 object-contain drop-shadow-sm mb-1.5"
            />
            <span className="text-xs font-bold tracking-widest text-[#142843] uppercase mb-2">
              SyntraFlow
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#142843] tracking-tight mt-1">
              {pendingVerification ? "Check your email" : "Sign up"}
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1 font-normal">
              {pendingVerification
                ? "We sent a verification code to your email"
                : "Welcome! Please fill in your details to get started"}
            </p>
          </div>

          {/* ── Email Verification Step ── */}
          {pendingVerification ? (
            <div className="w-full space-y-4">
              {verifyError && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-red-600 font-medium">{verifyError}</p>
                </div>
              )}
              <div>
                <RequiredLabel htmlFor="verify-code">Verification code</RequiredLabel>
                <input
                  id="verify-code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Enter 6-digit code"
                  suppressHydrationWarning
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full bg-slate-100 border border-slate-200 text-[#1e293b] placeholder:text-[#94a3b8] rounded-full px-4 py-2.5 text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-[#00b4d8] focus:border-transparent tracking-widest text-center"
                />
              </div>
              <button
                type="button"
                suppressHydrationWarning
                onClick={onVerify}
                disabled={verifying || verificationCode.length < 6}
                className="w-full bg-[#00b4d8] hover:bg-[#0096b8] active:bg-[#007fa3] text-white font-bold rounded-full py-2.5 text-sm transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {verifying ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify email"
                )}
              </button>
              <p className="text-xs text-slate-500 text-center">
                Didn&apos;t receive it?{" "}
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={() =>
                    signUp?.prepareEmailAddressVerification({ strategy: "email_code" })
                  }
                  className="text-[#00b4d8] font-bold hover:underline"
                >
                  Resend code
                </button>
              </p>
            </div>
          ) : (
            /* ── Sign-Up Form Step ── */
            <>
              {/* Google OAuth Button */}
              <button
                type="button"
                suppressHydrationWarning
                onClick={handleGoogleSignUp}
                disabled={googleLoading || !isLoaded}
                className="w-full flex items-center justify-center gap-3 border border-slate-200 rounded-full py-2.5 px-4 text-sm font-semibold text-[#142843] bg-white hover:bg-slate-50 transition-all shadow-sm mb-3.5 disabled:opacity-60 disabled:cursor-not-allowed relative cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {googleLoading ? "Connecting to Google..." : "Continue with Google"}
                {lastUsed === "google" && !googleLoading && (
                  <span className="absolute right-4 text-[10px] font-bold text-[#00b4d8] bg-[#e8f8fd] rounded-full px-2 py-0.5">
                    Last used
                  </span>
                )}
              </button>

              {/* Divider */}
              <div className="flex items-center w-full gap-3 mb-3.5">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs text-slate-400 font-medium">or</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              {serverError && (
                <div className="w-full mb-3 flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-red-600 font-medium">{serverError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-3" noValidate>
                {/* First / Last Name Row */}
                <div className="flex gap-3">
                  <div className="flex-1">
                    <RequiredLabel htmlFor="signup-firstname">First name</RequiredLabel>
                    <input
                      id="signup-firstname"
                      type="text"
                      autoComplete="given-name"
                      placeholder="First name"
                      suppressHydrationWarning
                      {...register("firstName")}
                      className={`w-full bg-slate-100 border text-[#1e293b] placeholder:text-[#94a3b8] rounded-full px-4 py-2.5 text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-[#00b4d8] focus:border-transparent ${
                        errors.firstName
                          ? "border-red-400 bg-red-50 focus:ring-red-400"
                          : "border-slate-200"
                      }`}
                    />
                    <FieldError message={errors.firstName?.message} />
                  </div>
                  <div className="flex-1">
                    <RequiredLabel htmlFor="signup-lastname">Last name</RequiredLabel>
                    <input
                      id="signup-lastname"
                      type="text"
                      autoComplete="family-name"
                      placeholder="Last name"
                      suppressHydrationWarning
                      {...register("lastName")}
                      className={`w-full bg-slate-100 border text-[#1e293b] placeholder:text-[#94a3b8] rounded-full px-4 py-2.5 text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-[#00b4d8] focus:border-transparent ${
                        errors.lastName
                          ? "border-red-400 bg-red-50 focus:ring-red-400"
                          : "border-slate-200"
                      }`}
                    />
                    <FieldError message={errors.lastName?.message} />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <RequiredLabel htmlFor="signup-email">Email address</RequiredLabel>
                    {lastUsed === "email" && (
                      <span className="text-[10px] font-bold text-[#00b4d8] bg-[#e8f8fd] rounded-full px-2 py-0.5">
                        Last used
                      </span>
                    )}
                  </div>
                  <input
                    id="signup-email"
                    type="email"
                    autoComplete="email"
                    placeholder="Enter your email address"
                    suppressHydrationWarning
                    {...register("email")}
                    className={`w-full bg-slate-100 border text-[#1e293b] placeholder:text-[#94a3b8] rounded-full px-4 py-2.5 text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-[#00b4d8] focus:border-transparent ${
                      errors.email
                        ? "border-red-400 bg-red-50 focus:ring-red-400"
                        : "border-slate-200"
                    }`}
                  />
                  <FieldError message={errors.email?.message} />
                </div>

                {/* Password */}
                <div>
                  <RequiredLabel htmlFor="signup-password">Password</RequiredLabel>
                  <div className="relative">
                    <input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Create a password"
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
                  <PasswordStrength password={passwordValue} />
                </div>

                {/* Confirm Password */}
                <div>
                  <RequiredLabel htmlFor="signup-confirm-password">Confirm password</RequiredLabel>
                  <div className="relative">
                    <input
                      id="signup-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Confirm your password"
                      suppressHydrationWarning
                      {...register("confirmPassword")}
                      className={`w-full bg-slate-100 border text-[#1e293b] placeholder:text-[#94a3b8] rounded-full px-4 py-2.5 pr-11 text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-[#00b4d8] focus:border-transparent ${
                        errors.confirmPassword
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
                  <FieldError message={errors.confirmPassword?.message} />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  suppressHydrationWarning
                  disabled={isSubmitting}
                  className="w-full bg-[#00b4d8] hover:bg-[#0096b8] active:bg-[#007fa3] text-white font-bold rounded-full py-2.5 text-sm transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Continue"
                  )}
                </button>
              </form>

              <div className="mt-3.5 text-sm text-slate-500 text-center font-medium">
                Already have an account?{" "}
                <Link
                  href="/sign-in"
                  className="text-[#00b4d8] hover:underline font-bold transition-all"
                >
                  Sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
