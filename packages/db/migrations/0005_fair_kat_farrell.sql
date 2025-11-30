ALTER TABLE "tasks" ALTER COLUMN "task_number" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_project_id_task_number_unique" UNIQUE("project_id","task_number");