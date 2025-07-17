-- Simple script to create demo user through Supabase Auth
-- This creates the user in the auth.users table directly

-- First, let's check if the user already exists
DO $$
DECLARE
    existing_user_id UUID;
BEGIN
    -- Check if demo user already exists
    SELECT id INTO existing_user_id 
    FROM auth.users 
    WHERE email = 'demo@workouttracker.com';
    
    IF existing_user_id IS NULL THEN
        -- Create the demo user
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            confirmation_sent_at,
            recovery_sent_at,
            email_change_sent_at,
            last_sign_in_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin,
            created_at,
            updated_at,
            phone,
            phone_confirmed_at,
            phone_change,
            phone_change_token,
            phone_change_sent_at,
            confirmed_at,
            email_change_token_current,
            email_change_confirm_status,
            banned_until,
            reauthentication_token,
            reauthentication_sent_at,
            is_sso_user,
            deleted_at
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
            NOW(),
            NOW(),
            '{"provider":"email","providers":["email"]}',
            '{"full_name":"Demo User"}',
            false,
            NOW(),
            NOW(),
            null,
            null,
            '',
            '',
            null,
            NOW(),
            '',
            0,
            null,
            '',
            null,
            false,
            null
        );
    END IF;
END $$;

-- Verify the user exists
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    updated_at
FROM auth.users 
WHERE email = 'demo@workouttracker.com';
