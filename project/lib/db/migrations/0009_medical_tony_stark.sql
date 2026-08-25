DROP INDEX "categories_name_type_workspace_uidx";--> statement-breakpoint
CREATE UNIQUE INDEX "categories_name_workspace_uidx" ON "categories" USING btree ("name","workspace_id");--> statement-breakpoint
ALTER TABLE "categories" DROP COLUMN "type";--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN "categories";--> statement-breakpoint
DROP TYPE "public"."category_type";