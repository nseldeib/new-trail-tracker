-- Insert sample trail data (you'll need to replace the user_id with actual user IDs from your users table)
-- First, let's check if we have any users
DO $$
DECLARE
    sample_user_id UUID;
BEGIN
    -- Get the first user ID from the users table, or create a sample one
    SELECT id INTO sample_user_id FROM users LIMIT 1;
    
    -- If no users exist, you can uncomment the line below and add a sample user ID
    -- sample_user_id := 'your-user-id-here'::UUID;
    
    IF sample_user_id IS NOT NULL THEN
        INSERT INTO trails (name, location, distance, difficulty, duration_minutes, elevation_gain, notes, date, user_id) VALUES
        ('Eagle Peak Trail', 'Rocky Mountain National Park, CO', 5.2, 'Hard', 240, 1200, 'Challenging climb with amazing views at the summit', '2024-01-15', sample_user_id),
        ('Sunset Loop', 'Zion National Park, UT', 2.8, 'Easy', 90, 300, 'Perfect evening hike with beautiful sunset views', '2024-01-10', sample_user_id),
        ('Bear Creek Trail', 'Great Smoky Mountains, TN', 4.1, 'Moderate', 150, 800, 'Saw some wildlife along the creek', '2024-01-08', sample_user_id),
        ('Alpine Lake Circuit', 'Glacier National Park, MT', 7.3, 'Hard', 300, 1800, 'Long but rewarding hike to pristine alpine lake', '2024-01-05', sample_user_id),
        ('Meadow Walk', 'Yellowstone National Park, WY', 1.5, 'Easy', 45, 100, 'Gentle walk through wildflower meadows', '2024-01-03', sample_user_id);
    ELSE
        RAISE NOTICE 'No users found in the users table. Please add users first or manually specify a user_id in the script.';
    END IF;
END $$;
