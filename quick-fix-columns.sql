-- Quick fix to add missing columns
-- Run this in your Neon database console

-- Add missing columns to employees table
ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "teamLeadProjects" TEXT;
ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "loginEmail" TEXT;
ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "adrsId" TEXT;

-- Add missing columns to tasks table
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "rating" INTEGER;
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "feedback" TEXT;
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "ratedBy" TEXT;
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "ratedAt" TIMESTAMP(3);

-- Add check constraint for rating
ALTER TABLE "tasks" ADD CONSTRAINT IF NOT EXISTS "tasks_rating_check" CHECK ("rating" >= 1 AND "rating" <= 5);

-- Add unique constraints if they don't exist
CREATE UNIQUE INDEX IF NOT EXISTS "employees_loginEmail_key" ON "employees"("loginEmail");
CREATE UNIQUE INDEX IF NOT EXISTS "employees_adrsId_key" ON "employees"("adrsId");

SELECT 'Missing columns added successfully!' as status;