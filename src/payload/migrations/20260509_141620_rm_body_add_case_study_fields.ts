import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_projects_lifecycle" AS ENUM('live', 'archived');
  CREATE TABLE "projects_decisions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"rationale" jsonb NOT NULL
  );
  
  CREATE TABLE "projects_results" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "projects_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"projects_id" integer
  );
  
  ALTER TABLE "projects_gallery" ADD COLUMN "caption" varchar;
  ALTER TABLE "projects" ADD COLUMN "problem" jsonb;
  ALTER TABLE "projects" ADD COLUMN "approach" jsonb;
  ALTER TABLE "projects" ADD COLUMN "diagram_id" integer;
  ALTER TABLE "projects" ADD COLUMN "lifecycle" "enum_projects_lifecycle" DEFAULT 'live' NOT NULL;
  ALTER TABLE "projects" ADD COLUMN "date_built" timestamp(3) with time zone;
  ALTER TABLE "projects_decisions" ADD CONSTRAINT "projects_decisions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_results" ADD CONSTRAINT "projects_results_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_rels" ADD CONSTRAINT "projects_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_rels" ADD CONSTRAINT "projects_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "projects_decisions_order_idx" ON "projects_decisions" USING btree ("_order");
  CREATE INDEX "projects_decisions_parent_id_idx" ON "projects_decisions" USING btree ("_parent_id");
  CREATE INDEX "projects_results_order_idx" ON "projects_results" USING btree ("_order");
  CREATE INDEX "projects_results_parent_id_idx" ON "projects_results" USING btree ("_parent_id");
  CREATE INDEX "projects_rels_order_idx" ON "projects_rels" USING btree ("order");
  CREATE INDEX "projects_rels_parent_idx" ON "projects_rels" USING btree ("parent_id");
  CREATE INDEX "projects_rels_path_idx" ON "projects_rels" USING btree ("path");
  CREATE INDEX "projects_rels_projects_id_idx" ON "projects_rels" USING btree ("projects_id");
  ALTER TABLE "projects" ADD CONSTRAINT "projects_diagram_id_media_id_fk" FOREIGN KEY ("diagram_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "projects_diagram_idx" ON "projects" USING btree ("diagram_id");
  ALTER TABLE "projects" DROP COLUMN "body";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "projects_decisions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "projects_results" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "projects_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "projects_decisions" CASCADE;
  DROP TABLE "projects_results" CASCADE;
  DROP TABLE "projects_rels" CASCADE;
  ALTER TABLE "projects" DROP CONSTRAINT "projects_diagram_id_media_id_fk";
  
  DROP INDEX "projects_diagram_idx";
  ALTER TABLE "projects" ADD COLUMN "body" jsonb;
  ALTER TABLE "projects_gallery" DROP COLUMN "caption";
  ALTER TABLE "projects" DROP COLUMN "problem";
  ALTER TABLE "projects" DROP COLUMN "approach";
  ALTER TABLE "projects" DROP COLUMN "diagram_id";
  ALTER TABLE "projects" DROP COLUMN "lifecycle";
  ALTER TABLE "projects" DROP COLUMN "date_built";
  DROP TYPE "public"."enum_projects_lifecycle";`)
}
