-- Insert sample trips for the demo user
-- First, get the demo user's ID
DO $$
DECLARE
    demo_user_id UUID;
BEGIN
    -- Get the demo user ID
    SELECT id INTO demo_user_id 
    FROM auth.users 
    WHERE email = 'demo@workouttracker.com';
    
    -- Only insert if demo user exists
    IF demo_user_id IS NOT NULL THEN
        -- Insert sample trips
        INSERT INTO public.trips (user_id, trail_name, date, type, notes) VALUES
        (demo_user_id, 'Mount Washington', '2024-01-15', 'Hike', 'Beautiful winter hike with amazing views from the summit. Weather was clear and cold.'),
        (demo_user_id, 'El Capitan', '2024-01-20', 'Climb', 'Multi-day climb on the Nose route. Challenging but incredibly rewarding experience.'),
        (demo_user_id, 'Whistler Village', '2024-02-05', 'Snowboard', 'Perfect powder day! Hit the backcountry bowls and had an amazing time.'),
        (demo_user_id, 'Moab Slickrock', '2024-02-18', 'Mountain Bike', 'Technical trail with stunning red rock scenery. Challenging but fun ride.'),
        (demo_user_id, 'Pacific Crest Trail - Section J', '2024-03-10', 'Backpack', '3-day backpacking trip through beautiful alpine meadows and lakes.'),
        (demo_user_id, 'Runyon Canyon', '2024-03-22', 'Trail Run', 'Quick morning trail run with great city views. Perfect for a workout.'),
        (demo_user_id, 'Half Dome', '2024-04-08', 'Hike', 'Epic day hike to one of Yosemites most iconic peaks. The cables were intense!'),
        (demo_user_id, 'Vail Back Bowls', '2024-01-28', 'Ski', 'Fresh snow in the back bowls made for an incredible ski day.'),
        (demo_user_id, 'Angels Landing', '2024-04-15', 'Hike', 'Thrilling hike with chains and narrow ridges. The views from the top were worth it.'),
        (demo_user_id, 'Joshua Tree Bouldering', '2024-03-05', 'Climb', 'Great day of bouldering in the desert. Perfect weather and interesting rock formations.');
        
        RAISE NOTICE 'Sample trips inserted successfully for demo user';
    ELSE
        RAISE NOTICE 'Demo user not found, skipping sample trips insertion';
    END IF;
END $$;
