-- Fix the handle_new_user trigger to properly set roles from auth metadata

-- First, let's make sure the users table has the correct structure
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Update the trigger function to properly handle role assignment
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role, grade_level, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    CASE 
      WHEN NEW.raw_user_meta_data->>'grade_level' IS NOT NULL 
      THEN (NEW.raw_user_meta_data->>'grade_level')::INTEGER 
      ELSE NULL 
    END,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add some debugging to help troubleshoot
COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates a user profile when a new user signs up. Extracts role, name, and grade_level from auth metadata.';