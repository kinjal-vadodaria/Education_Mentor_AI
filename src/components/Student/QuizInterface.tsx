import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Paper,
  Title,
  Text,
  Button,
  Group,
  Stack,
  Progress,
  Card,
  Grid,
  ThemeIcon,
  Badge,
  Center,
  Loader,
} from '@mantine/core';
import {
  IconTarget,
  IconClock,
  IconTrophy,
  IconStar,
  IconBrain,
  IconBolt,
  IconRefresh,
} from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { aiService, Quiz, Question } from '../../services/aiService';
import { notifications } from '@mantine/notifications';

export const QuizInterface: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [quizResult, setQuizResult] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  const topics = [
    { name: "Newton's Laws", difficulty: 'intermediate', icon: '⚡', color: 'blue' },
    { name: 'Photosynthesis', difficulty: 'beginner', icon: '🌱', color: 'green' },
    { name: 'Algebra Basics', difficulty: 'intermediate', icon: '📐', color: 'orange' },
    { name: 'World History', difficulty: 'advanced', icon: '🏛️', color: 'purple' },
    { name: 'Chemistry Bonds', difficulty: 'advanced', icon: '🧪', color: 'red' },
    { name: 'Literature Analysis', difficulty: 'intermediate', icon: '📚', color: 'teal' },
  ];

  useEffect(() => {
    if (currentQuiz && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && currentQuiz && !showResults) {
      handleSubmitQuiz();
    }
  }, [timeLeft, currentQuiz, showResults]);

  const startQuiz = async (topic: string, difficulty: string) => {
    setIsLoading(true);
    try {
      const quiz = await aiService.generateQuiz(topic, difficulty, 5, user?.id);
      setCurrentQuiz(quiz);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setShowResults(false);
      setTimeLeft(quiz.timeLimit || 300);
      notifications.show({
        title: 'Quiz Started',
        message: `Quiz started: ${topic}`,
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to generate quiz. Please try again.',
        color: 'red',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < (currentQuiz?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleSubmitQuiz();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!currentQuiz) return;

    setIsLoading(true);
    try {
      const result = await aiService.gradeQuiz(currentQuiz, answers, user?.id);
      setQuizResult(result);
      setShowResults(true);
      
      const percentage = (result.score / result.totalPoints) * 100;
      if (percentage >= 90) {
        notifications.show({
          title: 'Excellent!',
          message: 'Outstanding performance! 🎉',
          color: 'green',
        });
      } else if (percentage >= 70) {
        notifications.show({
          title: 'Good Job!',
          message: 'Well done! 👍',
          color: 'blue',
        });
      } else {
        notifications.show({
          title: 'Keep Practicing!',
          message: 'You\'re improving! 💪',
          color: 'orange',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to grade quiz. Please try again.',
        color: 'red',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetQuiz = () => {
    setCurrentQuiz(null);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setShowResults(false);
    setQuizResult(null);
    setTimeLeft(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <Container size="sm">
        <Center style={{ height: '60vh' }}>
          <Stack align="center">
            <Loader size="xl" color="indigo" />
            <Text size="lg" c="dimmed">
              Generating your personalized quiz...
            </Text>
          </Stack>
        </Center>
      </Container>
    );
  }

  if (showResults && quizResult) {
    const percentage = (quizResult.score / quizResult.totalPoints) * 100;
    
    return (
      <Container size="md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Paper shadow="sm" p="xl" radius="md" withBorder>
            <Stack align="center" gap="xl">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                {percentage >= 90 ? (
                  <ThemeIcon size={80} color="yellow" variant="light">
                    <IconTrophy size={40} />
                  </ThemeIcon>
                ) : percentage >= 70 ? (
                  <ThemeIcon size={80} color="blue" variant="light">
                    <IconStar size={40} />
                  </ThemeIcon>
                ) : (
                  <ThemeIcon size={80} color="gray" variant="light">
                    <IconTarget size={40} />
                  </ThemeIcon>
                )}
              </motion.div>

              <div style={{ textAlign: 'center' }}>
                <Title order={2} mb="xs">
                  {t('quiz.quizComplete')}
                </Title>
                
                <Text size="xl" fw={700} mb="md" c={
                  percentage >= 90 ? 'green' :
                  percentage >= 70 ? 'blue' :
                  percentage >= 50 ? 'orange' : 'red'
                }>
                  {percentage.toFixed(0)}%
                </Text>

                <Text c="dimmed" mb="xl">
                  You scored {quizResult.score} out of {quizResult.totalPoints} points
                  {quizResult.xpGained && (
                    <Badge ml="sm" color="purple" variant="light">
                      +{quizResult.xpGained} XP
                    </Badge>
                  )}
                </Text>
              </div>

              {/* Feedback */}
              <Card w="100%" withBorder>
                <Title order={4} mb="md">
                  {t('quiz.detailedFeedback')}
                </Title>
                <Stack gap="sm">
                  {quizResult.feedback.map((feedback: string, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                    >
                      <Paper p="sm" withBorder>
                        <Text size="sm">{feedback}</Text>
                      </Paper>
                    </motion.div>
                  ))}
                </Stack>
              </Card>

              {/* Recommendations */}
              <Card w="100%" withBorder>
                <Title order={4} mb="md">
                  {t('quiz.recommendations')}
                </Title>
                <Stack gap="xs">
                  {quizResult.suggestions.map((suggestion: string, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                    >
                      <Group gap="sm">
                        <IconBolt size={16} color="var(--mantine-color-indigo-6)" />
                        <Text size="sm">{suggestion}</Text>
                      </Group>
                    </motion.div>
                  ))}
                </Stack>
              </Card>

              <Group>
                <Button
                  onClick={resetQuiz}
                  leftSection={<IconRefresh size={16} />}
                  variant="gradient"
                  gradient={{ from: 'indigo', to: 'purple' }}
                >
                  {t('quiz.takeAnother')}
                </Button>
                <Button
                  onClick={() => startQuiz(currentQuiz?.topic || "Newton's Laws", 'intermediate')}
                  variant="outline"
                >
                  {t('quiz.retryQuiz')}
                </Button>
              </Group>
            </Stack>
          </Paper>
        </motion.div>
      </Container>
    );
  }

  if (currentQuiz) {
    const currentQuestion = currentQuiz.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100;

    return (
      <Container size="md">
        {/* Quiz Header */}
        <Paper shadow="sm" p="md" radius="md" withBorder mb="md">
          <Group justify="space-between" mb="md">
            <div>
              <Title order={3}>{currentQuiz.title}</Title>
              <Text size="sm" c="dimmed">
                {t('quiz.question', { 
                  current: currentQuestionIndex + 1, 
                  total: currentQuiz.questions.length 
                })}
              </Text>
            </div>
            <Group gap="md">
              <Group gap="xs">
                <IconClock size={16} />
                <Text
                  size="sm"
                  c={timeLeft < 60 ? 'red' : 'dimmed'}
                  fw={timeLeft < 60 ? 700 : 400}
                >
                  {formatTime(timeLeft)}
                </Text>
              </Group>
            </Group>
          </Group>

          <Progress value={progress} color="indigo" size="sm" />
        </Paper>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Paper shadow="sm" p="xl" radius="md" withBorder>
              <Stack gap="xl">
                <Title order={4} mb="md">
                  {currentQuestion.question}
                </Title>

                {currentQuestion.type === 'multiple-choice' && (
                  <Stack gap="sm">
                    {currentQuestion.options?.map((option, index) => (
                      <motion.div
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Paper
                          p="md"
                          withBorder
                          style={{
                            cursor: 'pointer',
                            borderColor: answers[currentQuestion.id] === option 
                              ? 'var(--mantine-color-indigo-6)' 
                              : 'var(--mantine-color-gray-3)',
                            backgroundColor: answers[currentQuestion.id] === option 
                              ? 'var(--mantine-color-indigo-0)' 
                              : 'transparent',
                          }}
                          onClick={() => handleAnswerSelect(currentQuestion.id, option)}
                        >
                          <Group gap="md">
                            <div
                              style={{
                                width: 16,
                                height: 16,
                                borderRadius: '50%',
                                border: `2px solid ${
                                  answers[currentQuestion.id] === option 
                                    ? 'var(--mantine-color-indigo-6)' 
                                    : 'var(--mantine-color-gray-4)'
                                }`,
                                backgroundColor: answers[currentQuestion.id] === option 
                                  ? 'var(--mantine-color-indigo-6)' 
                                  : 'transparent',
                              }}
                            />
                            <Text>{option}</Text>
                          </Group>
                        </Paper>
                      </motion.div>
                    ))}
                  </Stack>
                )}

                {/* Navigation */}
                <Group justify="space-between">
                  <Button
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    variant="outline"
                  >
                    {t('common.previous')}
                  </Button>

                  <Text size="sm" c="dimmed">
                    {Object.keys(answers).length} of {currentQuiz.questions.length} answered
                  </Text>

                  <Button
                    onClick={handleNextQuestion}
                    disabled={!answers[currentQuestion.id]}
                    variant={currentQuestionIndex === currentQuiz.questions.length - 1 ? 'gradient' : 'filled'}
                    gradient={currentQuestionIndex === currentQuiz.questions.length - 1 ? { from: 'green', to: 'teal' } : undefined}
                  >
                    {currentQuestionIndex === currentQuiz.questions.length - 1 ? t('common.submit') : t('common.next')}
                  </Button>
                </Group>
              </Stack>
            </Paper>
          </motion.div>
        </AnimatePresence>
      </Container>
    );
  }

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
              <IconTarget size={40} />
            </ThemeIcon>
          </motion.div>
          <Title order={2} mb="xs">
            {t('quiz.title')}
          </Title>
          <Text c="dimmed" size="lg">
            {t('quiz.subtitle')}
          </Text>
        </div>

        {/* Topic Selection */}
        <Grid>
          {topics.map((topic, index) => (
            <Grid.Col key={topic.name} span={{ base: 12, sm: 6, lg: 4 }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  shadow="sm"
                  padding="xl"
                  radius="md"
                  withBorder
                  style={{ cursor: 'pointer', height: '100%' }}
                  onClick={() => startQuiz(topic.name, topic.difficulty)}
                >
                  <Stack align="center" gap="md">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      style={{ fontSize: '3rem' }}
                    >
                      {topic.icon}
                    </motion.div>
                    
                    <div style={{ textAlign: 'center' }}>
                      <Title order={4} mb="xs">
                        {topic.name}
                      </Title>
                      <Badge
                        color={
                          topic.difficulty === 'beginner' ? 'green' :
                          topic.difficulty === 'intermediate' ? 'orange' : 'red'
                        }
                        variant="light"
                      >
                        {t(`quiz.difficulty.${topic.difficulty}`)}
                      </Badge>
                    </div>

                    <Group gap="xs" c="indigo" style={{ opacity: 0.8 }}>
                      <IconBrain size={16} />
                      <Text size="sm" fw={500}>
                        {t('quiz.startQuiz')}
                      </Text>
                    </Group>
                  </Stack>
                </Card>
              </motion.div>
            </Grid.Col>
          ))}
        </Grid>
      </Stack>
    </Container>
  );
};