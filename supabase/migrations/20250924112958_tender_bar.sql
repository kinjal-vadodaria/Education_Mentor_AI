/*
# MentorQuest - Seed Data

This file provides demo data for testing the application.
Run this after the schema migration is complete.

## Demo Users:
- Teacher: teacher@demo.com / demo123
- Student: student@demo.com / demo123

## Demo Data:
- Sample courses and lesson plans
- Student progress and quiz results
- Chat message history
*/

-- ============================================================================
-- DEMO USERS (These will be created via auth, but we ensure they exist in users table)
-- ============================================================================

-- Insert demo users (these IDs should match auth.users after signup)
INSERT INTO public.users (id, email, name, role, grade_level, created_at) VALUES
(
    '11111111-1111-1111-1111-111111111111',
    'teacher@demo.com',
    'Demo Teacher',
    'teacher',
    NULL,
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    updated_at = NOW();

INSERT INTO public.users (id, email, name, role, grade_level, created_at) VALUES
(
    '22222222-2222-2222-2222-222222222222',
    'student@demo.com',
    'Demo Student',
    'student',
    10,
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    grade_level = EXCLUDED.grade_level,
    updated_at = NOW();

-- ============================================================================
-- DEMO COURSES (Created by demo teacher)
-- ============================================================================

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

-- ============================================================================
-- DEMO LESSON PLANS
-- ============================================================================

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

-- ============================================================================
-- DEMO STUDENT PROGRESS
-- ============================================================================

INSERT INTO public.student_progress (
    user_id, 
    subject, 
    xp_points, 
    current_streak, 
    level, 
    badges,
    total_quizzes,
    total_correct_answers
) VALUES
(
    '22222222-2222-2222-2222-222222222222',
    'Physics',
    250,
    7,
    'intermediate',
    ARRAY['Quiz Master', 'Week Warrior'],
    5,
    18
) ON CONFLICT (user_id, subject) DO UPDATE SET
    xp_points = EXCLUDED.xp_points,
    current_streak = EXCLUDED.current_streak,
    level = EXCLUDED.level,
    badges = EXCLUDED.badges,
    total_quizzes = EXCLUDED.total_quizzes,
    total_correct_answers = EXCLUDED.total_correct_answers,
    updated_at = NOW();

INSERT INTO public.student_progress (
    user_id, 
    subject, 
    xp_points, 
    current_streak, 
    level, 
    badges,
    total_quizzes,
    total_correct_answers
) VALUES
(
    '22222222-2222-2222-2222-222222222222',
    'Mathematics',
    180,
    5,
    'intermediate',
    ARRAY['Math Wizard'],
    3,
    12
) ON CONFLICT (user_id, subject) DO UPDATE SET
    xp_points = EXCLUDED.xp_points,
    current_streak = EXCLUDED.current_streak,
    level = EXCLUDED.level,
    badges = EXCLUDED.badges,
    total_quizzes = EXCLUDED.total_quizzes,
    total_correct_answers = EXCLUDED.total_correct_answers,
    updated_at = NOW();

-- ============================================================================
-- DEMO QUIZ RESULTS
-- ============================================================================

INSERT INTO public.quiz_results (
    user_id,
    quiz_topic,
    score,
    total_questions,
    time_taken,
    difficulty,
    completed_at
) VALUES
(
    '22222222-2222-2222-2222-222222222222',
    'Newton''s Laws',
    4,
    5,
    180,
    'intermediate',
    NOW() - INTERVAL '2 days'
),
(
    '22222222-2222-2222-2222-222222222222',
    'Algebra Basics',
    3,
    4,
    120,
    'beginner',
    NOW() - INTERVAL '1 day'
),
(
    '22222222-2222-2222-2222-222222222222',
    'Photosynthesis',
    5,
    5,
    200,
    'intermediate',
    NOW() - INTERVAL '3 hours'
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- DEMO CHAT MESSAGES
-- ============================================================================

INSERT INTO public.chat_messages (
    user_id,
    session_id,
    message,
    response,
    message_type,
    timestamp
) VALUES
(
    '22222222-2222-2222-2222-222222222222',
    '66666666-6666-6666-6666-666666666666',
    'Explain Newton''s first law like I''m 12',
    'Newton''s first law is like when you''re in a car! When the car suddenly stops, your body keeps moving forward because objects in motion want to stay in motion. It''s called inertia - things don''t like to change what they''re doing unless something forces them to change.',
    'explanation',
    NOW() - INTERVAL '1 hour'
),
(
    '22222222-2222-2222-2222-222222222222',
    '66666666-6666-6666-6666-666666666666',
    'Can you create a quiz on photosynthesis?',
    'I''d be happy to create a quiz on photosynthesis! Here are 5 questions: 1. What do plants need for photosynthesis? A) Sunlight, water, carbon dioxide B) Only water C) Only sunlight D) Soil and air...',
    'quiz',
    NOW() - INTERVAL '30 minutes'
) ON CONFLICT DO NOTHING;