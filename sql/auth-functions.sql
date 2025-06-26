-- Supabase Authentication Functions
-- These functions support user authentication and profile management

-- Function to handle new user profile creation
-- This function will be triggered when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into user_profiles table when a new user signs up
  -- Note: This requires the user_profiles table to exist (CS-P0-013)
  INSERT INTO public.user_profiles (
    id,
    email,
    role,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,           -- Use the auth.users.id as primary key
    NEW.email,        -- Copy email from auth.users
    'client',         -- Default role for new users
    NOW(),            -- Set creation timestamp
    NOW()             -- Set update timestamp
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions for the function
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- Create trigger to automatically call handle_new_user() when new user signs up
-- NOTE: This trigger should be created AFTER the user_profiles table exists
-- Uncomment and run after CS-P0-013 (Database Schema) is complete:

/*
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
*/

-- Function to update user profile timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- This trigger will be applied to user_profiles table in CS-P0-013:
/*
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
*/