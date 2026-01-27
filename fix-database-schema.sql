-- Fix database schema issues
-- Run this script directly on your PostgreSQL database

-- Step 1: Add new ProjectType enum values if they don't exist
DO $$ 
BEGIN
    -- Add Product to ProjectType enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'Product' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'ProjectType')) THEN
        ALTER TYPE "ProjectType" ADD VALUE 'Product';
    END IF;
    
    -- Add Project to ProjectType enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'Project' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'ProjectType')) THEN
        ALTER TYPE "ProjectType" ADD VALUE 'Project';
    END IF;
END $$;

-- Step 2: Migrate existing data from old enum values to new ones
UPDATE "projects" SET "projectType" = 'Project' WHERE "projectType" = 'Company';
UPDATE "projects" SET "projectType" = 'Product' WHERE "projectType" = 'EmployeeSpecific';

-- Step 3: Add rating fields to tasks table if they don't exist
DO $$ 
BEGIN
    -- Add rating column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'rating') THEN
        ALTER TABLE "tasks" ADD COLUMN "rating" INTEGER;
    END IF;
    
    -- Add feedback column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'feedback') THEN
        ALTER TABLE "tasks" ADD COLUMN "feedback" TEXT;
    END IF;
    
    -- Add ratedBy column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'ratedBy') THEN
        ALTER TABLE "tasks" ADD COLUMN "ratedBy" TEXT;
    END IF;
    
    -- Add ratedAt column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'ratedAt') THEN
        ALTER TABLE "tasks" ADD COLUMN "ratedAt" TIMESTAMP(3);
    END IF;
END $$;

-- Step 4: Add check constraint for rating (1-5 scale) if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'tasks_rating_check') THEN
        ALTER TABLE "tasks" ADD CONSTRAINT "tasks_rating_check" CHECK ("rating" >= 1 AND "rating" <= 5);
    END IF;
END $$;

-- Step 5: Verify the changes
SELECT 'Schema update completed successfully' as status;