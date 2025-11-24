ALTER TABLE "projects" ADD COLUMN "key" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "start_date" timestamp;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "end_date" timestamp;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "priority" "priority" DEFAULT 'medium';--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "category" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "settings" jsonb;