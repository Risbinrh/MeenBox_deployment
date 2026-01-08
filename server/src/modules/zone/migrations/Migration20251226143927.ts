import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20251226143927 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "zone" ("id" text not null, "zone_name" text not null, "center_lat" integer not null, "center_lng" integer not null, "radius_km" integer not null, "delivery_charge" integer not null, "min_order_amount" integer not null, "is_active" boolean not null default true, "delivery_slots" jsonb not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "zone_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_zone_deleted_at" ON "zone" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "zone" cascade;`);
  }

}
