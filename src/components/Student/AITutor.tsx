import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Paper,
  Title,
  Text,
  TextInput,
  Button,
  Group,
  Stack,
  Card,
  Grid,
  ThemeIcon,
  ActionIcon,
  ScrollArea,
  Badge,
  Center,
  Loader,
} from '@mantine/core';
import {
  IconBrain,
  IconSend,
  IconMicrophone,
  IconVolume,
  IconTarget,
  IconBolt,
  IconBook,
  IconMath,
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
  type?: 'text' | 'explanation' | 'quiz';
}

export const AITutor: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => Date.now().toString());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Welcome message
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      content: `Hello ${user?.name}! I'm your AI tutor. I'm here to help you learn and understand any topic. What would you like to explore today?`,
      sender: 'ai',
      timestamp: new Date(),
      type: 'text',
    };
    setMessages([welcomeMessage]);
  }, [user?.name]);

  const quickPrompts = [
    {
      text: t('aiTutor.explainNewton'),
      icon: IconBolt,
      color: 'blue',
    },
    {
      text: t('aiTutor.createQuiz'),
      icon: IconTarget,
      color: 'green',
    },
    {
      text: t('aiTutor.helpCalculus'),
      icon: IconMath,
      color: 'purple',
    },
    {
      text: t('aiTutor.explainQuantum'),
      icon: IconBook,
      color: 'orange',
    },
  ];

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || inputValue.trim();
    if (!text) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: text,
      sender: 'user',
      timestamp: new Date(),
      type: 'text',
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Check if user is asking for a quiz
      if (text.toLowerCase().includes('quiz') || text.toLowerCase().includes('test')) {
        try {
          const quiz = await aiService.generateQuiz(text, user?.preferences?.difficulty || 'intermediate', 5, user?.id);
          const aiMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            content: `I've created a quiz for you on "${text}". Here are the questions:\n\n${quiz.questions.map((q, i) => `${i + 1}. ${q.question}\n${q.options?.map((opt, j) => `   ${String.fromCharCode(65 + j)}. ${opt}`).join('\n') || ''}`).join('\n\n')}\n\nWould you like to take this quiz in the Quiz section?`,
            sender: 'ai',
            timestamp: new Date(),
            type: 'quiz',
          };
          setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
          const aiMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            content: `I'd be happy to create a quiz for you on "${text}"! However, I'm having trouble generating it right now. You can try the Quiz section for pre-made quizzes on various topics.`,
            sender: 'ai',
            timestamp: new Date(),
            type: 'text',
          };
          setMessages(prev => [...prev, aiMessage]);
        }
      } else {
        // Regular explanation request
        try {
          const response = await aiService.generateExplanation(
            text,
            user?.preferences?.difficulty || 'intermediate',
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
            content: getFallbackResponse(text, user?.preferences?.difficulty || 'intermediate'),
            sender: 'ai',
            timestamp: new Date(),
            type: 'explanation',
          };
          setMessages(prev => [...prev, aiMessage]);
        }
      }
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to get response from AI tutor',
        color: 'red',
      });
      
      // Add fallback message
      const fallbackMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I'm having trouble connecting right now. Let me try to help you with what I know! Could you please rephrase your question or try asking about a specific topic like physics, math, or science?",
        sender: 'ai',
        timestamp: new Date(),
        type: 'text',
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
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

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Container size="lg">
      <Stack gap="xl">
        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <ThemeIcon size={80} color="indigo" variant="light" mx="auto" mb="md">
              <IconBrain size={40} />
            </ThemeIcon>
          </motion.div>
          <Title order={2} mb="xs">
            {t('aiTutor.title')}
          </Title>
          <Text c="dimmed" size="lg">
            {t('aiTutor.subtitle')}
          </Text>
        </div>

        {/* Quick Prompts */}
        {messages.length <= 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Text fw={500} mb="md" ta="center">
              {t('aiTutor.quickPrompts')}
            </Text>
            <Grid>
              {quickPrompts.map((prompt, index) => {
                const Icon = prompt.icon;
                return (
                  <Grid.Col key={index} span={{ base: 12, sm: 6 }}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card
                        shadow="sm"
                        padding="md"
                        radius="md"
                        withBorder
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleSendMessage(prompt.text)}
                      >
                        <Group gap="sm">
                          <ThemeIcon color={prompt.color} variant="light">
                            <Icon size={16} />
                          </ThemeIcon>
                          <Text size="sm" style={{ flex: 1 }}>
                            {prompt.text}
                          </Text>
                        </Group>
                      </Card>
                    </motion.div>
                  </Grid.Col>
                );
              })}
            </Grid>
          </motion.div>
        )}

        {/* Chat Messages */}
        <Paper shadow="sm" radius="md" withBorder style={{ height: '60vh' }}>
          <ScrollArea h="100%" p="md" viewportRef={viewport}>
            <Stack gap="md">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Group
                      align="flex-start"
                      gap="sm"
                      style={{
                        flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
                      }}
                    >
                      <ThemeIcon
                        size="lg"
                        color={message.sender === 'user' ? 'blue' : 'indigo'}
                        variant="light"
                      >
                        {message.sender === 'user' ? (
                          <IconBrain size={20} />
                        ) : (
                          <IconBrain size={20} />
                        )}
                      </ThemeIcon>
                      
                      <Paper
                        p="md"
                        radius="lg"
                        style={{
                          maxWidth: '70%',
                          backgroundColor: message.sender === 'user' 
                            ? 'var(--mantine-color-blue-0)' 
                            : 'var(--mantine-color-gray-0)',
                        }}
                      >
                        <Stack gap="xs">
                          <Group justify="space-between" align="flex-start">
                            <Text size="sm" fw={500}>
                              {message.sender === 'user' ? 'You' : 'AI Tutor'}
                            </Text>
                            {message.type && (
                              <Badge size="xs" variant="light">
                                {message.type}
                              </Badge>
                            )}
                          </Group>
                          
                          <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                            {message.content}
                          </Text>
                          
                          <Text size="xs" c="dimmed">
                            {message.timestamp.toLocaleTimeString()}
                          </Text>
                        </Stack>
                      </Paper>
                    </Group>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Group align="flex-start" gap="sm">
                    <ThemeIcon size="lg" color="indigo" variant="light">
                      <IconBrain size={20} />
                    </ThemeIcon>
                    <Paper p="md" radius="lg" style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
                      <Group gap="sm">
                        <Loader size="sm" />
                        <Text size="sm" c="dimmed">
                          {t('aiTutor.thinking')}
                        </Text>
                      </Group>
                    </Paper>
                  </Group>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </Stack>
          </ScrollArea>
        </Paper>

        {/* Input Area */}
        <Paper shadow="sm" p="md" radius="md" withBorder>
          <Group gap="sm">
            <TextInput
              placeholder={t('aiTutor.askAnything')}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              style={{ flex: 1 }}
              size="lg"
            />
            
            <ActionIcon
              size="lg"
              variant="subtle"
              color="gray"
              title={t('aiTutor.voiceInput')}
            >
              <IconMicrophone size={20} />
            </ActionIcon>
            
            <ActionIcon
              size="lg"
              variant="subtle"
              color="gray"
              title={t('aiTutor.textToSpeech')}
            >
              <IconVolume size={20} />
            </ActionIcon>
            
            <Button
              onClick={() => handleSendMessage()}
              loading={isLoading}
              leftSection={<IconSend size={16} />}
              size="lg"
              disabled={!inputValue.trim()}
            >
              Send
            </Button>
          </Group>
        </Paper>
      </Stack>
    </Container>
  );
};