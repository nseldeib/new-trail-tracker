-- Script to update the workouts table to match our expected structure
-- This handles the case where there might be a 'name' column instead of 'title'

DO $$
BEGIN
    -- Check if 'name' column exists and 'title' doesn't
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workouts' AND column_name = 'name')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workouts' AND column_name = 'title') THEN
        
        -- Rename 'name' column to 'title' to match our app structure
        ALTER TABLE workouts RENAME COLUMN name TO title;
        
    END IF;

    -- If both 'name' and 'title' exist, we need to handle this carefully
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workouts' AND column_name = 'name')
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workouts' AND column_name = 'title') THEN
        
        -- Update title from name where title is null
        UPDATE workouts SET title = name WHERE title IS NULL;
        
        -- Drop the name column since we're using title
        ALTER TABLE workouts DROP COLUMN name;
        
    END IF;

    -- Ensure title column exists and is not null
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workouts' AND column_name = 'title') THEN
        ALTER TABLE workouts ADD COLUMN title TEXT NOT NULL DEFAULT 'Untitled Workout';
    END IF;

    -- Make sure title is not null
    ALTER TABLE workouts ALTER COLUMN title SET NOT NULL;
    
END $$;
