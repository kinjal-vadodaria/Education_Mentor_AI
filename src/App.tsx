import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LoginForm } from './components/Auth/LoginForm';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { StudentDashboard } from './components/Student/Dashboard';
import { AITutor } from './components/Student/AITutor';
import { QuizInterface } from './components/Student/QuizInterface';
import { TeacherDashboard } from './components/Teacher/Dashboard';
import { LessonPlanner } from './components/Teacher/LessonPlanner';
import { cn } from './utils/cn';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  const renderContent = () => {
    if (user.role === 'student') {
      switch (activeTab) {
        case 'dashboard':
          return <StudentDashboard />;
        case 'tutor':
          return <AITutor />;
        case 'quizzes':
          return <QuizInterface />;
        case 'progress':
          return <div className="p-8 text-center text-gray-500">Progress tracking coming soon...</div>;
        case 'library':
          return <div className="p-8 text-center text-gray-500">Learning library coming soon...</div>;
        default:
          return <StudentDashboard />;
      }
    } else {
      switch (activeTab) {
        case 'dashboard':
          return <TeacherDashboard />;
        case 'lesson-planner':
          return <LessonPlanner />;
        case 'analytics':
          return <div className="p-8 text-center text-gray-500">Analytics dashboard coming soon...</div>;
        case 'students':
          return <div className="p-8 text-center text-gray-500">Student management coming soon...</div>;
        case 'resources':
          return <div className="p-8 text-center text-gray-500">Teaching resources coming soon...</div>;
        default:
          return <TeacherDashboard />;
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="flex h-[calc(100vh-4rem)]">
        <Sidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
        />
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--toast-bg)',
                color: 'var(--toast-color)',
              },
            }}
          />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;