DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'service_job_status' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE "public"."service_job_status" AS ENUM('pending', 'scheduled', 'in_progress', 'completed', 'cancelled');
  END IF;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "service_job_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"product_id" uuid,
	"description" varchar(255) NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"line_total" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "service_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_number" varchar(50) NOT NULL,
	"customer_id" uuid NOT NULL,
	"service_id" uuid,
	"scheduled_at" timestamp,
	"status" "service_job_status" DEFAULT 'pending' NOT NULL,
	"address" text,
	"notes" text,
	"total_amount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"handled_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "service_jobs_job_number_unique" UNIQUE("job_number")
);
--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'service_job_items_job_id_service_jobs_id_fk') THEN
    ALTER TABLE "service_job_items" ADD CONSTRAINT "service_job_items_job_id_service_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."service_jobs"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'service_job_items_product_id_products_id_fk') THEN
    ALTER TABLE "service_job_items" ADD CONSTRAINT "service_job_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'service_jobs_customer_id_customers_id_fk') THEN
    ALTER TABLE "service_jobs" ADD CONSTRAINT "service_jobs_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'service_jobs_service_id_services_id_fk') THEN
    ALTER TABLE "service_jobs" ADD CONSTRAINT "service_jobs_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'service_jobs_handled_by_users_id_fk') THEN
    ALTER TABLE "service_jobs" ADD CONSTRAINT "service_jobs_handled_by_users_id_fk" FOREIGN KEY ("handled_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  END IF;
END $$;
