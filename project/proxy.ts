import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/*Routes anyone can access without being signed in */
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
  "/forbidden",
  "/unauthorized",
]);

/** Auth pages — signed-in users should be bounced to /dashboard */
const isAuthRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

// ── Middleware ─────────────────────────────────────────────────────────────────
export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // 1. Signed-in user tries to access /sign-in or /sign-up → redirect to dashboard
  if (isAuthRoute(req) && userId) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // 2. Unauthenticated user tries to access a protected route → Clerk redirects to /sign-in
  if (!isPublicRoute(req) && !userId) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Run on all routes except Next.js internals and static assets
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|json|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
