import { InvalidInviteError } from "@/components/errors/invalid-invite-error";

/* ─────────────────────────────────────────────────────────────────────────────
   app/invite/[token]/not-found.tsx

   Triggered when the server page component calls notFound() from next/navigation
   after the invite token lookup in the DB returns no result.

   This not-found.tsx is OUTSIDE the (dashboard) route group, so no sidebar or
   dashboard navbar will appear — this is a full-page experience, which is the
   correct UX for an invalid invite link accessed before workspace membership.
───────────────────────────────────────────────────────────────────────────── */

export default function InvalidInviteNotFound() {
  return <InvalidInviteError />;
}
