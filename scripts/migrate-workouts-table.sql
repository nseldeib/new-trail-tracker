-- Migration script to update existing workouts table structure
-- This handles the case where the table exists but has different columns

-- First, let's check what columns exist and add missing ones
DO $$
BEGIN
    -- Add activity_type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'workouts' AND column_name = 'activity_type') THEN
        ALTER TABLE workouts ADD COLUMN activity_type TEXT;
        RAISE NOTICE 'Added activity_type column to workouts table';
    END IF;

    -- Add title column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'workouts' AND column_name = 'title') THEN
        ALTER TABLE workouts ADD COLUMN title TEXT;
        RAISE NOTICE 'Added title column to workouts table';
    END IF;

    -- Add description column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'workouts' AND column_name = 'description') THEN
        ALTER TABLE workouts ADD COLUMN description TEXT;
        RAISE NOTICE 'Added description column to workouts table';
    END IF;

    -- Add duration_minutes column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'workouts' AND column_name = 'duration_minutes') THEN
        ALTER TABLE workouts ADD COLUMN duration_minutes INTEGER;
        RAISE NOTICE 'Added duration_minutes column to workouts table';
    END IF;

    -- Add distance column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'workouts' AND column_name = 'distance') THEN
        ALTER TABLE workouts ADD COLUMN distance DECIMAL(6,2);
        RAISE NOTICE 'Added distance column to workouts table';
    END IF;

    -- Add elevation_gain column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'workouts' AND column_name = 'elevation_gain') THEN
        ALTER TABLE workouts ADD COLUMN elevation_gain INTEGER;
        RAISE NOTICE 'Added elevation_gain column to workouts table';
    END IF;

    -- Add difficulty column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'workouts' AND column_name = 'difficulty') THEN
        ALTER TABLE workouts ADD COLUMN difficulty TEXT;
        RAISE NOTICE 'Added difficulty column to workouts table';
    END IF;

    -- Add location column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'workouts' AND column_name = 'location') THEN
        ALTER TABLE workouts ADD COLUMN location TEXT;
        RAISE NOTICE 'Added location column to workouts table';
    END IF;

    -- Add notes column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'workouts' AND column_name = 'notes') THEN
        ALTER TABLE workouts ADD COLUMN notes TEXT;
        RAISE NOTICE 'Added notes column to workouts table';
    END IF;

    -- Add date column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'workouts' AND column_name = 'date') THEN
        ALTER TABLE workouts ADD COLUMN date DATE DEFAULT CURRENT_DATE;
        RAISE NOTICE 'Added date column to workouts table';
    END IF;
END $$;

-- Now add constraints after columns exist
DO $$
BEGIN
    -- Add activity_type constraint if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints 
                   WHERE constraint_name = 'workouts_activity_type_check') THEN
        ALTER TABLE workouts ADD CONSTRAINT workouts_activity_type_check 
        CHECK (activity_type IN ('running', 'climbing', 'hiking', 'snowboarding'));
        RAISE NOTICE 'Added activity_type check constraint';
    END IF;

    -- Add difficulty constraint if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints 
                   WHERE constraint_name = 'workouts_difficulty_check') THEN
        ALTER TABLE workouts ADD CONSTRAINT workouts_difficulty_check 
        CHECK (difficulty IN ('Easy', 'Moderate', 'Hard', 'Expert'));
        RAISE NOTICE 'Added difficulty check constraint';
    END IF;
END $$;

-- Update existing records to have default values if they're null
UPDATE workouts SET 
    activity_type = 'running' 
WHERE activity_type IS NULL;

UPDATE workouts SET 
    title = 'Workout ' || id::text 
WHERE title IS NULL;

-- Make required columns NOT NULL after setting defaults
ALTER TABLE workouts ALTER COLUMN activity_type SET NOT NULL;
ALTER TABLE workouts ALTER COLUMN title SET NOT NULL;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS workouts_user_id_idx ON workouts(user_id);
CREATE INDEX IF NOT EXISTS workouts_date_idx ON workouts(date DESC);
CREATE INDEX IF NOT EXISTS workouts_activity_type_idx ON workouts(activity_type);

RAISE NOTICE 'Workouts table migration completed successfully!';
