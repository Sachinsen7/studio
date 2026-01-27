-- Add rating fields to Task table
ALTER TABLE "tasks" ADD COLUMN "rating" INTEGER;
ALTER TABLE "tasks" ADD COLUMN "feedback" TEXT;
ALTER TABLE "tasks" ADD COLUMN "ratedBy" TEXT;
ALTER TABLE "tasks" ADD COLUMN "ratedAt" TIMESTAMP(3);

-- Add check constraint for rating (1-5 scale)
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_rating_check" CHECK ("rating" >= 1 AND "rating" <= 5);