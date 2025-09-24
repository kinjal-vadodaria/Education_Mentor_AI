import { createClient } from '@supabase/supabase-js';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { errorReporting } from './errorReporting';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Add global error handler for Supabase
supabase.auth.onAuthStateChange((event) => {
  if (event === 'SIGNED_OUT') {
    // Clear any cached data
    localStorage.removeItem('supabase.auth.token');
  }
});

// Database types
export interface User {
  id: string;
  email: string;
  role: 'student' | 'teacher';
  name: string;
  grade_level?: number;
  created_at: string;
  preferences: {
    language: string;
    theme: 'light' | 'dark';
    difficulty: 'beginner' | 'intermediate' | 'advanced';
  };
}

export interface StudentProgress {
  id: string;
  user_id: string;
  subject: string;
  xp_points: number;
  current_streak: number;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  badges: string[];
}

export interface QuizResult {
  id: string;
  user_id: string;
  quiz_topic: string;
  score: number;
  total_questions: number;
  completed_at: string;
  time_taken: number;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  response: string;
  timestamp: string;
  session_id: string;
}

// Helper function to handle database errors
const handleDatabaseError = (error: unknown, operation: string) => {
  console.error(`Database error in ${operation}:`, error);

  // Handle the error type properly for error reporting
  if (error instanceof Error) {
    errorReporting.reportError(error, { context: `DATABASE_${operation.toUpperCase()}` });
  } else {
    // Create an Error object for unknown error types
    const errorObj = new Error(typeof error === 'string' ? error : `Unknown error in ${operation}`);
    errorReporting.reportError(errorObj, { context: `DATABASE_${operation.toUpperCase()}`, originalError: error });
  }

  return { data: null, error };
};

// Auth functions
export const signUp = async (email: string, password: string, userData: Partial<User>) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });
    
    if (error) throw error;
    
    // Create user profile
    if (data.user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: data.user.email!,
          ...userData,
        });
      
      if (profileError) {
        console.error('Failed to create user profile:', profileError);
      }
    }
    
    return { data, error };
  } catch (error) {
    return handleDatabaseError(error, 'signUp');
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  } catch (error) {
    return handleDatabaseError(error, 'signIn');
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (error) {
    return handleDatabaseError(error, 'signOut');
  }
};

// Database functions
export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    return { data, error };
  } catch (error) {
    return handleDatabaseError(error, 'getUserProfile');
  }
};

export const updateUserProfile = async (userId: string, updates: Partial<User>) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    return { data, error };
  } catch (error) {
    return handleDatabaseError(error, 'updateUserProfile');
  }
};

export const getStudentProgress = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('student_progress')
      .select('*')
      .eq('user_id', userId);
    return { data, error };
  } catch (error) {
    return handleDatabaseError(error, 'getStudentProgress');
  }
};

export const updateStudentProgress = async (userId: string, subject: string, updates: Partial<StudentProgress>) => {
  try {
    const { data, error } = await supabase
      .from('student_progress')
      .upsert({
        user_id: userId,
        subject,
        ...updates,
      })
      .select()
      .single();
    return { data, error };
  } catch (error) {
    return handleDatabaseError(error, 'updateStudentProgress');
  }
};

export const saveQuizResult = async (result: Omit<QuizResult, 'id'>) => {
  try {
    const { data, error } = await supabase
      .from('quiz_results')
      .insert(result)
      .select()
      .single();
    return { data, error };
  } catch (error) {
    return handleDatabaseError(error, 'saveQuizResult');
  }
};

export const getQuizResults = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });
    return { data, error };
  } catch (error) {
    return handleDatabaseError(error, 'getQuizResults');
  }
};

export const saveChatMessage = async (message: Omit<ChatMessage, 'id'>) => {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert(message)
      .select()
      .single();
    return { data, error };
  } catch (error) {
    return handleDatabaseError(error, 'saveChatMessage');
  }
};

export const getChatHistory = async (userId: string, sessionId?: string) => {
  try {
    let query = supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: true });

    if (sessionId) {
      query = query.eq('session_id', sessionId);
    }

    const { data, error } = await query;
    return { data, error };
  } catch (error) {
    return handleDatabaseError(error, 'getChatHistory');
  }
};

// Real-time subscriptions
export const subscribeToUserProgress = (userId: string, callback: (payload: RealtimePostgresChangesPayload<StudentProgress>) => void) => {
  return supabase
    .channel('student_progress')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'student_progress',
        filter: `user_id=eq.${userId}`,
      },
      callback
    )
    .subscribe();
};

export const subscribeToQuizResults = (userId: string, callback: (payload: unknown) => void) => {
  return supabase
    .channel('quiz_results')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'quiz_results',
        filter: `user_id=eq.${userId}`,
      },
      callback
    )
    .subscribe();
};

// Health check
export const healthCheck = async () => {
  try {
    const { error } = await supabase.from('users').select('count').limit(1);
    return !error;
  } catch {
    return false;
  }
};