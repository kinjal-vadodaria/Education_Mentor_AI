import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AppShell, Container, LoadingOverlay } from '@mantine/core';
import { useDisclosure, useColorScheme } from '@mantine/hooks';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/Auth/LoginForm';
import { Header } from './components/Layout/Header';
import { Navbar } from './components/Layout/Navbar';
import { StudentDashboard } from './components/Student/Dashboard';
import { AITutor } from './components/Student/AITutor';
import { QuizInterface } from './components/Student/QuizInterface';
import { ProgressTracker } from './components/Student/ProgressTracker';
import { TeacherDashboard } from './components/Teacher/Dashboard';
import { LessonPlanner } from './components/Teacher/LessonPlanner';
import { Analytics } from './components/Teacher/Analytics';
import { StudentManagement } from './components/Teacher/StudentManagement';

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
        try {
          const quiz = await aiService.generateQuiz(messageText, difficulty, 5, user?.id);
          const aiMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            content: `I've created a quiz for you on "${messageText}". Here are the questions:\n\n${quiz.questions.map((q, i) => `${i + 1}. ${q.question}\n${q.options?.map((opt, j) => `   ${String.fromCharCode(65 + j)}. ${opt}`).join('\n') || ''}`).join('\n\n')}\n\nWould you like to take this quiz in the Quiz section?`,
            sender: 'ai',
            timestamp: new Date(),
            type: 'quiz',
          };
          setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
          const aiMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            content: `I'd be happy to create a quiz for you on "${messageText}"! However, I'm having trouble generating it right now. You can try the Quiz section for pre-made quizzes on various topics.`,
            sender: 'ai',
            timestamp: new Date(),
            type: 'text',
          };
          setMessages(prev => [...prev, aiMessage]);
        }
        case 'settings':
        try {
          const response = await aiService.generateExplanation(
            messageText,
            difficulty,
            i18n.language,
            user?.grade_level,
            user?.id,
            sessionId
          );
          const aiMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            content: response.content,
            sender: 'ai',
            timestamp: new Date(),
            type: 'explanation',
          };
          setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
          // Provide a helpful fallback response
          const aiMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            content: this.getFallbackResponse(messageText, difficulty),
            sender: 'ai',
            timestamp: new Date(),
            type: 'explanation',
          };
          setMessages(prev => [...prev, aiMessage]);
        }
        case 'students':
          return <StudentManagement />;
        case 'resources':
          return <Container>Resources coming soon...</Container>;
        case 'settings':
          return <Settings />;
        default:
      
      // Add fallback message
      const fallbackMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I'm having trouble connecting right now. Let me try to help you with what I know! Could you please rephrase your question or try asking about a specific topic like physics, math, or science?",
        sender: 'ai',
        timestamp: new Date(),
        type: 'text',
      };
      setMessages(prev => [...prev, fallbackMessage]);
          return <TeacherDashboard />;
      }
    }
  };

  const getFallbackResponse = (topic: string, difficulty: string): string => {
    const responses: Record<string, Record<string, string>> = {
      "newton": {
        beginner: "Newton's Laws are like rules for how things move! The first law says things at rest stay at rest, and things moving keep moving unless something stops them. The second law says the harder you push something, the faster it goes. The third law says for every action, there's an equal and opposite reaction - like when you walk, you push back on the ground and it pushes you forward!",
        intermediate: "Newton's Three Laws of Motion describe the relationship between forces and motion. The First Law (Inertia) states that objects remain at rest or in uniform motion unless acted upon by an external force. The Second Law relates force, mass, and acceleration (F=ma). The Third Law states that for every action, there is an equal and opposite reaction.",
        advanced: "Newton's laws form the foundation of classical mechanics. The First Law defines inertial reference frames and the concept of inertia. The Second Law, F=ma, is actually F=dp/dt in its most general form. The Third Law reflects the conservation of momentum and is fundamental to understanding interactions between objects."
      },
      "photosynthesis": {
        beginner: "Photosynthesis is how plants make their own food! They use sunlight, water, and carbon dioxide from the air to create sugar and oxygen. It's like plants are cooking their own meals using sunlight as their energy source!",
        intermediate: "Photosynthesis is the process by which plants convert light energy into chemical energy. The equation is: 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂. This occurs in chloroplasts and involves light-dependent and light-independent reactions.",
        advanced: "Photosynthesis involves complex biochemical pathways including the light reactions in thylakoids (photosystems I and II, electron transport chain) and the Calvin cycle in the stroma. The process converts light energy to ATP and NADPH, which drive carbon fixation."
      }
    };

    const topicKey = Object.keys(responses).find(key => 
      topic.toLowerCase().includes(key)
    );

    if (topicKey && responses[topicKey][difficulty]) {
      return responses[topicKey][difficulty];
    }

    return `I'd be happy to help you learn about ${topic}! This is a fascinating topic. While I'm having trouble accessing my full knowledge base right now, I can tell you that understanding ${topic} is important for building a strong foundation in your studies. Would you like me to suggest some specific questions about ${topic} that I might be able to help with?`;
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
          <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
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