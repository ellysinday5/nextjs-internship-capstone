# SyntraFlow — Workspace & Team Management Refactor Spec

## Context (read this first)

SyntraFlow is a Next.js (App Router, Turbopack) + TypeScript + Tailwind + Drizzle ORM + Neon Postgres + Clerk auth project management app, similar to Asana. This is a solo capstone project, following a phased GitHub issue workflow with small PRs.

Relevant existing conventions in this codebase:
- Server actions live in feature-specific `*-actions.ts` files (e.g. `member-actions.ts`, `invite-actions.ts`). All member-related actions are consolidated in `member-actions.ts` — do not create new scattered action files for this.
- Drizzle query style used: `db.select().from().where()` — NOT the relational `db.query.*` API.
- `db.transaction()` used for any multi-table atomic writes (see `createProjectAction`).
- Driver: `neon-serverless` Pool (not `neon-http`), specifically because it supports `db.transaction()`.
- Routing uses slugs, not raw UUIDs.
- Max ~300 lines per file. Split large components into focused files under feature directories (e.g. `components/team/`).
- Modals use a shared `BaseModal` + `createPortal`, no visible X close button, `#0033a0` accent, `form="[form-id]"` pattern.
- Existing `invites` table + Nodemailer/Resend invite flow is being migrated to Clerk's native `clerkClient.invitations.createInvitation()` API — decision pending on whether to drop `invites` table or keep it hybrid with Clerk's invitation ID stored alongside.
- Existing `projectMembers` relational table already exists with a `role` column scoped per project.

## The Problem

There is currently **no workspace layer**. All users and projects effectively sit in one flat pool. This breaks several things we need:

1. No concept of "which users belong to this workspace at all" vs "which users have access to this specific project."
2. No distinction between workspace-level permissions (create/delete projects, manage billing, invite to workspace) and project-level permissions (manage tasks, invite to this project, assign project roles).
3. The current Team page UI conflates project-scoped invites with a single global dropdown ("Inviting to project: X") sitting above a generic team landing page, rather than making project selection the entry point into a scoped management view.
4. No admin-facing view of pending invites (who hasn't accepted yet) that's clearly scoped to the right level (project vs workspace).

## Target Architecture

### Two-level membership model

- **Workspace membership** — is this user part of this workspace at all. Roles: `owner`, `admin`, `member`.
- **Project membership** — what role does this user have in *this specific project*. Roles: `owner`, `pm`, `member`.

These are intentionally separate because a single user's role can differ per project (e.g. PM on Project A, plain member on Project B), and workspace owner status is independent of explicit project membership (a workspace owner can access any project in their workspace even without an explicit `projectMembers` row — treat this as an implicit permission override, not a data requirement).

### Schema additions

```ts
workspaces
  id, name, slug, ownerId (FK -> users), createdAt

workspaceMembers
  id, workspaceId (FK), userId (FK), role ('owner' | 'admin' | 'member'), createdAt

projects
  // add: workspaceId (FK -> workspaces)

projectMembers
  // already exists — role scoped per project, no schema change needed here
```

Membership derivation rule: when a user accepts an invite to ANY project within a workspace, automatically create a `workspaceMembers` row for them with role `member` if one doesn't already exist. This avoids requiring a separate "invite to workspace" step before a project invite — one invite flow does both.

### Route restructuring

Current: single `/team` page with a project dropdown controlling an "Inviting to project" context.

Target:
- `/team` → **All Teams** tab: grid of project/team cards (this workspace's projects). Also hosts **All People** tab (workspace-wide roster, aggregated across all projects — show role badges, "member of N projects") and a workspace-level pending-invites view if the current user is workspace owner/admin.
- `/team/[projectSlug]` → scoped project team page: member list with project roles, pending invites for THIS project only, invite action auto-scoped to this project (no dropdown needed — the route provides the context).

Clicking into a project from `All Teams` is the entry point to manage that project's members and invites — not a dropdown selector sitting above a generic landing page.

### Permission model in the UI

Do NOT build separate UI per role. Use conditional rendering gated by a permission-check helper, e.g.:

```ts
canManageProjectMembers(currentUserProjectRole, currentUserWorkspaceRole): boolean
canManageWorkspace(currentUserWorkspaceRole): boolean
```

- **Workspace owner**: sees all projects in `All Teams`, can manage members/roles on any project, sees workspace-level pending invites.
- **PM** (per project): full member management within the project(s) where they hold `pm` or `owner` role — not workspace-wide.
- **Member**: read-only roster view, no invite/edit/remove actions rendered.

Same components (`PeopleTable`, `PeopleGrid`, `MemberProfilePanel`) across all roles — action buttons (invite/edit/remove) are simply hidden/disabled based on the permission check, not swapped for different components.

## Acceptance Criteria

- [ ] `workspaces` and `workspaceMembers` tables added via Drizzle migration; `projects.workspaceId` FK added.
- [ ] Accepting a project invite auto-creates a `workspaceMembers` row (role: `member`) if none exists — implemented inside the existing invite-acceptance flow, wrapped in `db.transaction()` alongside the project membership insert.
- [ ] `/team` restructured into `All Teams` / `All People` tabs (existing `Analytics` and `My Teams` tabs unaffected unless noted otherwise).
- [ ] `/team/[projectSlug]` created as the scoped project team view; project-scoped invite action and pending-invites list moved here from the current dropdown-based flow.
- [ ] `All People` tab shows workspace-wide member roster with per-user project count and workspace role.
- [ ] Workspace-owner-only pending-invites-across-all-projects view added (location: `All People` tab or a small dashboard widget — pick one, don't build both).
- [ ] `canManageProjectMembers` / `canManageWorkspace` helper functions added (likely in `lib/auth.ts` alongside existing `syncUser()`), used to gate action buttons across `PeopleTable`, `PeopleGrid`, `MemberProfilePanel`, and the invite modal.
- [ ] All new member/workspace-related server actions added to `member-actions.ts` — no new scattered action files.
- [ ] No file exceeds ~300 lines; split new components under `components/team/`.

## Open Decision (needs input before implementation)

Whether the legacy `invites` table is dropped entirely in favor of Clerk's native invitation object, or kept in hybrid form storing Clerk's invitation ID for local querying/joins against `projectMembers`. This affects how "pending invites" are queried in both the per-project and workspace-level views above — resolve this first since it determines the data source for two of the acceptance criteria items.