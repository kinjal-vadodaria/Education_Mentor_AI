import { createClient } from '@supabase/supabase-js';
import { errorReporting } from './errorReporting';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth functions
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    errorReporting.reportError(error, { context: 'SIGN_IN' });
    throw error;
  }

  return data;
};

export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    errorReporting.reportError(error, { context: 'SIGN_UP' });
    throw error;
  }

  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    errorReporting.reportError(error, { context: 'SIGN_OUT' });
    throw error;
  }
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  // Get user profile from users table
  const { data: userProfile, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (userProfile) {
    return userProfile;
  }

  // If user doesn't exist in users table, create profile
  if (!userProfile && !userError) {
    try {
      const { data: newProfile, error: createError } = await supabase
        .from('users')
        .insert([
          {
            id: user.id,
            email: user.email || '',
            name: user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            role: user.user_metadata?.role || 'student',
          },
        ])
        .select()
        .single();

      if (createError) {
        errorReporting.reportError(createError, { context: 'CREATE_USER_PROFILE_AUTO' });
        return null;
      }

      return newProfile;
    } catch (error) {
      errorReporting.reportError(error, { context: 'AUTO_CREATE_PROFILE' });
      return null;
    }
  }

  if (userError) {
    errorReporting.reportError(userError, { context: 'GET_CURRENT_USER' });
    return null;
  }

  return null;
};

export const createUserProfile = async (userId: string, profileData: {
  email: string;
  name: string;
  role: 'student' | 'teacher';
  grade_level?: number;
}) => {
  const { data, error } = await supabase
    .from('users')
    .insert([
      {
        id: userId,
        ...profileData,
      },
    ])
    .select()
    .single();

  if (error) {
    errorReporting.reportError(error, { context: 'CREATE_USER_PROFILE' });
    throw error;
  }

  return data;
};

interface UserPreferences {
  theme?: 'light' | 'dark' | 'auto';
  language?: string;
  notifications?: {
    email?: boolean;
    push?: boolean;
    quizReminders?: boolean;
    lessonReminders?: boolean;
  };
  accessibility?: {
    fontSize?: 'small' | 'medium' | 'large';
    highContrast?: boolean;
    reducedMotion?: boolean;
  };
  dashboard?: {
    defaultView?: 'overview' | 'recent' | 'favorites';
    itemsPerPage?: number;
  };
}

export const updateUserProfile = async (userId: string, updates: Partial<{
  name: string;
  grade_level: number;
  preferences: UserPreferences;
}>) => {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    errorReporting.reportError(error, { context: 'UPDATE_USER_PROFILE' });
    throw error;
  }

  return data;
};

// Student progress functions
export const getStudentProgress = async (userId: string) => {
  const { data, error } = await supabase
    .from('student_progress')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    errorReporting.reportError(error, { context: 'GET_STUDENT_PROGRESS' });
  }

  return { data, error };
};

export const updateStudentProgress = async (userId: string, subject: string, updates: {
  xp_points?: number;
  current_streak?: number;
  level?: string;
  badges?: string[];
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
  }

  return { data, error };
};

// Quiz functions
export const saveQuizResult = async (userId: string, quizData: {
  quiz_topic: string;
  score: number;
  total_questions: number;
  time_taken?: number;
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
  }

  return { data, error };
};

export const getQuizResults = async (userId: string) => {
  const { data, error } = await supabase
    .from('quiz_results')
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false });

  if (error) {
    errorReporting.reportError(error, { context: 'GET_QUIZ_RESULTS' });
  }

  return { data, error };
};

// Chat functions
export const saveChatMessage = async (userId: string, messageData: {
  message: string;
  response: string;
  session_id: string;
}) => {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert([
      {
        user_id: userId,
        ...messageData,
      },
    ])
    .select()
    .single();

  if (error) {
    errorReporting.reportError(error, { context: 'SAVE_CHAT_MESSAGE' });
  }

  return { data, error };
};

export const getChatHistory = async (userId: string, sessionId: string) => {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('user_id', userId)
    .eq('session_id', sessionId)
    .order('timestamp', { ascending: true });

  if (error) {
    errorReporting.reportError(error, { context: 'GET_CHAT_HISTORY' });
  }

  return { data, error };
};