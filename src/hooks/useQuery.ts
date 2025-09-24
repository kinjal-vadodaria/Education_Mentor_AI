import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import { errorReporting } from '../services/errorReporting';

// Custom hooks for data fetching with React Query
export const useStudentProgress = (userId: string) => {
  return useQuery({
    queryKey: ['student-progress', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_progress')
        .select('*')
        .eq('user_id', userId);
      
      if (error) {
        errorReporting.reportError(error, { context: 'FETCH_STUDENT_PROGRESS' });
        throw error;
      }
      
      return data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useQuizResults = (userId: string) => {
  return useQuery({
    queryKey: ['quiz-results', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false });
      
      if (error) {
        errorReporting.reportError(error, { context: 'FETCH_QUIZ_RESULTS' });
        throw error;
      }
      
      return data;
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useUpdateStudentProgress = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, subject, updates }: {
      userId: string;
      subject: string;
      updates: {
        xp_points?: number;
        current_streak?: number;
        level?: string;
        badges?: string[];
      };
    }) => {
      const { data, error } = await supabase
        .from('student_progress')
        .upsert([
          {
            user_id: userId,
            subject,
            ...updates,
          },
        ])
        .select()
        .single();

      if (error) {
        errorReporting.reportError(error, { context: 'UPDATE_STUDENT_PROGRESS' });
        throw error;
      }

      return data;
    },
    onSuccess: (_data, variables) => {
      // Invalidate and refetch student progress
      queryClient.invalidateQueries({ queryKey: ['student-progress', variables.userId] });
    },
  });
};

export const useSaveQuizResult = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, quizData }: {
      userId: string;
      quizData: {
        quiz_topic: string;
        score: number;
        total_questions: number;
        time_taken?: number;
      };
    }) => {
      const { data, error } = await supabase
        .from('quiz_results')
        .insert([
          {
            user_id: userId,
            ...quizData,
          },
        ])
        .select()
        .single();

      if (error) {
        errorReporting.reportError(error, { context: 'SAVE_QUIZ_RESULT' });
        throw error;
      }

      return data;
    },
    onSuccess: (_data, variables) => {
      // Invalidate and refetch quiz results
      queryClient.invalidateQueries({ queryKey: ['quiz-results', variables.userId] });
    },
  });
};