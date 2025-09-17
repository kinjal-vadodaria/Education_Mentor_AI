import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Student, Teacher } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: 'student' | 'teacher') => Promise<void>;
  logout: () => void;
  isLoading: boolean;
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('edumentor_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, role: 'student' | 'teacher') => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUser: User = role === 'student' ? {
      id: '1',
      name: 'Alex Johnson',
      email,
      role: 'student',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
      preferences: {
        language: 'en',
        theme: 'light',
        difficulty: 'intermediate'
      }
    } as Student : {
      id: '2',
      name: 'Dr. Sarah Wilson',
      email,
      role: 'teacher',
      avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150',
      preferences: {
        language: 'en',
        theme: 'light',
        difficulty: 'advanced'
      },
      subjects: ['Physics', 'Mathematics'],
      classes: []
    } as Teacher;

    if (role === 'student') {
      (mockUser as Student).progress = {
        level: 5,
        xp: 1250,
        streak: 7,
        badges: [
          {
            id: '1',
            name: 'Quick Learner',
            description: 'Completed 5 topics in a week',
            icon: '🚀',
            earnedAt: new Date()
          }
        ],
        completedTopics: ['Basic Algebra', 'Geometry Basics']
      };
      (mockUser as Student).learningStyle = 'visual';
    }

    setUser(mockUser);
    localStorage.setItem('edumentor_user', JSON.stringify(mockUser));
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('edumentor_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};