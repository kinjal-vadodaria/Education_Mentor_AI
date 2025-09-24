import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Grid,
  Card,
  Text,
  Title,
  Group,
  Stack,
  Badge,
  ThemeIcon,
  Container,
  Paper,
} from '@mantine/core';
import {
  IconTrophy,
  IconFlame,
  IconBook,
  IconStar,
  IconBrain,
  IconTarget,
  IconTrendingUp,
  IconClock,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { getStudentProgress, getQuizResults } from '../../services/supabase';

interface QuizResult {
  quiz_topic: string;
  score: number;
  total_questions: number;
  completed_at: string;
}

interface ProgressData {
  xp_points: number;
  current_streak: number;
  badges?: string[];
}

export const StudentDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [progress, setProgress] = useState<ProgressData[]>([]);
  const [recentQuizzes, setRecentQuizzes] = useState<QuizResult[]>([]);

  const loadDashboardData = useCallback(async () => {
    if (!user) return;

    try {
      const [progressData, quizData] = await Promise.all([
        getStudentProgress(user.id),
        getQuizResults(user.id),
      ]);

      if (progressData.data) setProgress(progressData.data);
      if (quizData.data) setRecentQuizzes(quizData.data.slice(0, 5));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  }, [user]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const totalXP = progress.reduce((sum, p) => sum + (p.xp_points || 0), 0);
  const currentLevel = Math.floor(totalXP / 100) + 1;
  const xpToNextLevel = 100 - (totalXP % 100);
  const currentStreak = Math.max(...progress.map(p => p.current_streak || 0), 0);
  const totalBadges = progress.reduce((sum, p) => sum + (p.badges?.length || 0), 0);

  const stats = [
    {
      title: t('student.currentLevel'),
      value: currentLevel,
      icon: IconTrophy,
      color: 'yellow',
      description: `${xpToNextLevel} XP to next level`,
    },
    {
      title: t('student.learningStreak'),
      value: `${currentStreak} days`,
      icon: IconFlame,
      color: 'orange',
      description: 'Keep it up!',
    },
    {
      title: t('student.topicsCompleted'),
      value: progress.length,
      icon: IconBook,
      color: 'green',
      description: 'Subjects mastered',
    },
    {
      title: t('student.totalXP'),
      value: totalXP,
      icon: IconStar,
      color: 'purple',
      description: `${totalBadges} badges earned`,
    },
  ];

  const recentActivities = [
    { topic: "Newton's Laws", type: 'Quiz Completed', score: '85%', time: '2 hours ago' },
    { topic: 'Algebra Basics', type: 'Lesson Finished', score: '92%', time: '1 day ago' },
    { topic: 'Geometry', type: 'Practice Session', score: '78%', time: '2 days ago' },
    ...recentQuizzes.map(quiz => ({
      topic: quiz.quiz_topic,
      type: 'Quiz Completed',
      score: `${Math.round((quiz.score / quiz.total_questions) * 100)}%`,
      time: new Date(quiz.completed_at).toLocaleDateString(),
    })),
  ].slice(0, 5);

  const recommendations = [
    { title: 'Review Newton\'s Third Law', reason: 'Based on quiz performance', difficulty: 'Medium' },
    { title: 'Advanced Algebra Problems', reason: 'You\'re ready for the next level!', difficulty: 'Hard' },
    { title: 'Physics Experiments', reason: 'Visual learning style detected', difficulty: 'Easy' },
  ];

  return (
    <Container size="xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Welcome Section */}
        <Paper
          p="xl"
          mb="xl"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
          }}
        >
          <Group justify="space-between">
            <div>
              <Title order={2} mb="xs">
                {t('student.welcomeBack', { name: user?.name })}
              </Title>
              <Text size="lg" opacity={0.9}>
                {t('student.readyToLearn')}
              </Text>
            </div>
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              style={{ fontSize: '3rem' }}
            >
              🎓
            </motion.div>
          </Group>
        </Paper>

        {/* Stats Grid */}
        <Grid mb="xl">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Grid.Col key={stat.title} span={{ base: 12, sm: 6, lg: 3 }}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Group justify="space-between" mb="xs">
                      <Text size="sm" c="dimmed" fw={500}>
                        {stat.title}
                      </Text>
                      <ThemeIcon color={stat.color} variant="light" size="lg">
                        <Icon size={20} />
                      </ThemeIcon>
                    </Group>
                    <Text size="xl" fw={700} mb="xs">
                      {stat.value}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {stat.description}
                    </Text>
                  </Card>
                </motion.div>
              </Grid.Col>
            );
          })}
        </Grid>

        <Grid>
          {/* Recent Activities */}
          <Grid.Col span={{ base: 12, lg: 6 }}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
                <Group justify="space-between" mb="md">
                  <Title order={4}>{t('student.recentActivities')}</Title>
                  <IconClock size={20} color="gray" />
                </Group>
                <Stack gap="sm">
                  {recentActivities.map((activity, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                    >
                      <Paper p="sm" withBorder>
                        <Group justify="space-between">
                          <div>
                            <Text fw={500} size="sm">
                              {activity.topic}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {activity.type}
                            </Text>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <Badge color="indigo" variant="light">
                              {activity.score}
                            </Badge>
                            <Text size="xs" c="dimmed">
                              {activity.time}
                            </Text>
                          </div>
                        </Group>
                      </Paper>
                    </motion.div>
                  ))}
                </Stack>
              </Card>
            </motion.div>
          </Grid.Col>

          {/* AI Recommendations */}
          <Grid.Col span={{ base: 12, lg: 6 }}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
                <Group justify="space-between" mb="md">
                  <Title order={4}>{t('student.aiRecommendations')}</Title>
                  <IconBrain size={20} color="indigo" />
                </Group>
                <Stack gap="sm">
                  {recommendations.map((rec, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                    >
                      <Paper p="sm" withBorder style={{ cursor: 'pointer' }}>
                        <Group justify="space-between" align="flex-start">
                          <div style={{ flex: 1 }}>
                            <Text fw={500} size="sm">
                              {rec.title}
                            </Text>
                            <Text size="xs" c="dimmed" mt={4}>
                              {rec.reason}
                            </Text>
                          </div>
                          <Badge
                            color={
                              rec.difficulty === 'Easy' ? 'green' :
                              rec.difficulty === 'Medium' ? 'yellow' : 'red'
                            }
                            variant="light"
                            size="sm"
                          >
                            {rec.difficulty}
                          </Badge>
                        </Group>
                      </Paper>
                    </motion.div>
                  ))}
                </Stack>
              </Card>
            </motion.div>
          </Grid.Col>
        </Grid>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card shadow="sm" padding="lg" radius="md" withBorder mt="xl">
            <Title order={4} mb="md">
              {t('student.quickActions')}
            </Title>
            <Grid>
              <Grid.Col span={{ base: 12, sm: 4 }}>
                <Paper
                  p="md"
                  withBorder
                  style={{
                    cursor: 'pointer',
                    background: 'linear-gradient(135deg, #667eea20, #764ba220)',
                  }}
                >
                  <Group>
                    <ThemeIcon color="indigo" variant="light" size="lg">
                      <IconBrain size={20} />
                    </ThemeIcon>
                    <div>
                      <Text fw={500}>{t('student.askAITutor')}</Text>
                      <Text size="xs" c="dimmed">Get instant help</Text>
                    </div>
                  </Group>
                </Paper>
              </Grid.Col>
              
              <Grid.Col span={{ base: 12, sm: 4 }}>
                <Paper
                  p="md"
                  withBorder
                  style={{
                    cursor: 'pointer',
                    background: 'linear-gradient(135deg, #10b98120, #059f6920)',
                  }}
                >
                  <Group>
                    <ThemeIcon color="green" variant="light" size="lg">
                      <IconTarget size={20} />
                    </ThemeIcon>
                    <div>
                      <Text fw={500}>{t('student.takeQuiz')}</Text>
                      <Text size="xs" c="dimmed">Test your knowledge</Text>
                    </div>
                  </Group>
                </Paper>
              </Grid.Col>
              
              <Grid.Col span={{ base: 12, sm: 4 }}>
                <Paper
                  p="md"
                  withBorder
                  style={{
                    cursor: 'pointer',
                    background: 'linear-gradient(135deg, #f59e0b20, #d9770020)',
                  }}
                >
                  <Group>
                    <ThemeIcon color="orange" variant="light" size="lg">
                      <IconTrendingUp size={20} />
                    </ThemeIcon>
                    <div>
                      <Text fw={500}>{t('student.viewProgress')}</Text>
                      <Text size="xs" c="dimmed">Track improvement</Text>
                    </div>
                  </Group>
                </Paper>
              </Grid.Col>
            </Grid>
          </Card>
        </motion.div>
      </motion.div>
    </Container>
  );
};