ALTER TABLE "project_members" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "project_members" ADD COLUMN "name" text NOT NULL;