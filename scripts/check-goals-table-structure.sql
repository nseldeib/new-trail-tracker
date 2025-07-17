-- Script to check the current structure of the goals table
-- This will help us understand what columns exist and their constraints

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'goals' 
ORDER BY ordinal_position;

-- Also check constraints
SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'goals';

-- Check if there are any existing records
SELECT COUNT(*) as existing_goals_count FROM goals;
