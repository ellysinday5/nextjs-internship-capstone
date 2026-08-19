import fs from "fs";
import path from "path";
import { Pool } from "@neondatabase/serverless";

function getDatabaseUrl(): string {
  const envPath = path.resolve(process.cwd(), ".env.local");
  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("DATABASE_URL=")) {
      let val = trimmed.substring("DATABASE_URL=".length).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.substring(1, val.length - 1);
      }
      return val;
    }
  }
  throw new Error("DATABASE_URL not found in .env.local");
}

function toSlug(text: string): string {
  const slug = text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "workspace";
}

async function getUniqueSlug(client: any, baseText: string): Promise<string> {
  const baseSlug = toSlug(baseText);
  let candidate = baseSlug;
  let counter = 1;

  while (true) {
    const check = await client.query("SELECT id FROM workspaces WHERE slug = $1", [candidate]);
    if (check.rows.length === 0) {
      return candidate;
    }
    counter++;
    candidate = `${baseSlug}-${counter}`;
  }
}

async function runBackfill() {
  const pool = new Pool({ connectionString: getDatabaseUrl() });
  console.log("====================================================");
  console.log("STARTING STEP 2: WORKSPACE BACKFILL SCRIPT");
  console.log("====================================================\n");

  try {
    // 1. Find all distinct project owners
    const ownersRes = await pool.query(`
      SELECT DISTINCT p.owner_id, u.name, u.email
      FROM projects p
      LEFT JOIN users u ON p.owner_id = u.id
      ORDER BY p.owner_id
    `);

    console.log(`Found ${ownersRes.rows.length} distinct project owner(s) in the database.\n`);

    const summary: Array<{
      ownerId: string;
      ownerName: string;
      workspaceId: string;
      workspaceName: string;
      workspaceSlug: string;
      projectsUpdated: number;
    }> = [];

    // Process each owner in its own atomic transaction
    for (const owner of ownersRes.rows) {
      const ownerId = owner.owner_id;
      const ownerName = owner.name || (owner.email ? owner.email.split("@")[0] : "User");
      const workspaceName = `${ownerName}'s Workspace`;

      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        // Check if a workspace already exists for this owner
        let workspaceId: string;
        let workspaceSlug: string;
        const existingWs = await client.query(
          "SELECT id, name, slug FROM workspaces WHERE owner_id = $1 LIMIT 1",
          [ownerId],
        );

        if (existingWs.rows.length > 0) {
          workspaceId = existingWs.rows[0].id;
          workspaceSlug = existingWs.rows[0].slug;
          console.log(
            `Owner ${ownerName} (${ownerId}) already has workspace: "${existingWs.rows[0].name}" [${workspaceSlug}]`,
          );
        } else {
          // Generate guaranteed unique slug
          workspaceSlug = await getUniqueSlug(client, `${ownerName}-workspace`);

          // Insert workspace
          const wsInsert = await client.query(
            `INSERT INTO workspaces (name, slug, owner_id, created_at)
             VALUES ($1, $2, $3, NOW())
             RETURNING id, name, slug`,
            [workspaceName, workspaceSlug, ownerId],
          );
          workspaceId = wsInsert.rows[0].id;
          console.log(
            `Created workspace "${workspaceName}" [slug: ${workspaceSlug}] (ID: ${workspaceId})`,
          );

          // Insert workspace_members row with role 'owner' (upsert safe)
          await client.query(
            `INSERT INTO workspace_members (workspace_id, user_id, role, created_at)
             VALUES ($1, $2, 'owner', NOW())
             ON CONFLICT (workspace_id, user_id) DO UPDATE SET role = 'owner'`,
            [workspaceId, ownerId],
          );
          console.log(`Added ${ownerName} as 'owner' in workspace_members`);
        }

        // Link all projects owned by this owner that don't have workspace_id set
        const updateRes = await client.query(
          `UPDATE projects
           SET workspace_id = $1
           WHERE owner_id = $2 AND (workspace_id IS NULL OR workspace_id != $1)
           RETURNING id, name`,
          [workspaceId, ownerId],
        );

        await client.query("COMMIT");

        console.log(`Linked ${updateRes.rows.length} project(s) to workspace "${workspaceName}"`);
        updateRes.rows.forEach((p) => console.log(`   - Project: "${p.name}" (ID: ${p.id})`));
        console.log("");

        summary.push({
          ownerId,
          ownerName,
          workspaceId,
          workspaceName,
          workspaceSlug,
          projectsUpdated: updateRes.rows.length,
        });
      } catch (err) {
        await client.query("ROLLBACK");
        console.error(` Transaction failed for owner ${ownerId}:`, err);
        throw err;
      } finally {
        client.release();
      }
    }

    // ── Verification Step ──────────────────────────────────────────
    console.log("====================================================");
    console.log("POST-BACKFILL VERIFICATION CHECKS");
    console.log("====================================================");

    const totalWs = await pool.query("SELECT COUNT(*) as count FROM workspaces");
    const totalMembers = await pool.query("SELECT COUNT(*) as count FROM workspace_members");
    const totalProjects = await pool.query("SELECT COUNT(*) as count FROM projects");
    const unlinkedProjects = await pool.query(
      "SELECT COUNT(*) as count FROM projects WHERE workspace_id IS NULL",
    );

    console.log(`• Total Workspaces in DB: ${totalWs.rows[0].count}`);
    console.log(`• Total Workspace Members: ${totalMembers.rows[0].count}`);
    console.log(`• Total Projects: ${totalProjects.rows[0].count}`);
    console.log(`• Projects with workspace_id IS NULL: ${unlinkedProjects.rows[0].count}`);

    if (Number.parseInt(unlinkedProjects.rows[0].count, 10) === 0) {
      console.log(
        "\n SUCCESS: All projects are linked to a valid workspace! (0 unlinked projects)",
      );
    } else {
      console.warn(`\n WARNING: There are ${unlinkedProjects.rows[0].count} unlinked project(s).`);
    }

    // Show workspace-to-projects breakdown
    const breakdown = await pool.query(`
      SELECT 
        w.id as workspace_id,
        w.name as workspace_name,
        w.slug,
        u.name as owner_name,
        u.email as owner_email,
        COUNT(p.id) as project_count
        
      FROM workspaces w
      JOIN users u ON w.owner_id = u.id
      LEFT JOIN projects p ON p.workspace_id = w.id
      GROUP BY w.id, w.name, w.slug, u.name, u.email
      ORDER BY w.created_at ASC
    `);

    console.log("\n WORKSPACE BREAKDOWN:");
    console.log(JSON.stringify(breakdown.rows, null, 2));
  } catch (error) {
    console.error("Backfill script failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runBackfill();
