-- Simple script to create just the demo user in Supabase Auth
-- This should be run in the Supabase SQL Editor

-- Insert the demo user directly into auth.users if it doesn't exist
-- Note: This is a direct approach - normally you'd use the Auth API
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
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
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Demo User"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- Verify the user was created
SELECT id, email, created_at FROM auth.users WHERE email = 'demo@workouttracker.com';
