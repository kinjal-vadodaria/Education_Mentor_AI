import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
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

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
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

  if (isLoading) {
    return <LoadingSpinner message="Loading your learning environment..." fullScreen />;
  }

  if (!user) {
    return <LoginForm />;
  }

  const renderContent = () => {
    if (user.role === 'student') {
      switch (activeTab) {
        case 'dashboard':
          return <StudentDashboard />;
        case 'ai-tutor':
          return <AITutor />;
        case 'quizzes':
          return <QuizInterface />;
        case 'progress':
          return <ProgressTracker />;
        case 'library':
          return <Container>Library coming soon...</Container>;
        case 'settings':
          return <Settings />;
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
          return <Analytics />;
        case 'students':
          return <StudentManagement />;
        case 'resources':
          return <Container>Resources coming soon...</Container>;
        case 'settings':
          return <Settings />;
        default:
          return <TeacherDashboard />;
      }
    }
  };

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
            {renderContent()}
          </ErrorBoundary>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
