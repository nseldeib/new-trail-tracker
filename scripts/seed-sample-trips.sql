-- Insert sample trips for the demo user
-- First, get the demo user's ID
DO $$
DECLARE
    demo_user_id UUID;
BEGIN
    -- Get the demo user ID
    SELECT id INTO demo_user_id 
    FROM auth.users 
    WHERE email = 'demo@trailtracker.com';
    
    -- Only insert if demo user exists
    IF demo_user_id IS NOT NULL THEN
        -- Insert sample trips
        INSERT INTO public.trips (user_id, trail_name, date, type, notes) VALUES
        (demo_user_id, 'Mount Washington', '2024-01-15', 'Hike', 'Beautiful clear day with amazing views from the summit. Trail was icy in some sections.'),
        (demo_user_id, 'El Capitan', '2024-01-08', 'Climb', 'Multi-pitch climb on the Nose route. Took 3 days to complete. Incredible experience!'),
        (demo_user_id, 'Whistler Village', '2023-12-22', 'Snowboard', 'Fresh powder day! Spent most time on the back bowls. Perfect conditions.'),
        (demo_user_id, 'Moab Slickrock', '2023-12-10', 'Mountain Bike', 'Challenging technical trail with stunning red rock scenery. Bike handled great.'),
        (demo_user_id, 'Angels Landing', '2023-11-28', 'Hike', 'Scary but rewarding hike with chains section. Views of Zion Canyon were worth it.'),
        (demo_user_id, 'Vail Back Bowls', '2023-11-15', 'Ski', 'Great day skiing the back bowls. Snow conditions were perfect after recent storm.'),
        (demo_user_id, 'John Muir Trail', '2023-10-20', 'Backpack', '5-day backpacking trip through the Sierra Nevada. Saw incredible alpine lakes and peaks.'),
        (demo_user_id, 'Runyon Canyon', '2023-10-05', 'Trail Run', 'Quick morning trail run with city views. Good workout to start the day.');
        
        RAISE NOTICE 'Sample trips inserted successfully for demo user';
    ELSE
        RAISE NOTICE 'Demo user not found, skipping trips insertion';
    END IF;
END $$;
