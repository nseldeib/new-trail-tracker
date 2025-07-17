-- Create demo user (run this in Supabase SQL editor)
-- Note: You'll need to create this user through Supabase Auth UI or API
-- This is just for reference - the actual user creation should be done through Supabase Auth

-- Insert demo user profile after creating the auth user
INSERT INTO profiles (id, email, full_name)
VALUES (
  -- Replace with actual demo user UUID after creating through Supabase Auth
  'demo-user-uuid-here',
  'demo@workouttracker.com',
  'Demo User'
) ON CONFLICT (id) DO NOTHING;

-- Insert some sample data for the demo user
INSERT INTO workouts (user_id, activity_type, title, description, duration_minutes, distance, elevation_gain, difficulty, location, date) VALUES
('demo-user-uuid-here', 'running', 'Morning Trail Run', 'Beautiful sunrise run through the forest trails', 45, 5.2, 300, 'Moderate', 'Forest Park Trail', '2024-01-15'),
('demo-user-uuid-here', 'hiking', 'Mountain Peak Hike', 'Challenging hike to the summit with amazing views', 180, 8.5, 2200, 'Hard', 'Mount Wilson', '2024-01-12'),
('demo-user-uuid-here', 'climbing', 'Indoor Bouldering', 'Great session working on V4 problems', 90, NULL, NULL, 'Moderate', 'Local Climbing Gym', '2024-01-10');

INSERT INTO goals (user_id, title, description, activity_type, target_value, current_value, unit, target_date) VALUES
('demo-user-uuid-here', 'Run 100 Miles This Month', 'Goal to run 100 miles in January', 'running', 100, 45.5, 'miles', '2024-01-31'),
('demo-user-uuid-here', 'Climb 5.10a Route', 'Work up to climbing a 5.10a route outdoors', 'climbing', 1, 0, 'routes', '2024-03-01');

INSERT INTO todos (user_id, title, description, activity_type, priority, due_date) VALUES
('demo-user-uuid-here', 'Buy New Trail Running Shoes', 'Current shoes are worn out, need new pair for upcoming races', 'running', 'High', '2024-01-20'),
('demo-user-uuid-here', 'Plan Weekend Hiking Trip', 'Research and plan a 2-day hiking trip for next month', 'hiking', 'Medium', '2024-01-25'),
('demo-user-uuid-here', 'Service Snowboard', 'Get snowboard waxed and edges tuned before next trip', 'snowboarding', 'Medium', '2024-02-01');
