-- ============================================================================
-- DEMO DATA FOR ALL TABLES
-- ============================================================================

-- Insert demo users (skip if trigger issues)
-- Note: These inserts may fail if updated_at column issues persist
-- The users will be created via auth triggers instead

-- Insert demo courses
INSERT INTO public.courses (id, teacher_id, title, description, subject, grade_level, is_active) VALUES
(
    '33333333-3333-3333-3333-333333333333',
    '11111111-1111-1111-1111-111111111111',
    'Physics Fundamentals',
    'Introduction to basic physics concepts including motion, forces, and energy',
    'Physics',
    10,
    true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.courses (id, teacher_id, title, description, subject, grade_level, is_active) VALUES
(
    '44444444-4444-4444-4444-444444444444',
    '11111111-1111-1111-1111-111111111111',
    'Advanced Mathematics',
    'Algebra, geometry, and introductory calculus concepts',
    'Mathematics',
    11,
    true
) ON CONFLICT (id) DO NOTHING;

-- Insert demo lesson plans
INSERT INTO public.lesson_plans (
    id,
    teacher_id,
    course_id,
    title,
    subject,
    grade_level,
    duration,
    objectives,
    materials,
    activities,
    assessment
) VALUES
(
    '55555555-5555-5555-5555-555555555555',
    '11111111-1111-1111-1111-111111111111',
    '33333333-3333-3333-3333-333333333333',
    'Newton''s Laws of Motion',
    'Physics',
    '10',
    45,
    ARRAY['Understand the three laws of motion', 'Apply Newton''s laws to real-world scenarios', 'Solve basic physics problems'],
    ARRAY['Whiteboard', 'Toy cars', 'Ramps', 'Balls', 'Video clips'],
    '[
        {
            "id": "1",
            "name": "Introduction Hook",
            "description": "Demonstrate with toy cars and ramps",
            "duration": 10,
            "type": "presentation"
        },
        {
            "id": "2",
            "name": "Concept Explanation",
            "description": "Explain each law with examples",
            "duration": 20,
            "type": "presentation"
        },
        {
            "id": "3",
            "name": "Hands-on Activity",
            "description": "Students experiment with objects",
            "duration": 10,
            "type": "hands-on"
        },
        {
            "id": "4",
            "name": "Wrap-up Discussion",
            "description": "Review and Q&A",
            "duration": 5,
            "type": "discussion"
        }
    ]'::jsonb,
    'Exit ticket with 3 questions about Newton''s laws'
) ON CONFLICT (id) DO NOTHING;

-- Insert demo library items
INSERT INTO public.library_items (
    id,
    title,
    description,
    category,
    subject,
    grade_level,
    difficulty,
    tags,
    is_public,
    author_id,
    file_type
) VALUES
(
    '77777777-7777-7777-7777-777777777777',
    'Introduction to Physics',
    'Basic concepts of physics including motion, forces, and energy',
    'Textbook',
    'Physics',
    10,
    'beginner',
    ARRAY['physics', 'motion', 'forces'],
    true,
    '11111111-1111-1111-1111-111111111111',
    'pdf'
),
(
    '88888888-8888-8888-8888-888888888888',
    'Algebra Fundamentals',
    'Essential algebra concepts for high school students',
    'Worksheet',
    'Mathematics',
    9,
    'intermediate',
    ARRAY['algebra', 'equations', 'variables'],
    true,
    '11111111-1111-1111-1111-111111111111',
    'doc'
),
(
    '99999999-9999-9999-9999-999999999999',
    'Photosynthesis Explained',
    'A comprehensive video explaining the process of photosynthesis',
    'Video',
    'Biology',
    8,
    'beginner',
    ARRAY['biology', 'photosynthesis', 'plants'],
    true,
    '11111111-1111-1111-1111-111111111111',
    'video'
) ON CONFLICT (id) DO NOTHING;

-- Insert demo student progress
INSERT INTO public.student_progress (
    user_id,
    subject,
    xp_points,
    current_streak,
    level,
    badges
) VALUES
(
    '22222222-2222-2222-2222-222222222222',
    'Physics',
    250,
    7,
    'intermediate',
    ARRAY['Quiz Master', 'Week Warrior']
) ON CONFLICT (user_id, subject) DO UPDATE SET
    xp_points = EXCLUDED.xp_points,
    current_streak = EXCLUDED.current_streak,
    level = EXCLUDED.level,
    badges = EXCLUDED.badges;

INSERT INTO public.student_progress (
    user_id,
    subject,
    xp_points,
    current_streak,
    level,
    badges
) VALUES
(
    '22222222-2222-2222-2222-222222222222',
    'Mathematics',
    180,
    5,
    'intermediate',
    ARRAY['Math Wizard']
) ON CONFLICT (user_id, subject) DO UPDATE SET
    xp_points = EXCLUDED.xp_points,
    current_streak = EXCLUDED.current_streak,
    level = EXCLUDED.level,
    badges = EXCLUDED.badges;

-- Insert demo quiz results
INSERT INTO public.quiz_results (
    user_id,
    quiz_topic,
    score,
    total_questions,
    time_taken,
    completed_at
) VALUES
(
    '22222222-2222-2222-2222-222222222222',
    'Newton''s Laws',
    4,
    5,
    180,
    NOW() - INTERVAL '2 days'
),
(
    '22222222-2222-2222-2222-222222222222',
    'Algebra Basics',
    3,
    4,
    120,
    NOW() - INTERVAL '1 day'
),
(
    '22222222-2222-2222-2222-222222222222',
    'Photosynthesis',
    5,
    5,
    200,
    NOW() - INTERVAL '3 hours'
) ON CONFLICT DO NOTHING;

-- Insert demo chat messages
INSERT INTO public.chat_messages (
    user_id,
    session_id,
    message,
    response,
    timestamp
) VALUES
(
    '22222222-2222-2222-2222-222222222222',
    '66666666-6666-6666-6666-666666666666',
    'Explain Newton''s first law like I''m 12',
    'Newton''s first law is like when you''re in a car! When the car suddenly stops, your body keeps moving forward because objects in motion want to stay in motion. It''s called inertia - things don''t like to change what they''re doing unless something forces them to change.',
    NOW() - INTERVAL '1 hour'
),
(
    '22222222-2222-2222-2222-222222222222',
    '66666666-6666-6666-6666-666666666666',
    'Can you create a quiz on photosynthesis?',
    'I''d be happy to create a quiz on photosynthesis! Here are 5 questions: 1. What do plants need for photosynthesis? A) Sunlight, water, carbon dioxide B) Only water C) Only sunlight D) Soil and air...',
    NOW() - INTERVAL '30 minutes'
) ON CONFLICT DO NOTHING;
