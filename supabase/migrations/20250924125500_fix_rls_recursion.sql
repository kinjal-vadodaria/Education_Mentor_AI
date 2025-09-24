/*
# MentorQuest - Fix RLS Recursion Issue

This migration fixes the infinite recursion in RLS policies for the users table.

## Key Fixes:
1. Temporarily disable RLS to break recursion
2. Drop problematic policies
3. Recreate policies without recursion
4. Re-enable RLS with safe policies
*/

-- ============================================================================
-- DISABLE RLS TO BREAK RECURSION
-- ============================================================================

ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- DROP PROBLEMATIC POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "users_insert_own" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;
DROP POLICY IF EXISTS "teachers_select_users" ON public.users;

-- ============================================================================
-- RECREATE POLICIES WITHOUT RECURSION
-- ============================================================================

-- Allow users to select their own profile
CREATE POLICY "users_select_own" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- Allow users to insert their own profile (for new user creation)
CREATE POLICY "users_insert_own" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "users_update_own" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Allow teachers to select other users (but avoid recursion by using auth metadata)
CREATE POLICY "teachers_select_users" ON public.users
    FOR SELECT USING (
        auth.jwt() ->> 'role' = 'teacher' OR auth.uid() = id
    );

-- ============================================================================
-- RE-ENABLE RLS
-- ============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- ENSURE TRIGGER WORKS
-- ============================================================================

-- Drop and recreate the trigger to ensure it works with RLS
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'student')
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = COALESCE(EXCLUDED.name, users.name),
        role = COALESCE(EXCLUDED.role, users.role),
        updated_at = NOW();
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but don't fail the user creation
        RAISE WARNING 'Failed to create user profile for %: %', NEW.email, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
