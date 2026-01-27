-- Add rating fields to tasks table if they don't exist
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

-- Add check constraint for rating (1-5 scale) if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'tasks_rating_check') THEN
        ALTER TABLE "tasks" ADD CONSTRAINT "tasks_rating_check" CHECK ("rating" >= 1 AND "rating" <= 5);
    END IF;
END $$;