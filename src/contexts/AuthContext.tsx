import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

  const refreshUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      errorReporting.reportError(error, { context: 'REFRESH_USER' });
      setUser(null);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await refreshUser();
        }
      } catch (error) {
        errorReporting.reportError(error, { context: 'INITIALIZE_AUTH' });
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await refreshUser();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignIn = async (email: string, password: string) => {
    try {
      await signIn(email, password);
      await refreshUser();
    } catch (error) {
      errorReporting.reportError(error, { context: 'SIGN_IN' });
      throw error;
    }
  };

  const handleSignUp = async (email: string, password: string, name: string, role: 'student' | 'teacher', gradeLevel?: number) => {
    try {
      const { user: authUser } = await signUp(email, password);
      if (authUser) {
        await createUserProfile(authUser.id, {
          email,
          name,
          role,
          grade_level: gradeLevel,
        });
        await refreshUser();
      }
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