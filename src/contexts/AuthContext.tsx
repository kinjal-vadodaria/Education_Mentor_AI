import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, User, signIn, signUp, signOut, getUserProfile } from '../services/supabase';
import { notifications } from '@mantine/notifications';
import { errorReporting } from '../services/errorReporting';

interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, userData: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setSupabaseUser(session.user);
        loadUserProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (session?.user) {
        setSupabaseUser(session.user);
        await loadUserProfile(session.user.id);
      } else {
        setSupabaseUser(null);
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await getUserProfile(userId);
      if (error) {
        console.error('Error loading user profile:', error);
        errorReporting.reportError(error, { context: 'LOAD_USER_PROFILE', userId });
        
        // Create a basic profile if none exists
        const supabaseUserData = supabase.auth.getUser();
        const basicUser: User = {
          id: userId,
          email: (await supabaseUserData).data.user?.email || '',
          role: 'student',
          name: (await supabaseUserData).data.user?.user_metadata?.name || 'User',
          created_at: new Date().toISOString(),
          preferences: {
            language: 'en',
            theme: 'light',
            difficulty: 'intermediate'
          }
        };
        setUser(basicUser);
      } else {
        setUser(data);
      }
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
      errorReporting.reportError(error as Error, { context: 'LOAD_USER_PROFILE_CATCH', userId });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    if (supabaseUser) {
      await loadUserProfile(supabaseUser.id);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) throw error;
      
      notifications.show({
        title: 'Success',
        message: 'Logged in successfully!',
        color: 'green',
      });
      
      errorReporting.reportUserAction('LOGIN_SUCCESS', { email });
    } catch (error: any) {
      errorReporting.reportError(error, { context: 'LOGIN_FAILED', email });
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to log in',
        color: 'red',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, userData: Partial<User>) => {
    setIsLoading(true);
    try {
      const { error } = await signUp(email, password, userData);
      if (error) throw error;
      
      notifications.show({
        title: 'Success',
        message: 'Account created successfully!',
        color: 'green',
      });
      
      errorReporting.reportUserAction('REGISTER_SUCCESS', { email, role: userData.role });
    } catch (error: any) {
      errorReporting.reportError(error, { context: 'REGISTER_FAILED', email });
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to create account',
        color: 'red',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const { error } = await signOut();
      if (error) throw error;
      
      notifications.show({
        title: 'Success',
        message: 'Logged out successfully!',
        color: 'blue',
      });
      
      errorReporting.reportUserAction('LOGOUT_SUCCESS');
    } catch (error: any) {
      errorReporting.reportError(error, { context: 'LOGOUT_FAILED' });
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to log out',
        color: 'red',
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, supabaseUser, login, register, logout, isLoading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};