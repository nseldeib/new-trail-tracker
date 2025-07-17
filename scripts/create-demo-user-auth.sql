-- This script helps create the demo user in Supabase Auth
-- You need to run this in the Supabase SQL Editor or create the user through the Auth UI

-- First, you need to create the user through Supabase Auth UI or API
-- Email: demo@workouttracker.com
-- Password: demo123456

-- After creating the auth user, you can run this to ensure the profile exists:
INSERT INTO profiles (id, email, full_name)
SELECT 
  auth.users.id,
  'demo@workouttracker.com',
  'Demo User'
FROM auth.users 
WHERE auth.users.email = 'demo@workouttracker.com'
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name;

-- Verify the demo user exists
SELECT 
  u.id,
  u.email,
  u.created_at,
  p.full_name
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'demo@workouttracker.com';
