-- Script to check the current structure of the workouts table
-- This will help us understand what columns exist and their constraints

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'workouts' 
ORDER BY ordinal_position;

-- Also check constraints
SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'workouts';

-- Check if there are any existing records
SELECT COUNT(*) as existing_workout_count FROM workouts;
