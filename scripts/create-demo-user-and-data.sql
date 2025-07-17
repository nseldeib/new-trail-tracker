-- This script creates demo data after the demo user is created through Supabase Auth
-- You must first create the demo user through Supabase Auth UI:
-- Email: demo@workouttracker.com
-- Password: demo123456

DO $$
DECLARE
    demo_user_id UUID;
BEGIN
    -- Try to find the demo user
    SELECT id INTO demo_user_id 
    FROM auth.users 
    WHERE email = 'demo@workouttracker.com' 
    LIMIT 1;
    
    -- Only proceed if demo user exists
    IF demo_user_id IS NOT NULL THEN
        -- Ensure profile exists
        INSERT INTO profiles (id, email, full_name)
        VALUES (demo_user_id, 'demo@workouttracker.com', 'Demo User')
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            full_name = EXCLUDED.full_name;

        -- Insert sample workouts
        INSERT INTO workouts (user_id, activity_type, title, description, duration_minutes, distance, elevation_gain, difficulty, location, date) VALUES
        (demo_user_id, 'running', 'Morning Trail Run', 'Beautiful sunrise run through the forest trails', 45, 5.2, 300, 'Moderate', 'Forest Park Trail', '2024-01-15'),
        (demo_user_id, 'hiking', 'Mountain Peak Hike', 'Challenging hike to the summit with amazing views', 180, 8.5, 2200, 'Hard', 'Mount Wilson', '2024-01-12'),
        (demo_user_id, 'climbing', 'Indoor Bouldering', 'Great session working on V4 problems', 90, NULL, NULL, 'Moderate', 'Local Climbing Gym', '2024-01-10'),
        (demo_user_id, 'snowboarding', 'Powder Day at Resort', 'Amazing fresh powder conditions', 240, NULL, NULL, 'Moderate', 'Whistler Mountain', '2024-01-08'),
        (demo_user_id, 'running', 'Speed Intervals', 'Track workout focusing on 400m repeats', 60, 4.0, 0, 'Hard', 'Local Track', '2024-01-14')
        ON CONFLICT DO NOTHING;

        -- Insert sample goals
        INSERT INTO goals (user_id, title, description, activity_type, target_value, current_value, unit, target_date) VALUES
        (demo_user_id, 'Run 100 Miles This Month', 'Goal to run 100 miles in January', 'running', 100, 45.5, 'miles', '2024-01-31'),
        (demo_user_id, 'Climb 5.10a Route', 'Work up to climbing a 5.10a route outdoors', 'climbing', 1, 0, 'routes', '2024-03-01'),
        (demo_user_id, 'Hike 10 Peaks This Year', 'Challenge to summit 10 different peaks', 'hiking', 10, 3, 'peaks', '2024-12-31'),
        (demo_user_id, 'Snowboard 20 Days This Season', 'Get out on the mountain 20 times', 'snowboarding', 20, 8, 'days', '2024-04-01')
        ON CONFLICT DO NOTHING;

        RAISE NOTICE 'Demo data created successfully for user: %', demo_user_id;
    ELSE
        RAISE NOTICE 'Demo user not found. Please create a user with email demo@workouttracker.com through Supabase Auth first.';
        RAISE NOTICE 'Steps to create demo user:';
        RAISE NOTICE '1. Go to Supabase Dashboard > Authentication > Users';
        RAISE NOTICE '2. Click "Add user" and create user with:';
        RAISE NOTICE '   Email: demo@workouttracker.com';
        RAISE NOTICE '   Password: demo123456';
        RAISE NOTICE '3. Then run this script again';
    END IF;
END $$;
