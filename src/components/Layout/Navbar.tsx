import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AppShell, Container } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';
import { LoginForm } from '../Auth/LoginForm';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { StudentDashboard } from '../Student/Dashboard';
import { AITutor } from '../Student/AITutor';
import { QuizInterface } from '../Student/QuizInterface';
import { ProgressTracker } from '../Student/ProgressTracker';
import { TeacherDashboard } from '../Teacher/Dashboard';
import { LessonPlanner } from '../Teacher/LessonPlanner';
import { Analytics } from '../Teacher/Analytics';
import { StudentManagement } from '../Teacher/StudentManagement';
import { Settings } from '../common/Settings';

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
          <Sidebar onTabChange={setActiveTab} />
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
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;