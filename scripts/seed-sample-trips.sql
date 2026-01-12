-- Insert sample trips for the demo user
-- First, get the demo user ID
DO $$
DECLARE
    demo_user_id UUID;
BEGIN
    -- Get the demo user ID
    SELECT id INTO demo_user_id 
    FROM auth.users 
    WHERE email = 'demo@trailtracker.com' 
    LIMIT 1;
    
    -- Only insert if demo user exists
    IF demo_user_id IS NOT NULL THEN
        -- Insert sample trips
        INSERT INTO trips (user_id, trail_name, date, activity_type, notes) VALUES
        (demo_user_id, 'Mount Washington Trail', '2024-01-15', 'hike', 'Beautiful winter hike with amazing views from the summit. Snow conditions were perfect.'),
        (demo_user_id, 'Whistler Village', '2024-01-08', 'snowboard', 'Great powder day! Hit the backcountry bowls and had an incredible time.'),
        (demo_user_id, 'Eagle Peak Climbing Route', '2024-01-22', 'climb', 'Challenging multi-pitch climb. Weather was perfect and the rock was dry.'),
        (demo_user_id, 'Riverside Trail', '2024-01-29', 'bike', 'Easy ride along the river. Perfect for recovery day between harder workouts.'),
        (demo_user_id, 'Forest Loop Trail', '2024-02-05', 'run', 'Morning trail run through the forest. Saw some deer and enjoyed the peaceful atmosphere.'),
        (demo_user_id, 'Summit Ridge', '2024-02-12', 'hike', 'Long day hike with friends. Packed lunch and enjoyed it at the summit with panoramic views.'),
        (demo_user_id, 'Local Ski Resort', '2024-02-18', 'ski', 'First ski trip of the season. Legs were tired but had so much fun on the slopes.'),
        (demo_user_id, 'Neighborhood Walk', '2024-02-25', 'walk', 'Easy evening walk to clear my head after a long day at work.');
        
        RAISE NOTICE 'Sample trips inserted successfully for demo user';
    ELSE
        RAISE NOTICE 'Demo user not found, skipping sample trips insertion';
    END IF;
END $$;
