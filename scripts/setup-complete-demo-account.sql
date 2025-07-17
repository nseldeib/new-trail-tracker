-- Complete script to set up demo account with all data
-- Run this after creating the demo user

DO $$
DECLARE
    demo_user_id UUID;
BEGIN
    -- Get the demo user ID
    SELECT id INTO demo_user_id 
    FROM auth.users 
    WHERE email = 'demo@workouttracker.com' 
    LIMIT 1;
    
    IF demo_user_id IS NOT NULL THEN
        -- Create profile
        INSERT INTO profiles (id, email, full_name)
        VALUES (demo_user_id, 'demo@workouttracker.com', 'Demo User')
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            full_name = EXCLUDED.full_name;

        -- Clear existing demo data to avoid conflicts
        DELETE FROM workouts WHERE user_id = demo_user_id;
        DELETE FROM goals WHERE user_id = demo_user_id;

        -- Insert fresh workout data
        INSERT INTO workouts (
            user_id, activity_type, title, description, 
            duration_minutes, distance, elevation_gain, 
            difficulty, location, date
        ) VALUES
        (demo_user_id, 'running', 'Morning Trail Run', 'Beautiful sunrise run through the forest trails', 45, 5.2, 300, 'Moderate', 'Forest Park Trail', CURRENT_DATE - INTERVAL '5 days'),
        (demo_user_id, 'hiking', 'Mountain Peak Hike', 'Challenging hike to the summit with amazing views', 180, 8.5, 2200, 'Hard', 'Mount Wilson', CURRENT_DATE - INTERVAL '8 days'),
        (demo_user_id, 'climbing', 'Indoor Bouldering', 'Great session working on V4 problems', 90, NULL, NULL, 'Moderate', 'Local Climbing Gym', CURRENT_DATE - INTERVAL '10 days'),
        (demo_user_id, 'snowboarding', 'Powder Day at Resort', 'Amazing fresh powder conditions', 240, NULL, NULL, 'Moderate', 'Whistler Mountain', CURRENT_DATE - INTERVAL '12 days'),
        (demo_user_id, 'running', 'Speed Intervals', 'Track workout focusing on 400m repeats', 60, 4.0, 0, 'Hard', 'Local Track', CURRENT_DATE - INTERVAL '1 day');

        -- Insert fresh goals data (handling both possible column names)
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'goals' AND column_name = 'goal_type') THEN
            -- Table has goal_type column
            INSERT INTO goals (
                user_id, title, description, goal_type, 
                target_value, current_value, unit, target_date
            ) VALUES
            (demo_user_id, 'Run 100 Miles This Month', 'Goal to run 100 miles in January', 'distance', 100, 45.5, 'miles', CURRENT_DATE + INTERVAL '25 days'),
            (demo_user_id, 'Climb 5.10a Route', 'Work up to climbing a 5.10a route outdoors', 'skill', 1, 0, 'routes', CURRENT_DATE + INTERVAL '60 days'),
            (demo_user_id, 'Hike 10 Peaks This Year', 'Challenge to summit 10 different peaks', 'count', 10, 3, 'peaks', CURRENT_DATE + INTERVAL '300 days'),
            (demo_user_id, 'Snowboard 20 Days This Season', 'Get out on the mountain 20 times', 'frequency', 20, 8, 'days', CURRENT_DATE + INTERVAL '90 days');
        ELSE
            -- Table has activity_type column
            INSERT INTO goals (
                user_id, title, description, activity_type, 
                target_value, current_value, unit, target_date
            ) VALUES
            (demo_user_id, 'Run 100 Miles This Month', 'Goal to run 100 miles in January', 'running', 100, 45.5, 'miles', CURRENT_DATE + INTERVAL '25 days'),
            (demo_user_id, 'Climb 5.10a Route', 'Work up to climbing a 5.10a route outdoors', 'climbing', 1, 0, 'routes', CURRENT_DATE + INTERVAL '60 days'),
            (demo_user_id, 'Hike 10 Peaks This Year', 'Challenge to summit 10 different peaks', 'hiking', 10, 3, 'peaks', CURRENT_DATE + INTERVAL '300 days'),
            (demo_user_id, 'Snowboard 20 Days This Season', 'Get out on the mountain 20 times', 'snowboarding', 20, 8, 'days', CURRENT_DATE + INTERVAL '90 days');
        END IF;

    END IF;
END $$;

-- Verify everything was created
SELECT 
    'Demo User' as type,
    u.email,
    p.full_name,
    (SELECT COUNT(*) FROM workouts WHERE user_id = u.id) as workout_count,
    (SELECT COUNT(*) FROM goals WHERE user_id = u.id) as goal_count
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'demo@workouttracker.com';
