import { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Title,
  Text,
  Group,
  Stack,
  Progress,
  Card,
  Grid,
  ThemeIcon,
  Badge,
  RingProgress,
  Center,
  Timeline,
} from '@mantine/core';
import {
  IconTrophy,
  IconFlame,
  IconBook,
  IconStar,
  IconTarget,
  IconTrendingUp,
  IconCalendar,
  IconAward,
} from '@tabler/icons-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { motion } from 'framer-motion';
import { getStudentProgress, getQuizResults } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';

export const ProgressTracker: React.FC = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<ProgressData[]>([]);
  const [quizHistory, setQuizHistory] = useState<QuizResult[]>([]);

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

  useEffect(() => {
    loadProgressData();
  }, [user]);

  const loadProgressData = async () => {
    if (!user) return;

    try {
      const [progressData, quizData] = await Promise.all([
        getStudentProgress(user.id),
        getQuizResults(user.id),
      ]);

      if (progressData.data) setProgress(progressData.data as ProgressData[]);
      if (quizData.data) setQuizHistory(quizData.data);
    } catch (error) {
      console.error('Error loading progress data:', error);
    }
  };

  // Calculate stats
  const totalXP = progress.reduce((sum, p) => sum + (p.xp_points || 0), 0);
  const currentLevel = Math.floor(totalXP / 100) + 1;
  const xpToNextLevel = 100 - (totalXP % 100);
  const levelProgress = ((totalXP % 100) / 100) * 100;
  const currentStreak = Math.max(...progress.map(p => p.current_streak || 0), 0);
  const totalBadges = progress.reduce((sum, p) => sum + (p.badges?.length || 0), 0);

  // Mock data for charts
  const performanceData = [
    { name: 'Week 1', score: 65 },
    { name: 'Week 2', score: 72 },
    { name: 'Week 3', score: 78 },
    { name: 'Week 4', score: 85 },
    { name: 'Week 5', score: 88 },
    { name: 'Week 6', score: 92 },
  ];

  const subjectData = [
    { subject: 'Physics', score: 85 },
    { subject: 'Math', score: 92 },
    { subject: 'Chemistry', score: 78 },
    { subject: 'Biology', score: 88 },
  ];

  const achievements = [
    { title: 'First Quiz Master', description: 'Completed your first quiz with 90%+', date: '2024-01-15', icon: IconTarget },
    { title: 'Week Warrior', description: 'Maintained a 7-day learning streak', date: '2024-01-20', icon: IconFlame },
    { title: 'Physics Pro', description: 'Mastered Newton\'s Laws', date: '2024-01-25', icon: IconBook },
    { title: 'Rising Star', description: 'Reached Level 5', date: '2024-01-30', icon: IconStar },
  ];

  return (
    <Container size="xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Title order={2} mb="xl" ta="center">
          Your Learning Progress
        </Title>

        {/* Level Progress */}
        <Paper shadow="sm" p="xl" radius="md" withBorder mb="xl">
          <Grid>
            <Grid.Col span={{ base: 12, md: 8 }}>
              <Stack gap="md">
                <Group justify="space-between">
                  <div>
                    <Title order={3}>Level {currentLevel}</Title>
                    <Text c="dimmed">
                      {xpToNextLevel} XP to Level {currentLevel + 1}
                    </Text>
                  </div>
                  <Badge size="lg" variant="gradient" gradient={{ from: 'indigo', to: 'purple' }}>
                    {totalXP} XP
                  </Badge>
                </Group>
                <Progress value={levelProgress} size="xl" color="indigo" />
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Center h="100%">
                <RingProgress
                  size={120}
                  thickness={12}
                  sections={[{ value: levelProgress, color: 'indigo' }]}
                  label={
                    <Center>
                      <ThemeIcon size="xl" color="indigo" variant="light">
                        <IconTrophy size={24} />
                      </ThemeIcon>
                    </Center>
                  }
                />
              </Center>
            </Grid.Col>
          </Grid>
        </Paper>

        {/* Stats Cards */}
        <Grid mb="xl">
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Group justify="space-between">
                  <div>
                    <Text size="sm" c="dimmed" fw={500}>
                      Current Streak
                    </Text>
                    <Text size="xl" fw={700}>
                      {currentStreak} days
                    </Text>
                  </div>
                  <ThemeIcon color="orange" variant="light" size="lg">
                    <IconFlame size={20} />
                  </ThemeIcon>
                </Group>
              </Card>
            </motion.div>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Group justify="space-between">
                  <div>
                    <Text size="sm" c="dimmed" fw={500}>
                      Quizzes Completed
                    </Text>
                    <Text size="xl" fw={700}>
                      {quizHistory.length}
                    </Text>
                  </div>
                  <ThemeIcon color="green" variant="light" size="lg">
                    <IconTarget size={20} />
                  </ThemeIcon>
                </Group>
              </Card>
            </motion.div>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Group justify="space-between">
                  <div>
                    <Text size="sm" c="dimmed" fw={500}>
                      Badges Earned
                    </Text>
                    <Text size="xl" fw={700}>
                      {totalBadges}
                    </Text>
                  </div>
                  <ThemeIcon color="purple" variant="light" size="lg">
                    <IconAward size={20} />
                  </ThemeIcon>
                </Group>
              </Card>
            </motion.div>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Group justify="space-between">
                  <div>
                    <Text size="sm" c="dimmed" fw={500}>
                      Avg. Score
                    </Text>
                    <Text size="xl" fw={700}>
                      87%
                    </Text>
                  </div>
                  <ThemeIcon color="blue" variant="light" size="lg">
                    <IconTrendingUp size={20} />
                  </ThemeIcon>
                </Group>
              </Card>
            </motion.div>
          </Grid.Col>
        </Grid>

        <Grid>
          {/* Performance Chart */}
          <Grid.Col span={{ base: 12, lg: 8 }}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card shadow="sm" padding="lg" radius="md" withBorder h="400px">
                <Title order={4} mb="md">
                  Performance Over Time
                </Title>
                <ResponsiveContainer width="100%" height="90%">
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="var(--mantine-color-indigo-6)" 
                      strokeWidth={3}
                      dot={{ fill: 'var(--mantine-color-indigo-6)', strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </motion.div>
          </Grid.Col>

          {/* Subject Performance */}
          <Grid.Col span={{ base: 12, lg: 4 }}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card shadow="sm" padding="lg" radius="md" withBorder h="400px">
                <Title order={4} mb="md">
                  Subject Performance
                </Title>
                <ResponsiveContainer width="100%" height="90%">
                  <BarChart data={subjectData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="subject" type="category" width={80} />
                    <Tooltip />
                    <Bar dataKey="score" fill="var(--mantine-color-indigo-6)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </motion.div>
          </Grid.Col>
        </Grid>

        {/* Achievements Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card shadow="sm" padding="lg" radius="md" withBorder mt="xl">
            <Title order={4} mb="md">
              Recent Achievements
            </Title>
            <Timeline active={achievements.length - 1} bulletSize={24} lineWidth={2}>
              {achievements.map((achievement, index) => {
                const Icon = achievement.icon;
                return (
                  <Timeline.Item
                    key={index}
                    bullet={
                      <ThemeIcon size="sm" color="indigo" variant="light">
                        <Icon size={12} />
                      </ThemeIcon>
                    }
                    title={achievement.title}
                  >
                    <Text c="dimmed" size="sm">
                      {achievement.description}
                    </Text>
                    <Text size="xs" c="dimmed" mt={4}>
                      <IconCalendar size={12} style={{ marginRight: 4 }} />
                      {new Date(achievement.date).toLocaleDateString()}
                    </Text>
                  </Timeline.Item>
                );
              })}
            </Timeline>
          </Card>
        </motion.div>
      </motion.div>
    </Container>
  );
};