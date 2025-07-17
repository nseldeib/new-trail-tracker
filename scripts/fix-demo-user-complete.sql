-- Complete script to create and fix demo user with all required data

-- Step 1: Create or update the demo user in auth.users
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    confirmation_sent_at,
    recovery_sent_at,
    email_change_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    phone,
    phone_confirmed_at,
    phone_change,
    phone_change_token,
    phone_change_sent_at,
    confirmed_at,
    email_change_token_current,
    email_change_confirm_status,
    banned_until,
    reauthentication_token,
    reauthentication_sent_at,
    is_sso_user,
    deleted_at
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'demo@workouttracker.com',
    crypt('demo123456', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Demo User"}',
    false,
    NOW(),
    NOW(),
    null,
    null,
    '',
    '',
    null,
    NOW(),
    '',
    0,
    null,
    '',
    null,
    false,
    null
) ON CONFLICT (email) DO UPDATE SET
    encrypted_password = crypt('demo123456', gen_salt('bf')),
    email_confirmed_at = NOW(),
    confirmed_at = NOW(),
    updated_at = NOW();

-- Step 2: Get the demo user ID and create profile + data
DO $$
DECLARE
    demo_user_id UUID;
BEGIN
    -- Get the demo user ID
    SELECT id INTO demo_user_id 
    FROM auth.users 
    WHERE email = 'demo@workouttracker.com';
    
    IF demo_user_id IS NOT NULL THEN
        -- Create/update profile
        INSERT INTO profiles (id, email, full_name, created_at, updated_at)
        VALUES (demo_user_id, 'demo@workouttracker.com', 'Demo User', NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            full_name = EXCLUDED.full_name,
            updated_at = NOW();

        -- Clear existing demo data
        DELETE FROM workouts WHERE user_id = demo_user_id;
        DELETE FROM goals WHERE user_id = demo_user_id;

        -- Insert workout data
        INSERT INTO workouts (
            user_id, activity_type, title, description, 
            duration_minutes, distance, elevation_gain, 
            difficulty, location, date, created_at, updated_at
        ) VALUES
        (demo_user_id, 'running', 'Morning Trail Run', 'Beautiful sunrise run through the forest trails', 45, 5.2, 300, 'Moderate', 'Forest Park Trail', CURRENT_DATE - INTERVAL '5 days', NOW(), NOW()),
        (demo_user_id, 'hiking', 'Mountain Peak Hike', 'Challenging hike to the summit with amazing views', 180, 8.5, 2200, 'Hard', 'Mount Wilson', CURRENT_DATE - INTERVAL '8 days', NOW(), NOW()),
        (demo_user_id, 'climbing', 'Indoor Bouldering', 'Great session working on V4 problems', 90, NULL, NULL, 'Moderate', 'Local Climbing Gym', CURRENT_DATE - INTERVAL '10 days', NOW(), NOW()),
        (demo_user_id, 'snowboarding', 'Powder Day at Resort', 'Amazing fresh powder conditions', 240, NULL, NULL, 'Moderate', 'Whistler Mountain', CURRENT_DATE - INTERVAL '12 days', NOW(), NOW()),
        (demo_user_id, 'running', 'Speed Intervals', 'Track workout focusing on 400m repeats', 60, 4.0, 0, 'Hard', 'Local Track', CURRENT_DATE - INTERVAL '1 day', NOW(), NOW());

        -- Insert goals data (check which column exists)
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'goals' AND column_name = 'goal_type') THEN
            INSERT INTO goals (
                user_id, title, description, goal_type, 
                target_value, current_value, unit, target_date, 
                is_completed, created_at, updated_at
            ) VALUES
            (demo_user_id, 'Run 100 Miles This Month', 'Goal to run 100 miles in January', 'distance', 100, 45.5, 'miles', CURRENT_DATE + INTERVAL '25 days', false, NOW(), NOW()),
            (demo_user_id, 'Climb 5.10a Route', 'Work up to climbing a 5.10a route outdoors', 'skill', 1, 0, 'routes', CURRENT_DATE + INTERVAL '60 days', false, NOW(), NOW()),
            (demo_user_id, 'Hike 10 Peaks This Year', 'Challenge to summit 10 different peaks', 'count', 10, 3, 'peaks', CURRENT_DATE + INTERVAL '300 days', false, NOW(), NOW()),
            (demo_user_id, 'Snowboard 20 Days This Season', 'Get out on the mountain 20 times', 'frequency', 20, 8, 'days', CURRENT_DATE + INTERVAL '90 days', false, NOW(), NOW());
        ELSE
            INSERT INTO goals (
                user_id, title, description, activity_type, 
                target_value, current_value, unit, target_date, 
                is_completed, created_at, updated_at
            ) VALUES
            (demo_user_id, 'Run 100 Miles This Month', 'Goal to run 100 miles in January', 'running', 100, 45.5, 'miles', CURRENT_DATE + INTERVAL '25 days', false, NOW(), NOW()),
            (demo_user_id, 'Climb 5.10a Route', 'Work up to climbing a 5.10a route outdoors', 'climbing', 1, 0, 'routes', CURRENT_DATE + INTERVAL '60 days', false, NOW(), NOW()),
            (demo_user_id, 'Hike 10 Peaks This Year', 'Challenge to summit 10 different peaks', 'hiking', 10, 3, 'peaks', CURRENT_DATE + INTERVAL '300 days', false, NOW(), NOW()),
            (demo_user_id, 'Snowboard 20 Days This Season', 'Get out on the mountain 20 times', 'snowboarding', 20, 8, 'days', CURRENT_DATE + INTERVAL '90 days', false, NOW(), NOW());
        END IF;
    END IF;
END $$;

-- Step 3: Verify everything was created correctly
SELECT 
    'Demo User Setup Complete' as status,
    u.email,
    p.full_name,
    (SELECT COUNT(*) FROM workouts WHERE user_id = u.id) as workout_count,
    (SELECT COUNT(*) FROM goals WHERE user_id = u.id) as goal_count
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'demo@workouttracker.com';
