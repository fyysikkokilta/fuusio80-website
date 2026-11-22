import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "landing_page_hero_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_page_hero_links_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_page" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_page_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_page_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_landing_page_v_version_hero_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_landing_page_v_version_hero_links_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_landing_page_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_landing_page_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_landing_page_v_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "landing_page_hero_links" CASCADE;
  DROP TABLE "landing_page_hero_links_locales" CASCADE;
  DROP TABLE "landing_page" CASCADE;
  DROP TABLE "landing_page_locales" CASCADE;
  DROP TABLE "landing_page_rels" CASCADE;
  DROP TABLE "_landing_page_v_version_hero_links" CASCADE;
  DROP TABLE "_landing_page_v_version_hero_links_locales" CASCADE;
  DROP TABLE "_landing_page_v" CASCADE;
  DROP TABLE "_landing_page_v_locales" CASCADE;
  DROP TABLE "_landing_page_v_rels" CASCADE;
  ALTER TABLE "pages" ADD COLUMN "background_image_id" integer;
  ALTER TABLE "pages" ADD COLUMN "mirror_background_horizontally" boolean DEFAULT true;
  ALTER TABLE "_pages_v" ADD COLUMN "version_background_image_id" integer;
  ALTER TABLE "_pages_v" ADD COLUMN "version_mirror_background_horizontally" boolean DEFAULT true;
  ALTER TABLE "main_navigation" ADD COLUMN "floating_logo_id" integer;
  ALTER TABLE "_main_navigation_v" ADD COLUMN "version_floating_logo_id" integer;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_background_image_id_media_id_fk" FOREIGN KEY ("background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_background_image_id_media_id_fk" FOREIGN KEY ("version_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "main_navigation" ADD CONSTRAINT "main_navigation_floating_logo_id_media_id_fk" FOREIGN KEY ("floating_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_main_navigation_v" ADD CONSTRAINT "_main_navigation_v_version_floating_logo_id_media_id_fk" FOREIGN KEY ("version_floating_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_background_image_idx" ON "pages" USING btree ("background_image_id");
  CREATE INDEX "_pages_v_version_version_background_image_idx" ON "_pages_v" USING btree ("version_background_image_id");
  CREATE INDEX "main_navigation_floating_logo_idx" ON "main_navigation" USING btree ("floating_logo_id");
  CREATE INDEX "_main_navigation_v_version_version_floating_logo_idx" ON "_main_navigation_v" USING btree ("version_floating_logo_id");
  DROP TYPE "public"."enum_landing_page_status";
  DROP TYPE "public"."enum__landing_page_v_version_status";
  DROP TYPE "public"."enum__landing_page_v_published_locale";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_landing_page_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__landing_page_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__landing_page_v_published_locale" AS ENUM('fi', 'en');
  CREATE TABLE "landing_page_hero_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar
  );
  
  CREATE TABLE "landing_page_hero_links_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "landing_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"announcement_enabled" boolean DEFAULT false,
  	"announcement_color" varchar DEFAULT '#fbdb1d',
  	"announcement_text_color" varchar DEFAULT '#000000',
  	"_status" "enum_landing_page_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "landing_page_locales" (
  	"title" varchar,
  	"subtitle" varchar,
  	"announcement_content" jsonb,
  	"content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "landing_page_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "_landing_page_v_version_hero_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_landing_page_v_version_hero_links_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_landing_page_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_announcement_enabled" boolean DEFAULT false,
  	"version_announcement_color" varchar DEFAULT '#fbdb1d',
  	"version_announcement_text_color" varchar DEFAULT '#000000',
  	"version__status" "enum__landing_page_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__landing_page_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_landing_page_v_locales" (
  	"version_title" varchar,
  	"version_subtitle" varchar,
  	"version_announcement_content" jsonb,
  	"version_content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_landing_page_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  ALTER TABLE "pages" DROP CONSTRAINT "pages_background_image_id_media_id_fk";
  
  ALTER TABLE "_pages_v" DROP CONSTRAINT "_pages_v_version_background_image_id_media_id_fk";
  
  ALTER TABLE "main_navigation" DROP CONSTRAINT "main_navigation_floating_logo_id_media_id_fk";
  
  ALTER TABLE "_main_navigation_v" DROP CONSTRAINT "_main_navigation_v_version_floating_logo_id_media_id_fk";
  
  DROP INDEX "pages_background_image_idx";
  DROP INDEX "_pages_v_version_version_background_image_idx";
  DROP INDEX "main_navigation_floating_logo_idx";
  DROP INDEX "_main_navigation_v_version_version_floating_logo_idx";
  ALTER TABLE "landing_page_hero_links" ADD CONSTRAINT "landing_page_hero_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_page_hero_links_locales" ADD CONSTRAINT "landing_page_hero_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_page_hero_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_page_locales" ADD CONSTRAINT "landing_page_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_page_rels" ADD CONSTRAINT "landing_page_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."landing_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_page_rels" ADD CONSTRAINT "landing_page_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_landing_page_v_version_hero_links" ADD CONSTRAINT "_landing_page_v_version_hero_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_landing_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_landing_page_v_version_hero_links_locales" ADD CONSTRAINT "_landing_page_v_version_hero_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_landing_page_v_version_hero_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_landing_page_v_locales" ADD CONSTRAINT "_landing_page_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_landing_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_landing_page_v_rels" ADD CONSTRAINT "_landing_page_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_landing_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_landing_page_v_rels" ADD CONSTRAINT "_landing_page_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "landing_page_hero_links_order_idx" ON "landing_page_hero_links" USING btree ("_order");
  CREATE INDEX "landing_page_hero_links_parent_id_idx" ON "landing_page_hero_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "landing_page_hero_links_locales_locale_parent_id_unique" ON "landing_page_hero_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "landing_page_hero_links_locales_parent_id_idx" ON "landing_page_hero_links_locales" USING btree ("_parent_id");
  CREATE INDEX "landing_page__status_idx" ON "landing_page" USING btree ("_status");
  CREATE UNIQUE INDEX "landing_page_locales_locale_parent_id_unique" ON "landing_page_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "landing_page_locales_parent_id_idx" ON "landing_page_locales" USING btree ("_parent_id");
  CREATE INDEX "landing_page_rels_order_idx" ON "landing_page_rels" USING btree ("order");
  CREATE INDEX "landing_page_rels_parent_idx" ON "landing_page_rels" USING btree ("parent_id");
  CREATE INDEX "landing_page_rels_path_idx" ON "landing_page_rels" USING btree ("path");
  CREATE INDEX "landing_page_rels_media_id_idx" ON "landing_page_rels" USING btree ("media_id");
  CREATE INDEX "_landing_page_v_version_hero_links_order_idx" ON "_landing_page_v_version_hero_links" USING btree ("_order");
  CREATE INDEX "_landing_page_v_version_hero_links_parent_id_idx" ON "_landing_page_v_version_hero_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_landing_page_v_version_hero_links_locales_locale_parent_id_" ON "_landing_page_v_version_hero_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_landing_page_v_version_hero_links_locales_parent_id_idx" ON "_landing_page_v_version_hero_links_locales" USING btree ("_parent_id");
  CREATE INDEX "_landing_page_v_version_version__status_idx" ON "_landing_page_v" USING btree ("version__status");
  CREATE INDEX "_landing_page_v_created_at_idx" ON "_landing_page_v" USING btree ("created_at");
  CREATE INDEX "_landing_page_v_updated_at_idx" ON "_landing_page_v" USING btree ("updated_at");
  CREATE INDEX "_landing_page_v_snapshot_idx" ON "_landing_page_v" USING btree ("snapshot");
  CREATE INDEX "_landing_page_v_published_locale_idx" ON "_landing_page_v" USING btree ("published_locale");
  CREATE INDEX "_landing_page_v_latest_idx" ON "_landing_page_v" USING btree ("latest");
  CREATE INDEX "_landing_page_v_autosave_idx" ON "_landing_page_v" USING btree ("autosave");
  CREATE UNIQUE INDEX "_landing_page_v_locales_locale_parent_id_unique" ON "_landing_page_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_landing_page_v_locales_parent_id_idx" ON "_landing_page_v_locales" USING btree ("_parent_id");
  CREATE INDEX "_landing_page_v_rels_order_idx" ON "_landing_page_v_rels" USING btree ("order");
  CREATE INDEX "_landing_page_v_rels_parent_idx" ON "_landing_page_v_rels" USING btree ("parent_id");
  CREATE INDEX "_landing_page_v_rels_path_idx" ON "_landing_page_v_rels" USING btree ("path");
  CREATE INDEX "_landing_page_v_rels_media_id_idx" ON "_landing_page_v_rels" USING btree ("media_id");
  ALTER TABLE "pages" DROP COLUMN "background_image_id";
  ALTER TABLE "pages" DROP COLUMN "mirror_background_horizontally";
  ALTER TABLE "_pages_v" DROP COLUMN "version_background_image_id";
  ALTER TABLE "_pages_v" DROP COLUMN "version_mirror_background_horizontally";
  ALTER TABLE "main_navigation" DROP COLUMN "floating_logo_id";
  ALTER TABLE "_main_navigation_v" DROP COLUMN "version_floating_logo_id";`)
}
