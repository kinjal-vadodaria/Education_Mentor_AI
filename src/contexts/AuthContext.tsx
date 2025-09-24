import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, signIn, signUp, signOut, getCurrentUser, createUserProfile } from '../services/supabase';
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
      errorReporting.reportError(error, { context: 'REFRESH_USER' });
      setUser(null);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await refreshUser();
        } else {
          setUser(null);
        }
      } catch (error) {
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
        console.log('✅ User signed in, refreshing profile...');
        setIsLoading(true);
        await refreshUser();
        setIsLoading(false);
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
      await signIn(email, password);
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