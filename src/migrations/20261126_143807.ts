import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "site_design" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"background_image_id" integer,
  	"mirror_background_horizontally" boolean DEFAULT true,
  	"side_graphic_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "pages" DROP CONSTRAINT "pages_background_image_id_media_id_fk";
  
  ALTER TABLE "_pages_v" DROP CONSTRAINT "_pages_v_version_background_image_id_media_id_fk";
  
  DROP INDEX "pages_background_image_idx";
  DROP INDEX "_pages_v_version_version_background_image_idx";
  ALTER TABLE "site_design" ADD CONSTRAINT "site_design_background_image_id_media_id_fk" FOREIGN KEY ("background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_design" ADD CONSTRAINT "site_design_side_graphic_id_media_id_fk" FOREIGN KEY ("side_graphic_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "site_design_background_image_idx" ON "site_design" USING btree ("background_image_id");
  CREATE INDEX "site_design_side_graphic_idx" ON "site_design" USING btree ("side_graphic_id");
  ALTER TABLE "pages" DROP COLUMN "background_image_id";
  ALTER TABLE "pages" DROP COLUMN "mirror_background_horizontally";
  ALTER TABLE "_pages_v" DROP COLUMN "version_background_image_id";
  ALTER TABLE "_pages_v" DROP COLUMN "version_mirror_background_horizontally";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_design" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "site_design" CASCADE;
  ALTER TABLE "pages" ADD COLUMN "background_image_id" integer;
  ALTER TABLE "pages" ADD COLUMN "mirror_background_horizontally" boolean DEFAULT true;
  ALTER TABLE "_pages_v" ADD COLUMN "version_background_image_id" integer;
  ALTER TABLE "_pages_v" ADD COLUMN "version_mirror_background_horizontally" boolean DEFAULT true;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_background_image_id_media_id_fk" FOREIGN KEY ("background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_background_image_id_media_id_fk" FOREIGN KEY ("version_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_background_image_idx" ON "pages" USING btree ("background_image_id");
  CREATE INDEX "_pages_v_version_version_background_image_idx" ON "_pages_v" USING btree ("version_background_image_id");`)
}
