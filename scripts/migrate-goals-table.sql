-- Migration script to update existing goals table structure

-- Check if goals table exists, if not create it
CREATE TABLE IF NOT EXISTS goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  activity_type TEXT,
  target_value DECIMAL(10,2),
  current_value DECIMAL(10,2) DEFAULT 0,
  unit TEXT,
  target_date DATE,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to goals table if they don't exist
DO $$
BEGIN
    -- Add activity_type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'goals' AND column_name = 'activity_type') THEN
        ALTER TABLE goals ADD COLUMN activity_type TEXT;
        RAISE NOTICE 'Added activity_type column to goals table';
    END IF;

    -- Add target_value column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'goals' AND column_name = 'target_value') THEN
        ALTER TABLE goals ADD COLUMN target_value DECIMAL(10,2);
        RAISE NOTICE 'Added target_value column to goals table';
    END IF;

    -- Add current_value column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'goals' AND column_name = 'current_value') THEN
        ALTER TABLE goals ADD COLUMN current_value DECIMAL(10,2) DEFAULT 0;
        RAISE NOTICE 'Added current_value column to goals table';
    END IF;

    -- Add unit column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'goals' AND column_name = 'unit') THEN
        ALTER TABLE goals ADD COLUMN unit TEXT;
        RAISE NOTICE 'Added unit column to goals table';
    END IF;

    -- Add target_date column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'goals' AND column_name = 'target_date') THEN
        ALTER TABLE goals ADD COLUMN target_date DATE;
        RAISE NOTICE 'Added target_date column to goals table';
    END IF;

    -- Add is_completed column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'goals' AND column_name = 'is_completed') THEN
        ALTER TABLE goals ADD COLUMN is_completed BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added is_completed column to goals table';
    END IF;
END $$;

-- Add activity_type constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints 
                   WHERE constraint_name = 'goals_activity_type_check') THEN
        ALTER TABLE goals ADD CONSTRAINT goals_activity_type_check 
        CHECK (activity_type IN ('running', 'climbing', 'hiking', 'snowboarding', 'general'));
        RAISE NOTICE 'Added activity_type check constraint to goals';
    END IF;
END $$;

-- Enable RLS if not already enabled
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for goals if they don't exist
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view own goals" ON goals;
    DROP POLICY IF EXISTS "Users can insert own goals" ON goals;
    DROP POLICY IF EXISTS "Users can update own goals" ON goals;
    DROP POLICY IF EXISTS "Users can delete own goals" ON goals;

    -- Create new policies
    CREATE POLICY "Users can view own goals" ON goals FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can insert own goals" ON goals FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Users can update own goals" ON goals FOR UPDATE USING (auth.uid() = user_id);
    CREATE POLICY "Users can delete own goals" ON goals FOR DELETE USING (auth.uid() = user_id);
    
    RAISE NOTICE 'Created RLS policies for goals table';
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS goals_user_id_idx ON goals(user_id);
CREATE INDEX IF NOT EXISTS goals_activity_type_idx ON goals(activity_type);
CREATE INDEX IF NOT EXISTS goals_is_completed_idx ON goals(is_completed);

RAISE NOTICE 'Goals table migration completed successfully!';
