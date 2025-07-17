-- Script to handle the goal_type column in the goals table
-- This ensures compatibility between the existing table and our app

DO $$
BEGIN
    -- Check if goal_type column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'goals' AND column_name = 'goal_type') THEN
        -- If goal_type exists but activity_type doesn't, rename it
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'goals' AND column_name = 'activity_type') THEN
            ALTER TABLE goals RENAME COLUMN goal_type TO activity_type;
        ELSE
            -- Both exist, update activity_type from goal_type where activity_type is null
            UPDATE goals SET activity_type = goal_type WHERE activity_type IS NULL;
            -- Then drop goal_type since we're using activity_type
            ALTER TABLE goals DROP COLUMN goal_type;
        END IF;
    END IF;

    -- Ensure activity_type column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'goals' AND column_name = 'activity_type') THEN
        ALTER TABLE goals ADD COLUMN activity_type TEXT;
    END IF;

    -- Update any null activity_type values
    UPDATE goals SET activity_type = 'general' WHERE activity_type IS NULL;
    
END $$;
