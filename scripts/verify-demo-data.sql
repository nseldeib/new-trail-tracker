-- Script to verify that demo data was inserted correctly

-- Check if demo user exists
SELECT 
    u.id,
    u.email,
    u.created_at as user_created,
    p.full_name,
    p.created_at as profile_created
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'demo@workouttracker.com';

-- Check demo workouts
SELECT 
    id,
    activity_type,
    title,
    description,
    duration_minutes,
    distance,
    difficulty,
    location,
    date
FROM workouts 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'demo@workouttracker.com')
ORDER BY date DESC;

-- Check demo goals
SELECT 
    id,
    title,
    description,
    activity_type,
    target_value,
    current_value,
    unit,
    target_date,
    is_completed
FROM goals 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'demo@workouttracker.com')
ORDER BY created_at DESC;
