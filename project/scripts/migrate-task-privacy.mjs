import dotenv from "dotenv";
import { neon } from "@neondatabase/serverless";

dotenv.config({ path: ".env.local" });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL not found in .env.local");
  process.exit(1);
}

const sql = neon(databaseUrl);

async function run() {
  console.log("Running task privacy migration...");
  try {
    await sql`ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "is_public" boolean DEFAULT false NOT NULL;`;
    console.log("✓ Added is_public to tasks");

    await sql`
      CREATE TABLE IF NOT EXISTS "task_shared_teams" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "task_id" uuid NOT NULL REFERENCES "tasks"("id") ON DELETE CASCADE,
        "team_id" uuid NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
        "created_at" timestamp DEFAULT now()
      );
    `;
    console.log("✓ Created task_shared_teams table");

    await sql`CREATE UNIQUE INDEX IF NOT EXISTS "task_shared_teams_task_team_uidx" ON "task_shared_teams" ("task_id", "team_id");`;
    await sql`CREATE INDEX IF NOT EXISTS "task_shared_teams_task_id_idx" ON "task_shared_teams" ("task_id");`;
    await sql`CREATE INDEX IF NOT EXISTS "task_shared_teams_team_id_idx" ON "task_shared_teams" ("team_id");`;
    console.log("✓ Created indexes on task_shared_teams");

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration error:", error);
  }
}

run();
