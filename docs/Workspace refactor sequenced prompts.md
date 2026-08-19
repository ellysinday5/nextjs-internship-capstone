# Workspace Refactor — Sequenced Prompts for Antigravity

Companion to `workspace-refactor-spec.md`. Do NOT paste all of this at once. Each step below is a separate prompt — finish one, check the UI/DB, then move to the next. If something breaks, fix it before starting the next step; don't stack unverified changes.

Save both files in `docs/` so Antigravity can read them by path instead of you re-pasting content each time.

---

## Step 1 — Schema migration only

**Prompt:**
> Read `docs/workspace-refactor-spec.md` for full context. Implement ONLY this: add `workspaces` and `workspaceMembers` tables via Drizzle schema + migration, and add a `workspaceId` FK column to `projects`. Do not touch routes, server actions, or UI. Do not backfill existing projects yet — just get the schema and migration file correct. Show me the migration SQL before running it.

**What to check before moving on:**
- Migration runs clean against your Neon DB (`drizzle-kit push` or generate+migrate, whichever you're using).
- Open your DB (Neon console or a quick `db.select()` script) and confirm the new tables exist with correct columns/types/FKs.
- Existing `projects` rows still load fine on the Dashboard/Projects page even with `workspaceId` currently null — no crashes.

---

## Step 2 — Backfill + workspace auto-creation for existing data

**Prompt:**
> Now backfill: for each existing project owner (or however ownership currently works), create one `workspaces` row and set that as the `workspaceId` for all their existing projects. Also create matching `workspaceMembers` rows (role: owner) for each workspace owner. Write this as a one-off script or migration, not something that runs on every request.

**What to check:**
- Every existing project now has a non-null `workspaceId`.
- Query `workspaceMembers` — one owner row per workspace, correct `userId`.
- Nothing on the current live pages (`/team`, `/dashboard`, `/projects`) breaks — this step should be invisible in the UI so far.

---

## Step 3 — Auto workspace-membership on invite acceptance

**Prompt:**
> In the existing invite-acceptance flow (wherever a user accepts a project invite), add logic so that if the accepting user doesn't already have a `workspaceMembers` row for that project's workspace, create one with role `member`. Wrap this insert in the same `db.transaction()` as the existing project membership insert. Don't change anything about the invite email/Clerk migration itself — just this one added insert.

**What to check:**
- Manually invite a test account to a project, accept it, then check the DB: new `workspaceMembers` row should appear automatically.
- Accept a second invite (different project, same workspace) with the same user — confirm no duplicate `workspaceMembers` row gets created (should upsert or check-then-insert).

---

## Step 4 — Permission helper functions

**Prompt:**
> Add `canManageProjectMembers(projectRole, workspaceRole)` and `canManageWorkspace(workspaceRole)` helper functions in `lib/auth.ts`, next to the existing `syncUser()` helper. These should return booleans based on the role rules in `docs/workspace-refactor-spec.md` (workspace owner can manage everything; project pm/owner can manage that project only; member is read-only). Just add the functions — don't wire them into any UI yet.

**What to check:**
- These are pure functions — write a couple of quick console.log/manual test calls to confirm the boolean logic matches your role rules before wiring anything to it. No UI to check yet.

---

## Step 5 — Scoped project team page: `/team/[projectSlug]`

**Prompt:**
> Create the route `/team/[projectSlug]`. Move the current project-scoped invite flow and pending-invites list here from the existing `/team` dropdown-based flow. This page should show: member list for this project (with project role), pending invites for this project only, and an invite action auto-scoped to this project — no dropdown needed since the route itself provides the project context. Reuse existing components (`PeopleTable`, invite modal) — don't rebuild them from scratch.

**What to check in the UI:**
- Navigate to a project's team page via the new route — confirm members and pending invites shown match that project only (test with 2+ projects that have different members).
- Invite flow still works end-to-end (invite sent, shows in pending list, Clerk invitation created).
- Old dropdown-based invite context on `/team` can stay for now — you'll remove it in Step 6.

---

## Step 6 — Restructure `/team` into All Teams / All People tabs

**Prompt:**
> Restructure the `/team` page: `All Teams` tab shows a grid/list of project cards (link each into `/team/[projectSlug]` from Step 5). Remove the old "Inviting to project" dropdown — it's replaced by clicking into a project. `All People` tab shows a workspace-wide member roster aggregated across all projects, with each user's workspace role and a count of how many projects they're on. Existing `Analytics` and `My Teams` tabs stay as-is.

**What to check in the UI:**
- `All Teams` shows correct project cards, each clickable into the right scoped page.
- `All People` shows the right aggregate — cross-check counts manually against 2-3 known users.
- Confirm the old dropdown is fully gone and nothing references it anymore (no dead state/props left behind).

---

## Step 7 — Workspace-level pending invites (owner/admin only)

**Prompt:**
> Add a pending-invites-across-all-projects view, visible only to workspace owner/admin, using `canManageWorkspace()` from Step 4 to gate it. Place it in the `All People` tab as a section (don't build a separate page for this). Pull pending invites from all projects in the current workspace.

**What to check in the UI:**
- Log in as workspace owner — section appears, shows invites across multiple projects correctly.
- Log in as a plain member (or temporarily fake the role) — section is hidden entirely.

---

## Step 8 — Gate action buttons with permission helpers

**Prompt:**
> Wire `canManageProjectMembers()` and `canManageWorkspace()` from Step 4 into the actual UI: hide/disable invite, edit-role, and remove-member buttons in `PeopleTable`, `PeopleGrid`, and `MemberProfilePanel` based on the current user's role. Don't create separate components per role — same components, conditional rendering only.

**What to check in the UI — this is the important one, test with 3 role scenarios:**
- As workspace owner: all manage buttons visible everywhere.
- As a project PM (not workspace owner): manage buttons visible only on their own project's team page, not on projects they're not managing.
- As a plain member: no manage buttons anywhere, roster is read-only.

---

## Additional Step — Finish Clerk native invitation migration (blocking Step 3 verification)

This surfaced while testing Step 3: the invite flow is still on the old Nodemailer path (`actions/invite-actions.ts` → `lib/mailer.ts`), which fails because SMTP env vars are commented out. A Clerk-native version already exists at `actions/invite-member.ts` but isn't wired to the UI yet. Finish that migration now instead of patching the old SMTP path, since it's getting replaced anyway.

**Prompt:**
> We're mid-migration to Clerk's native invitation API. `actions/invite-member.ts` already has a Clerk-native `clerkClient.invitations.createInvitation()` implementation, but the UI (`components/team/team-page-client.tsx` and `components/modals/add-member-modal.tsx`) still imports and calls `inviteTeamMember` from the old `actions/invite-actions.ts` (Nodemailer path). Rewire the UI to call the Clerk-native action instead. Confirm: does `invite-member.ts` already store invite metadata (project ID, role, workspace ID) in Clerk's `publicMetadata` so we can read it back on acceptance? If not, add that. Also confirm the Clerk Dashboard webhook endpoint and `CLERK_WEBHOOK_SECRET` are correctly configured in `.env.local` so `user.created`/invitation-accepted events reach our webhook handler at `app/api/webhooks/clerk/route.ts`. Once wired, the old `actions/invite-actions.ts` and `lib/mailer.ts` can be left in place for now (don't delete yet) but should no longer be called from the UI.

**What to check in the UI:**
- Invite a real test email through the Team page — Clerk should send the actual email (check inbox), not the old "Invite created but email failed to send" error.
- Accept the invite as the test user — confirm the webhook fires (check ngrok inspector, `POST /api/webhooks/clerk` should show 200 OK) and that the Step 3 workspace-auto-membership logic still runs correctly off this new path (check `workspace_members` in Neon for the new row).
- If the Step 3 logic was reading from the old `invites` table or `invite.projectId`/`invite.role` shape, confirm those fields are still available from the Clerk metadata path — this may need a small adjustment to the webhook handler, not to the Step 3 transaction logic itself.

---

## Step 9 — Workspace visible in UI (sidebar)

Once the invite flow is confirmed working, make the workspace concept visible to the user instead of being purely backend. You already have real multi-workspace data to test against (two workspace accounts from the Step 2 backfill).

**Prompt:**
> Add the current workspace name to the sidebar, near the top (above or near the SyntraFlow logo/nav). If the current user belongs to more than one workspace (check `workspace_members` for their `userId`), render it as a dropdown/switcher instead of static text — selecting a different workspace should update whatever "current workspace" context drives the `All Teams` and `All People` tabs (Step 6), and persist the selection (session or a `currentWorkspaceId` cookie — pick whichever is simpler given the existing auth/session setup). If the user belongs to only one workspace, just show the name, no dropdown needed. Clicking the workspace name (or a settings icon next to it) can go to a basic workspace settings area — this doesn't need full functionality yet, just needs to exist as a route/page stub.

**What to check in the UI:**
- Log in as a user with only one workspace — name shows, no dropdown clutter.
- If you have access to both of your test accounts (Ellen / Elly workspaces from Step 2), confirm switching workspace correctly changes what's shown in `All Teams`/`All People` — you're not accidentally seeing the other workspace's projects.
- Confirm the selection persists on page refresh/navigation, not resetting to a default every time.

---

## After all 8 steps

Go back to `docs/workspace-refactor-spec.md` and check off the Acceptance Criteria list against what actually got built — anything unchecked is a gap to circle back on before you call this done.