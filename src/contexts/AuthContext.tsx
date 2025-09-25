import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, signIn, signOut, getCurrentUser } from '../services/supabase';
import { errorReporting } from '../services/errorReporting';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'teacher';
  grade_level?: number;
  created_at: string;
  preferences?: {
    language?: string;
    theme?: 'light' | 'dark';
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
  };
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role: 'student' | 'teacher', gradeLevel?: number) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const refreshUser = async () => {
    try {
      console.log('🔄 Refreshing user data...');
      const currentUser = await getCurrentUser();
      console.log('👤 Current user data:', currentUser);
      setUser(currentUser);

      // Handle role-based redirection after user data is loaded
      if (currentUser && (window.location.pathname === '/' || window.location.pathname === '')) {
        console.log('🚀 Redirecting user based on role:', currentUser.role);
        if (currentUser.role === 'student') {
          navigate('/student/dashboard', { replace: true });
        } else if (currentUser.role === 'teacher') {
          navigate('/teacher/dashboard', { replace: true });
        }
      }
    } catch (error) {
      console.error('Error in refreshUser:', error);
      errorReporting.reportError(error, { context: 'REFRESH_USER' });
      // Don't unset user if already set to avoid flicker
      if (!user) {
        setUser(null);
      }
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);

        // Check for demo session first
        const demoSession = localStorage.getItem('demo-session');
        if (demoSession) {
          try {
            const sessionData = JSON.parse(demoSession);
            if (sessionData.expires_at > Date.now()) {
              setUser({
                id: sessionData.user.id,
                email: sessionData.user.email || '',
                name: sessionData.user.user_metadata.name,
                role: sessionData.user.user_metadata.role,
                grade_level: sessionData.user.user_metadata.grade_level,
                created_at: sessionData.user.created_at || new Date().toISOString(),
                preferences: {
                  language: 'en',
                  theme: 'light' as 'light' | 'dark',
                  difficulty: 'intermediate' as 'beginner' | 'intermediate' | 'advanced'
                }
              });
              setIsLoading(false);
              return;
            } else {
              localStorage.removeItem('demo-session');
            }
          } catch (error) {
            localStorage.removeItem('demo-session');
          }
        }

        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            // Set user directly from session to avoid delays on reload
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
              role: session.user.user_metadata?.role || 'student',
              grade_level: session.user.user_metadata?.grade_level,
              created_at: session.user.created_at,
              preferences: {
                language: 'en',
                theme: 'light' as 'light' | 'dark',
                difficulty: 'intermediate' as 'beginner' | 'intermediate' | 'advanced'
              }
            });
          } else {
            setUser(null);
          }
        } catch (sessionError: unknown) {
          // If session check fails due to invalid tokens, clear them and proceed
          if (sessionError instanceof Error && (sessionError.message?.includes('Invalid Refresh Token') ||
              sessionError.message?.includes('Refresh Token Not Found'))) {
            console.log('🧹 Clearing invalid session tokens');
            localStorage.removeItem('sb-' + import.meta.env.VITE_SUPABASE_URL.split('//')[1].split('.')[0] + '-auth-token');
            // Also clear any other Supabase related localStorage
            Object.keys(localStorage).forEach(key => {
              if (key.startsWith('sb-') && key.includes('auth')) {
                localStorage.removeItem(key);
              }
            });
          }
          setUser(null);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        errorReporting.reportError(error, { context: 'INITIALIZE_AUTH' });
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 Auth state changed:', event, session?.user?.id);

      if (event === 'SIGNED_IN' && session?.user) {
        console.log('✅ User signed in, setting profile from session...');
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          role: session.user.user_metadata?.role || 'student',
          grade_level: session.user.user_metadata?.grade_level,
          created_at: session.user.created_at,
          preferences: {
            language: 'en',
            theme: 'light' as 'light' | 'dark',
            difficulty: 'intermediate' as 'beginner' | 'intermediate' | 'advanced'
          }
        });
        // Handle role-based redirection
        const userRole = session.user.user_metadata?.role || 'student';
        if (window.location.pathname === '/' || window.location.pathname === '') {
          console.log('🚀 Redirecting user based on role:', userRole);
          if (userRole === 'student') {
            navigate('/student/dashboard', { replace: true });
          } else if (userRole === 'teacher') {
            navigate('/teacher/dashboard', { replace: true });
          }
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('👋 User signed out');
        setUser(null);
        navigate('/', { replace: true });
        setIsLoading(false);
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('🔄 Token refreshed');
        // Don't change loading state for token refresh
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignIn = async (email: string, password: string) => {
    try {
      console.log('🔑 Attempting sign in for:', email);
      const result = await signIn(email, password);

      // Handle demo accounts
      if ((email === 'student@demo.com' || email === 'teacher@demo.com') && password === 'demo123') {
        localStorage.setItem('demo-session', JSON.stringify(result));
        setUser({
          id: result.user.id,
          email: result.user.email || '',
          name: result.user.user_metadata.name,
          role: result.user.user_metadata.role,
          grade_level: result.user.user_metadata.grade_level,
          created_at: result.user.created_at || new Date().toISOString(),
          preferences: {
            language: 'en',
            theme: 'light' as 'light' | 'dark',
            difficulty: 'intermediate' as 'beginner' | 'intermediate' | 'advanced'
          }
        });
        setIsLoading(false);
        navigate(result.user.user_metadata.role === 'student' ? '/student/dashboard' : '/teacher/dashboard', { replace: true });
        return;
      }

      // Don't call refreshUser here - let the auth state change handler do it
    } catch (error) {
      errorReporting.reportError(error, { context: 'SIGN_IN' });
      throw error;
    }
  };

  const handleSignUp = async (email: string, password: string, name: string, role: 'student' | 'teacher', gradeLevel?: number) => {
    try {
      console.log('📝 Attempting sign up:', { email, name, role, gradeLevel });
      // Sign up with metadata
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
            grade_level: gradeLevel,
          }
        }
      });

      if (error) {
        errorReporting.reportError(error, { context: 'SIGN_UP' });
        throw error;
      }

      console.log('✅ Sign up successful:', data);
      // The auth state change handler will handle the redirection

    } catch (error) {
      errorReporting.reportError(error, { context: 'SIGN_UP' });
      throw error;
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      localStorage.removeItem('demo-session');
      setUser(null);
    } catch (error) {
      errorReporting.reportError(error, { context: 'SIGN_OUT' });
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};