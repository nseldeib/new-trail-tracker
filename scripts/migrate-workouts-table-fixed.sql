-- Migration script to update existing workouts table structure

-- Add missing columns to workouts table if they don't exist
DO $$
BEGIN
    -- Add activity_type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'workouts' AND column_name = 'activity_type') THEN
        ALTER TABLE workouts ADD COLUMN activity_type TEXT;
    END IF;

    -- Add title column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'workouts' AND column_name = 'title') THEN
        ALTER TABLE workouts ADD COLUMN title TEXT;
    END IF;

    -- Add description column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'workouts' AND column_name = 'description') THEN
        ALTER TABLE workouts ADD COLUMN description TEXT;
    END IF;

    -- Add duration_minutes column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'workouts' AND column_name = 'duration_minutes') THEN
        ALTER TABLE workouts ADD COLUMN duration_minutes INTEGER;
    END IF;

    -- Add distance column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'workouts' AND column_name = 'distance') THEN
        ALTER TABLE workouts ADD COLUMN distance DECIMAL(6,2);
    END IF;

    -- Add elevation_gain column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'workouts' AND column_name = 'elevation_gain') THEN
        ALTER TABLE workouts ADD COLUMN elevation_gain INTEGER;
    END IF;

    -- Add difficulty column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'workouts' AND column_name = 'difficulty') THEN
        ALTER TABLE workouts ADD COLUMN difficulty TEXT;
    END IF;

    -- Add location column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'workouts' AND column_name = 'location') THEN
        ALTER TABLE workouts ADD COLUMN location TEXT;
    END IF;

    -- Add notes column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'workouts' AND column_name = 'notes') THEN
        ALTER TABLE workouts ADD COLUMN notes TEXT;
    END IF;

    -- Add date column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'workouts' AND column_name = 'date') THEN
        ALTER TABLE workouts ADD COLUMN date DATE DEFAULT CURRENT_DATE;
    END IF;
END $$;

-- Update existing records to have default values if they're null
UPDATE workouts SET activity_type = 'running' WHERE activity_type IS NULL;
UPDATE workouts SET title = 'Workout ' || id::text WHERE title IS NULL;

-- Make required columns NOT NULL after setting defaults
ALTER TABLE workouts ALTER COLUMN activity_type SET NOT NULL;
ALTER TABLE workouts ALTER COLUMN title SET NOT NULL;

-- Drop existing constraints if they exist
ALTER TABLE workouts DROP CONSTRAINT IF EXISTS workouts_activity_type_check;
ALTER TABLE workouts DROP CONSTRAINT IF EXISTS workouts_difficulty_check;

-- Add constraints
ALTER TABLE workouts ADD CONSTRAINT workouts_activity_type_check 
CHECK (activity_type IN ('running', 'climbing', 'hiking', 'snowboarding'));

ALTER TABLE workouts ADD CONSTRAINT workouts_difficulty_check 
CHECK (difficulty IN ('Easy', 'Moderate', 'Hard', 'Expert'));

-- Enable RLS if not already enabled
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own workouts" ON workouts;
DROP POLICY IF EXISTS "Users can insert own workouts" ON workouts;
DROP POLICY IF EXISTS "Users can update own workouts" ON workouts;
DROP POLICY IF EXISTS "Users can delete own workouts" ON workouts;

-- Create new policies
CREATE POLICY "Users can view own workouts" ON workouts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own workouts" ON workouts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workouts" ON workouts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own workouts" ON workouts FOR DELETE USING (auth.uid() = user_id);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS workouts_user_id_idx ON workouts(user_id);
CREATE INDEX IF NOT EXISTS workouts_date_idx ON workouts(date DESC);
CREATE INDEX IF NOT EXISTS workouts_activity_type_idx ON workouts(activity_type);
