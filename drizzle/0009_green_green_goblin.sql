ALTER TABLE "appointments" ADD COLUMN "downpayment_amount" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "downpayment_paid" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "downpayment_method" "payment_method";--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "downpayment_paid_at" timestamp;