-- Setup Admin User Script
-- This script creates an admin user with email: shaikhnaushuu78636@gmail.com and password: admin@123

-- Note: This script should be run in the Supabase SQL Editor
-- The password will be hashed by Supabase auth system

-- Insert the admin user into auth.users (this is handled by Supabase auth signup)
-- After signup, we need to ensure the user has admin role in public.users

-- First, let's update the trigger to NOT automatically assign admin role based on email pattern
-- This makes the system more secure

-- Update the handle_new_user function to NOT auto-assign admin based on email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, avatar_url, role)
  VALUES (
    new.id,
    COALESCE(
      new.raw_user_meta_data->>'full_name', 
      new.raw_user_meta_data->>'name', 
      split_part(new.email, '@', 1)
    ),
    new.email,
    new.raw_user_meta_data->>'avatar_url',
    -- Default all users to 'user' role - no auto-admin based on email
    'user'::varchar 
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Now, to create the admin user, you need to:
-- 1. Go to Supabase Dashboard -> Authentication -> Users
-- 2. Click "Add User" or "Invite User"
-- 3. Enter email: shaikhnaushuu78636@gmail.com
-- 4. Set password: admin@123
-- 5. After the user is created, run the SQL below to set them as admin:

-- UPDATE public.users SET role = 'admin' WHERE email = 'shaikhnaushuu78636@gmail.com';

-- Alternatively, if you want to do it entirely via SQL (requires service role key):
-- You would need to use the Supabase Management API or CLI to create the auth user first,
-- then update the role in the public.users table.

-- For manual execution in Supabase SQL Editor after user is created:
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'shaikhnaushuu78636@gmail.com';

-- Verify the admin user
SELECT id, email, role, created_at 
FROM public.users 
WHERE email = 'shaikhnaushuu78636@gmail.com';
