/*
# Library and Resources Schema

This migration adds tables for library resources and educational materials.

## New Tables:
- library_items: Educational resources in the library
- resource_files: File attachments for resources
- student_enrollments: Student-class relationships

## Features:
- Full CRUD for library items
- File upload support
- Student-class management
- Search and categorization
*/

-- ============================================================================
-- LIBRARY ITEMS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.library_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    category TEXT NOT NULL,
    subject TEXT NOT NULL,
    grade_level INTEGER,
    difficulty TEXT DEFAULT 'intermediate' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    tags TEXT[] DEFAULT '{}',
    author_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    is_public BOOLEAN DEFAULT true,
    file_url TEXT,
    file_type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- RESOURCE FILES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.resource_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    library_item_id UUID REFERENCES public.library_items(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER,
    uploaded_by UUID REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STUDENT ENROLLMENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.student_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
    UNIQUE(student_id, course_id)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_library_items_category ON public.library_items(category);
CREATE INDEX IF NOT EXISTS idx_library_items_subject ON public.library_items(subject);
CREATE INDEX IF NOT EXISTS idx_library_items_grade_level ON public.library_items(grade_level);
CREATE INDEX IF NOT EXISTS idx_library_items_author ON public.library_items(author_id);
CREATE INDEX IF NOT EXISTS idx_library_items_public ON public.library_items(is_public);
CREATE INDEX IF NOT EXISTS idx_resource_files_library_item ON public.resource_files(library_item_id);
CREATE INDEX IF NOT EXISTS idx_student_enrollments_student ON public.student_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_student_enrollments_course ON public.student_enrollments(course_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update timestamp triggers
CREATE TRIGGER update_library_items_updated_at
    BEFORE UPDATE ON public.library_items
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE public.library_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_enrollments ENABLE ROW LEVEL SECURITY;

-- LIBRARY ITEMS POLICIES
CREATE POLICY "library_items_select_public" ON public.library_items
    FOR SELECT USING (is_public = true OR auth.uid() = author_id);

CREATE POLICY "library_items_insert_own" ON public.library_items
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "library_items_update_own" ON public.library_items
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "library_items_delete_own" ON public.library_items
    FOR DELETE USING (auth.uid() = author_id);

-- Teachers can view all library items
CREATE POLICY "teachers_select_all_library_items" ON public.library_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'teacher'
        )
    );

-- RESOURCE FILES POLICIES
CREATE POLICY "resource_files_select_via_library" ON public.resource_files
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.library_items 
            WHERE id = library_item_id 
            AND (is_public = true OR author_id = auth.uid())
        )
    );

CREATE POLICY "resource_files_insert_own" ON public.resource_files
    FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "resource_files_update_own" ON public.resource_files
    FOR UPDATE USING (auth.uid() = uploaded_by);

CREATE POLICY "resource_files_delete_own" ON public.resource_files
    FOR DELETE USING (auth.uid() = uploaded_by);

-- STUDENT ENROLLMENTS POLICIES
CREATE POLICY "student_enrollments_select_own" ON public.student_enrollments
    FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "student_enrollments_insert_own" ON public.student_enrollments
    FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Teachers can manage enrollments for their courses
CREATE POLICY "teachers_manage_enrollments" ON public.student_enrollments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.courses 
            WHERE id = course_id AND teacher_id = auth.uid()
        )
    );

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.library_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.resource_files TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_enrollments TO authenticated;

-- ============================================================================
-- SAMPLE DATA
-- ============================================================================

-- Insert sample library items
INSERT INTO public.library_items (id, title, description, category, subject, grade_level, difficulty, tags, author_id, is_public) VALUES
(
    '77777777-7777-7777-7777-777777777777',
    'Introduction to Physics',
    'Basic concepts of physics including motion, forces, and energy',
    'Textbook',
    'Physics',
    10,
    'beginner',
    ARRAY['physics', 'motion', 'forces', 'energy'],
    '11111111-1111-1111-1111-111111111111',
    true
),
(
    '88888888-8888-8888-8888-888888888888',
    'Advanced Calculus Problems',
    'Challenging calculus problems for advanced students',
    'Worksheet',
    'Mathematics',
    12,
    'advanced',
    ARRAY['calculus', 'derivatives', 'integrals'],
    '11111111-1111-1111-1111-111111111111',
    true
),
(
    '99999999-9999-9999-9999-999999999999',
    'Chemistry Lab Safety',
    'Essential safety guidelines for chemistry laboratory work',
    'Guide',
    'Chemistry',
    11,
    'intermediate',
    ARRAY['chemistry', 'safety', 'laboratory'],
    '11111111-1111-1111-1111-111111111111',
    true
) ON CONFLICT (id) DO NOTHING;