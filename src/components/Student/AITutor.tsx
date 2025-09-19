import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Paper,
  TextInput,
  Button,
  Stack,
  Group,
  Text,
  ActionIcon,
  Select,
  Badge,
  ScrollArea,
  ThemeIcon,
  Loader,
  Card,
} from '@mantine/core';
import {
  IconSend,
  IconMicrophone,
  IconMicrophoneOff,
  IconVolume,
  IconVolumeOff,
  IconBrain,
  IconLightbulb,
  IconTarget,
  IconWorld,
  IconZap,
} from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { aiService } from '../../services/aiService';
import { notifications } from '@mantine/notifications';

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type: 'text' | 'quiz' | 'explanation';
}

export const AITutor: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: "Hi! I'm your AI tutor. I can explain any topic, create quizzes, and adapt to your learning style. What would you like to learn today?",
      sender: 'ai',
      timestamp: new Date(),
      type: 'text',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [difficulty, setDifficulty] = useState('intermediate');
  const [sessionId] = useState(() => crypto.randomUUID());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const languages = [
    { value: 'en', label: '🇺🇸 English' },
    { value: 'es', label: '🇪🇸 Español' },
    { value: 'hi', label: '🇮🇳 हिंदी' },
    { value: 'zh', label: '🇨🇳 中文' },
    { value: 'ar', label: '🇸🇦 العربية' },
    { value: 'fr', label: '🇫🇷 Français' },
  ];

  const quickPrompts = [
    t('aiTutor.explainNewton'),
    t('aiTutor.createQuiz'),
    t('aiTutor.helpCalculus'),
    t('aiTutor.explainQuantum'),
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (message?: string) => {
    const messageText = message || input.trim();
    if (!messageText || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: messageText,
      sender: 'user',
      timestamp: new Date(),
      type: 'text',
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const isQuizRequest = messageText.toLowerCase().includes('quiz') || 
                           messageText.toLowerCase().includes('test') ||
                           messageText.toLowerCase().includes('questions');

      if (isQuizRequest) {
        const quiz = await aiService.generateQuiz(messageText, difficulty, 5, user?.id);
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: `I've created a quiz for you on "${messageText}". Ready to test your knowledge?`,
          sender: 'ai',
          timestamp: new Date(),
          type: 'quiz',
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
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
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Sorry, I encountered an error. Please try again.',
        color: 'red',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if (!isListening) {
      setIsListening(true);
      // Simulate voice input for demo
      setTimeout(() => {
        setInput("Explain Newton's Laws");
        setIsListening(false);
        notifications.show({
          title: 'Voice Input',
          message: 'Voice input captured!',
          color: 'green',
        });
      }, 2000);
    } else {
      setIsListening(false);
    }
  };

  const handleTextToSpeech = (text: string) => {
    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    // Simulate text-to-speech for demo
    setTimeout(() => {
      setIsSpeaking(false);
      notifications.show({
        title: 'Speech',
        message: 'Speech completed!',
        color: 'blue',
      });
    }, 3000);
  };

  return (
    <Container size="lg">
      <Paper shadow="sm" radius="md" withBorder style={{ height: 'calc(100vh - 120px)' }}>
        {/* Header */}
        <Group justify="space-between" p="md" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
          <Group>
            <ThemeIcon size="lg" color="indigo" variant="light">
              <IconBrain size={20} />
            </ThemeIcon>
            <div>
              <Text fw={600} size="lg">
                {t('aiTutor.title')}
              </Text>
              <Text size="sm" c="dimmed">
                {t('aiTutor.subtitle')}
              </Text>
            </div>
          </Group>

          <Group>
            <Select
              data={languages}
              value={i18n.language}
              onChange={(value) => value && i18n.changeLanguage(value)}
              leftSection={<IconWorld size={16} />}
              w={140}
              size="xs"
            />
            <Select
              data={[
                { value: 'beginner', label: t('quiz.difficulty.beginner') },
                { value: 'intermediate', label: t('quiz.difficulty.intermediate') },
                { value: 'advanced', label: t('quiz.difficulty.advanced') },
              ]}
              value={difficulty}
              onChange={(value) => value && setDifficulty(value)}
              w={120}
              size="xs"
            />
          </Group>
        </Group>

        {/* Messages */}
        <ScrollArea style={{ height: 'calc(100% - 140px)' }} p="md">
          <Stack gap="md">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  style={{
                    display: 'flex',
                    justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <Card
                    shadow="sm"
                    padding="md"
                    radius="md"
                    style={{
                      maxWidth: '80%',
                      backgroundColor: message.sender === 'user' 
                        ? 'var(--mantine-color-indigo-6)' 
                        : 'var(--mantine-color-gray-1)',
                      color: message.sender === 'user' ? 'white' : 'inherit',
                    }}
                  >
                    {message.sender === 'ai' && (
                      <Group gap="xs" mb="xs">
                        <IconBrain size={16} color="var(--mantine-color-indigo-6)" />
                        <Text size="xs" fw={500} c="indigo">
                          AI Tutor
                        </Text>
                        {message.type === 'quiz' && (
                          <Badge size="xs" color="green">
                            <IconTarget size={12} />
                          </Badge>
                        )}
                        {message.type === 'explanation' && (
                          <Badge size="xs" color="yellow">
                            <IconLightbulb size={12} />
                          </Badge>
                        )}
                      </Group>
                    )}
                    
                    <Text size="sm" style={{ lineHeight: 1.5 }}>
                      {message.content}
                    </Text>

                    {message.sender === 'ai' && (
                      <Group justify="space-between" mt="sm" pt="sm" style={{ borderTop: '1px solid var(--mantine-color-gray-3)' }}>
                        <Group gap="xs">
                          <ActionIcon
                            size="sm"
                            variant="subtle"
                            onClick={() => handleTextToSpeech(message.content)}
                          >
                            {isSpeaking ? <IconVolumeOff size={14} /> : <IconVolume size={14} />}
                          </ActionIcon>
                          
                          {message.type === 'explanation' && (
                            <Button
                              size="xs"
                              variant="light"
                              color="green"
                              onClick={() => handleSend(`Create a quiz on ${message.content.slice(0, 50)}`)}
                            >
                              {t('aiTutor.createQuizButton')}
                            </Button>
                          )}
                        </Group>
                        
                        <Text size="xs" c="dimmed">
                          {message.timestamp.toLocaleTimeString()}
                        </Text>
                      </Group>
                    )}
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ display: 'flex', justifyContent: 'flex-start' }}
              >
                <Card shadow="sm" padding="md" radius="md" style={{ backgroundColor: 'var(--mantine-color-gray-1)' }}>
                  <Group gap="xs">
                    <Loader size="sm" color="indigo" />
                    <Text size="sm" c="dimmed">
                      {t('aiTutor.thinking')}
                    </Text>
                  </Group>
                </Card>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </Stack>
        </ScrollArea>

        {/* Quick Prompts */}
        {messages.length === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ padding: '0 1rem' }}
          >
            <Text size="sm" c="dimmed" mb="xs">
              Try these quick prompts:
            </Text>
            <Group gap="xs">
              {quickPrompts.map((prompt, index) => (
                <Button
                  key={index}
                  size="xs"
                  variant="light"
                  leftSection={<IconZap size={12} />}
                  onClick={() => handleSend(prompt)}
                >
                  {prompt}
                </Button>
              ))}
            </Group>
          </motion.div>
        )}

        {/* Input */}
        <Group p="md" style={{ borderTop: '1px solid var(--mantine-color-gray-3)' }}>
          <TextInput
            flex={1}
            placeholder={t('aiTutor.askAnything')}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            disabled={isLoading}
            rightSection={
              <ActionIcon
                onClick={handleVoiceInput}
                color={isListening ? 'red' : 'gray'}
                variant={isListening ? 'filled' : 'subtle'}
              >
                {isListening ? <IconMicrophoneOff size={16} /> : <IconMicrophone size={16} />}
              </ActionIcon>
            }
          />
          
          <Button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            loading={isLoading}
            leftSection={<IconSend size={16} />}
          >
            Send
          </Button>
        </Group>
      </Paper>
    </Container>
  );
};