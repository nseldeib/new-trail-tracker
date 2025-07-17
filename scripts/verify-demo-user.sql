-- Script to verify if demo user exists and check its status

-- Check if demo user exists in auth.users
SELECT 
    'auth.users' as table_name,
    id,
    email,
    email_confirmed_at,
    created_at,
    last_sign_in_at,
    CASE 
        WHEN email_confirmed_at IS NOT NULL THEN 'Confirmed'
        ELSE 'Not Confirmed'
    END as status
FROM auth.users 
WHERE email = 'demo@workouttracker.com'

UNION ALL

-- Check if profile exists
SELECT 
    'profiles' as table_name,
    id,
    email,
    created_at,
    updated_at,
    CASE 
        WHEN full_name IS NOT NULL THEN 'Profile Complete'
        ELSE 'Profile Incomplete'
    END as status
FROM profiles 
WHERE email = 'demo@workouttracker.com';

-- Count demo user's data
SELECT 
    'Data Summary' as info,
    (SELECT COUNT(*) FROM workouts WHERE user_id = (SELECT id FROM auth.users WHERE email = 'demo@workouttracker.com'))::text as workouts,
    (SELECT COUNT(*) FROM goals WHERE user_id = (SELECT id FROM auth.users WHERE email = 'demo@workouttracker.com'))::text as goals,
    ''::timestamp as created_at,
    ''::timestamp as updated_at,
    'Data Counts' as status;
