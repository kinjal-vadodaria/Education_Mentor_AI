import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

// Auth functions
export const signUp = async (email: string, password: string, userData: Partial<User>) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData,
    },
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

// Database functions
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
};

export const updateUserProfile = async (userId: string, updates: Partial<User>) => {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  return { data, error };
};

export const getStudentProgress = async (userId: string) => {
  const { data, error } = await supabase
    .from('student_progress')
    .select('*')
    .eq('user_id', userId);
  return { data, error };
};

export const updateStudentProgress = async (userId: string, subject: string, updates: Partial<StudentProgress>) => {
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
};

export const saveQuizResult = async (result: Omit<QuizResult, 'id'>) => {
  const { data, error } = await supabase
    .from('quiz_results')
    .insert(result)
    .select()
    .single();
  return { data, error };
};

export const getQuizResults = async (userId: string) => {
  const { data, error } = await supabase
    .from('quiz_results')
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false });
  return { data, error };
};

export const saveChatMessage = async (message: Omit<ChatMessage, 'id'>) => {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert(message)
    .select()
    .single();
  return { data, error };
};

export const getChatHistory = async (userId: string, sessionId?: string) => {
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
};