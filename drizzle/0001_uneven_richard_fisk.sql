CREATE TYPE "public"."delivery_type" AS ENUM('pickup', 'delivery');--> statement-breakpoint
ALTER TYPE "public"."request_status" ADD VALUE 'out_for_delivery' BEFORE 'rejected';--> statement-breakpoint
ALTER TABLE "requests" ADD COLUMN "delivery_type" "delivery_type";--> statement-breakpoint
ALTER TABLE "requests" ADD COLUMN "delivery_address" text;--> statement-breakpoint
ALTER TABLE "requests" ADD COLUMN "delivery_date" date;--> statement-breakpoint
ALTER TABLE "requests" ADD COLUMN "driver_id" uuid;--> statement-breakpoint
ALTER TABLE "requests" ADD CONSTRAINT "requests_driver_id_users_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;