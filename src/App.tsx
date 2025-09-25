import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import { Library } from './components/Student/Library';
import { Resources } from './components/Teacher/Resources';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [opened, { toggle }] = useDisclosure();

  if (isLoading) {
    return <LoadingSpinner message="Loading your learning environment..." fullScreen />;
  }

  if (!user) {
    return <LoginForm />;
  }

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
          <Sidebar />
        </ErrorBoundary>
      </AppShell.Navbar>

      <AppShell.Main>
        <Container size="xl" px="md">
          <ErrorBoundary>
            <Routes>
              {user.role === 'student' ? (
                <>
                  <Route path="/student/dashboard" element={<StudentDashboard />} />
                  <Route path="/student/ai-tutor" element={<AITutor />} />
                  <Route path="/student/quizzes" element={<QuizInterface />} />
                  <Route path="/student/progress" element={<ProgressTracker />} />
                  <Route path="/student/library" element={<Library />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/" element={<Navigate to="/student/dashboard" replace />} />
                  <Route path="/student" element={<Navigate to="/student/dashboard" replace />} />
                </>
              ) : (
                <>
                  <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
                  <Route path="/teacher/lesson-planner" element={<LessonPlanner />} />
                  <Route path="/teacher/analytics" element={<Analytics />} />
                  <Route path="/teacher/students" element={<StudentManagement />} />
                  <Route path="/teacher/resources" element={<Resources />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/" element={<Navigate to="/teacher/dashboard" replace />} />
                  <Route path="/teacher" element={<Navigate to="/teacher/dashboard" replace />} />
                </>
              )}
            </Routes>
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
