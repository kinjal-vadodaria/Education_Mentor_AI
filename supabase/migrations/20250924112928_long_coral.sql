/*
# MentorQuest - Complete Auth & Schema Fix

This migration fixes all authentication, RLS, and schema issues to make the app production-ready.

## Key Fixes:
1. Proper auth trigger to create user profiles automatically
2. Fixed RLS policies for student/teacher access
3. Corrected table schemas and relationships
4. Added proper indexes and constraints
5. Auth metadata handling for roles

## Tables:
- users: Core user profiles with proper auth integration
- student_progress: XP, streaks, levels, badges
- quiz_results: Quiz performance tracking
- chat_messages: AI tutor conversations
- courses: Teacher course management
- lesson_plans: AI-generated lesson plans

## Security:
- RLS enabled on all tables
- Role-based access control
- Proper auth integration
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- DROP EXISTING POLICIES TO RECREATE THEM PROPERLY
-- ============================================================================

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Students can read own progress" ON public.student_progress;
DROP POLICY IF EXISTS "Students can update own progress" ON public.student_progress;
DROP POLICY IF EXISTS "Students can upsert own progress" ON public.student_progress;
DROP POLICY IF EXISTS "Students can read own quiz results" ON public.quiz_results;
DROP POLICY IF EXISTS "Students can insert own quiz results" ON public.quiz_results;
DROP POLICY IF EXISTS "Users can read own chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can insert own chat messages" ON public.chat_messages;

-- ============================================================================
-- USERS TABLE - Core user profiles
-- ============================================================================

-- Update users table to ensure proper schema
ALTER TABLE public.users 
  ALTER COLUMN id SET DEFAULT gen_random_uuid(),
  ALTER COLUMN role SET DEFAULT 'student',
  ALTER COLUMN created_at SET DEFAULT NOW();

-- Add missing columns if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'avatar_url') THEN
    ALTER TABLE public.users ADD COLUMN avatar_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'updated_at') THEN
    ALTER TABLE public.users ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- ============================================================================
-- COURSES TABLE - For teacher content organization
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    subject TEXT NOT NULL,
    grade_level INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- LESSON PLANS TABLE - AI-generated lesson plans
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.lesson_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    grade_level TEXT NOT NULL,
    duration INTEGER NOT NULL, -- in minutes
    objectives TEXT[] DEFAULT '{}',
    materials TEXT[] DEFAULT '{}',
    activities JSONB DEFAULT '[]'::jsonb,
    assessment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_student_progress_user_subject ON public.student_progress(user_id, subject);
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_completed ON public.quiz_results(user_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_session ON public.chat_messages(user_id, session_id);
CREATE INDEX IF NOT EXISTS idx_courses_teacher_active ON public.courses(teacher_id, is_active);
CREATE INDEX IF NOT EXISTS idx_lesson_plans_teacher ON public.lesson_plans(teacher_id);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to handle new user creation from auth.users
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update timestamp triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_student_progress_updated_at ON public.student_progress;
CREATE TRIGGER update_student_progress_updated_at
    BEFORE UPDATE ON public.student_progress
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_courses_updated_at ON public.courses;
CREATE TRIGGER update_courses_updated_at
    BEFORE UPDATE ON public.courses
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_lesson_plans_updated_at ON public.lesson_plans;
CREATE TRIGGER update_lesson_plans_updated_at
    BEFORE UPDATE ON public.lesson_plans
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_plans ENABLE ROW LEVEL SECURITY;

-- USERS TABLE POLICIES
CREATE POLICY "users_select_own" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_insert_own" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_own" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Teachers can view other users for class management
CREATE POLICY "teachers_select_users" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'teacher'
        )
    );

-- STUDENT PROGRESS POLICIES
CREATE POLICY "student_progress_select_own" ON public.student_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "student_progress_insert_own" ON public.student_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "student_progress_update_own" ON public.student_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- Teachers can view student progress
CREATE POLICY "teachers_select_student_progress" ON public.student_progress
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'teacher'
        )
    );

-- QUIZ RESULTS POLICIES
CREATE POLICY "quiz_results_select_own" ON public.quiz_results
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "quiz_results_insert_own" ON public.quiz_results
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Teachers can view quiz results
CREATE POLICY "teachers_select_quiz_results" ON public.quiz_results
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'teacher'
        )
    );

-- CHAT MESSAGES POLICIES
CREATE POLICY "chat_messages_select_own" ON public.chat_messages
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "chat_messages_insert_own" ON public.chat_messages
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- COURSES POLICIES
CREATE POLICY "courses_select_own" ON public.courses
    FOR SELECT USING (auth.uid() = teacher_id);

CREATE POLICY "courses_insert_own" ON public.courses
    FOR INSERT WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "courses_update_own" ON public.courses
    FOR UPDATE USING (auth.uid() = teacher_id);

CREATE POLICY "courses_delete_own" ON public.courses
    FOR DELETE USING (auth.uid() = teacher_id);

-- LESSON PLANS POLICIES
CREATE POLICY "lesson_plans_select_own" ON public.lesson_plans
    FOR SELECT USING (auth.uid() = teacher_id);

CREATE POLICY "lesson_plans_insert_own" ON public.lesson_plans
    FOR INSERT WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "lesson_plans_update_own" ON public.lesson_plans
    FOR UPDATE USING (auth.uid() = teacher_id);

CREATE POLICY "lesson_plans_delete_own" ON public.lesson_plans
    FOR DELETE USING (auth.uid() = teacher_id);

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant permissions on tables
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_progress TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quiz_results TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_messages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.courses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lesson_plans TO authenticated;

-- Grant permissions on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;