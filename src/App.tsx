import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell, Container } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/Auth/LoginForm';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { StudentDashboard } from './components/Student/Dashboard';
import { AITutor } from './components/Student/AITutor';
import { QuizInterface } from './components/Student/QuizInterface';
import { ProgressTracker } from './components/Student/ProgressTracker';
import { TeacherDashboard } from './components/Teacher/Dashboard';
import { LessonPlanner } from './components/Teacher/LessonPlanner';
import { Analytics } from './components/Teacher/Analytics';
import { StudentManagement } from './components/Teacher/StudentManagement';
import { Settings } from './components/common/Settings';

// Protected Route Component
const ProtectedRoute: React.FC<{ 
  children: React.ReactNode; 
  requiredRole?: 'student' | 'teacher';
}> = ({ children, requiredRole }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner message="Loading your learning environment..." fullScreen />;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Redirect to appropriate dashboard based on actual role
    const redirectPath = user.role === 'student' ? '/student/dashboard' : '/teacher/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

// Dashboard Layout Component
const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [opened, { toggle }] = useDisclosure();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Listen for tab change events from quick actions
  useEffect(() => {
    const handleTabChange = (event: CustomEvent) => {
      setActiveTab(event.detail);
    };

    window.addEventListener('changeTab', handleTabChange as EventListener);
    return () => {
      window.removeEventListener('changeTab', handleTabChange as EventListener);
    };
  }, []);

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 280,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Header opened={opened} toggle={toggle} />
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <ErrorBoundary>
          <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        </ErrorBoundary>
      </AppShell.Navbar>

      <AppShell.Main>
        <Container size="xl" px="md">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
};

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner message="Loading your learning environment..." fullScreen />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/" 
        element={!user ? <LoginForm /> : <Navigate to={user.role === 'student' ? '/student/dashboard' : '/teacher/dashboard'} replace />} 
      />
      
      {/* Student Routes */}
      <Route path="/student/*" element={
        <ProtectedRoute requiredRole="student">
          <DashboardLayout>
            <Routes>
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="ai-tutor" element={<AITutor />} />
              <Route path="quizzes" element={<QuizInterface />} />
              <Route path="progress" element={<ProgressTracker />} />
              <Route path="library" element={<Container>Library coming soon...</Container>} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
            </Routes>
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      {/* Teacher Routes */}
      <Route path="/teacher/*" element={
        <ProtectedRoute requiredRole="teacher">
          <DashboardLayout>
            <Routes>
              <Route path="dashboard" element={<TeacherDashboard />} />
              <Route path="lesson-planner" element={<LessonPlanner />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="students" element={<StudentManagement />} />
              <Route path="resources" element={<Container>Resources coming soon...</Container>} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/teacher/dashboard" replace />} />
            </Routes>
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;