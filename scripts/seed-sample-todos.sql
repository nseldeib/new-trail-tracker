-- Insert sample todos for the demo user
-- First, get the demo user's ID
DO $$
DECLARE
    demo_user_id UUID;
BEGIN
    -- Get the demo user ID
    SELECT id INTO demo_user_id 
    FROM auth.users 
    WHERE email = 'demo@trailtracker.com';
    
    -- Only proceed if demo user exists
    IF demo_user_id IS NOT NULL THEN
        -- Insert sample todos
        INSERT INTO todos (user_id, title, category, due_date, completed) VALUES
        (demo_user_id, 'Buy new hiking boots', 'gear', CURRENT_DATE + INTERVAL '7 days', false),
        (demo_user_id, 'Replace worn-out backpack', 'gear', CURRENT_DATE + INTERVAL '14 days', false),
        (demo_user_id, 'Book campsite reservation', 'logistics', CURRENT_DATE + INTERVAL '3 days', false),
        (demo_user_id, 'Check weather forecast', 'logistics', CURRENT_DATE + INTERVAL '1 day', false),
        (demo_user_id, 'Complete 5-mile training hike', 'training', CURRENT_DATE + INTERVAL '2 days', false),
        (demo_user_id, 'Practice setting up tent', 'training', NULL, false),
        (demo_user_id, 'Research trail maps', 'logistics', CURRENT_DATE - INTERVAL '1 day', true),
        (demo_user_id, 'Buy water purification tablets', 'gear', NULL, true);
        
        RAISE NOTICE 'Sample todos created for demo user';
    ELSE
        RAISE NOTICE 'Demo user not found, skipping todo creation';
    END IF;
END $$;
