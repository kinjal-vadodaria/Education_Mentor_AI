-- Grant permissions to anonymous users for development
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_progress TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quiz_results TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_messages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.courses TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lesson_plans TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.library_items TO anon;
