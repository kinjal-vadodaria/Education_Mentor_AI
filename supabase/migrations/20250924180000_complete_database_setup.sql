-- ============================================================================
-- COMPLETE MENTORQUEST DATABASE SETUP
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- DROP EXISTING POLICIES TO AVOID CONFLICTS
-- ============================================================================

DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Students can read own progress" ON public.student_progress;
DROP POLICY IF EXISTS "Students can update own progress" ON public.student_progress;
DROP POLICY IF EXISTS "Students can upsert own progress" ON public.student_progress;
DROP POLICY IF EXISTS "Students can read own quiz results" ON public.quiz_results;
DROP POLICY IF EXISTS "Students can insert own quiz results" ON public.quiz_results;
DROP POLICY IF EXISTS "Users can read own chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can insert own chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Teachers can read library items" ON public.library_items;
DROP POLICY IF EXISTS "Teachers can create library items" ON public.library_items;
DROP POLICY IF EXISTS "Teachers can update own library items" ON public.library_items;
DROP POLICY IF EXISTS "Teachers can delete own library items" ON public.library_items;
DROP POLICY IF EXISTS "Public can read public library items" ON public.library_items;
DROP POLICY IF EXISTS "teachers_select_users" ON public.users;

-- ============================================================================
-- CREATE ALL TABLES
-- ============================================================================

-- USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher')),
    grade_level INTEGER,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STUDENT PROGRESS TABLE
CREATE TABLE IF NOT EXISTS public.student_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    xp_points INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    level TEXT DEFAULT 'beginner',
    badges TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, subject)
);

-- QUIZ RESULTS TABLE
CREATE TABLE IF NOT EXISTS public.quiz_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    quiz_topic TEXT NOT NULL,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    time_taken INTEGER,
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- CHAT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    message_type TEXT DEFAULT 'general',
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- COURSES TABLE
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

-- LESSON PLANS TABLE
CREATE TABLE IF NOT EXISTS public.lesson_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    grade_level TEXT NOT NULL,
    duration INTEGER NOT NULL,
    objectives TEXT[] DEFAULT '{}',
    materials TEXT[] DEFAULT '{}',
    activities JSONB DEFAULT '[]'::jsonb,
    assessment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- LIBRARY ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.library_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    subject TEXT NOT NULL,
    grade_level INTEGER,
    difficulty TEXT DEFAULT 'intermediate',
    tags TEXT[] DEFAULT '{}',
    is_public BOOLEAN DEFAULT true,
    author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    file_url TEXT,
    file_type TEXT,
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
CREATE INDEX IF NOT EXISTS idx_library_items_public ON public.library_items(is_public);
CREATE INDEX IF NOT EXISTS idx_library_items_author ON public.library_items(author_id);
CREATE INDEX IF NOT EXISTS idx_library_items_subject ON public.library_items(subject);

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

DROP TRIGGER IF EXISTS update_library_items_updated_at ON public.library_items;
CREATE TRIGGER update_library_items_updated_at
    BEFORE UPDATE ON public.library_items
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- DISABLE RLS FOR DEVELOPMENT (to avoid 500 errors)
-- ============================================================================

ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_items DISABLE ROW LEVEL SECURITY;

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
GRANT SELECT, INSERT, UPDATE, DELETE ON public.library_items TO authenticated;

-- Grant permissions on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
