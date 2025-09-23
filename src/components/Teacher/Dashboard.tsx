import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Paper,
  Title,
  Text,
  Group,
  Stack,
  Card,
  Grid,
  ThemeIcon,
  Badge,
  Progress,
  Timeline,
} from '@mantine/core';
import {
  IconUsers,
  IconBook,
  IconTrendingUp,
  IconClock,
  IconFileText,
  IconCheck,
  IconAlertCircle,
  IconChartBar,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

export const TeacherDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const stats = [
    {
      title: t('teacher.totalStudents'),
      value: 156,
      icon: IconUsers,
      color: 'blue',
      change: '+12 this month',
    },
    {
      title: t('teacher.activeClasses'),
      value: 8,
      icon: IconBook,
      color: 'green',
      change: '2 new classes',
    },
    {
      title: t('teacher.avgPerformance'),
      value: '87%',
      icon: IconTrendingUp,
      color: 'purple',
      change: '+5% from last week',
    },
    {
      title: t('teacher.hoursTaught'),
      value: 342,
      icon: IconClock,
      color: 'orange',
      change: '28 hours this week',
    },
  ];

  const recentActivities = [
    {
      type: 'lesson_created',
      title: 'Created lesson plan for "Newton\'s Laws"',
      time: '2 hours ago',
      icon: IconFileText,
      color: 'green',
    },
    {
      type: 'quiz_graded',
      title: 'Auto-graded 25 physics quizzes',
      time: '4 hours ago',
      icon: IconCheck,
      color: 'blue',
    },
    {
      type: 'student_help',
      title: 'Sarah Johnson requested help with calculus',
      time: '6 hours ago',
      icon: IconAlertCircle,
      color: 'yellow',
    },
    {
      type: 'performance_review',
      title: 'Weekly performance report generated',
      time: '1 day ago',
      icon: IconChartBar,
      color: 'purple',
    },
  ];

  const upcomingClasses = [
    { subject: 'Physics', grade: '11th', time: '9:00 AM', students: 28, room: 'Lab 1' },
    { subject: 'Mathematics', grade: '10th', time: '11:00 AM', students: 32, room: 'Room 205' },
    { subject: 'Physics', grade: '12th', time: '2:00 PM', students: 24, room: 'Lab 2' },
  ];

  const performanceAlerts = [
    { student: 'Alex Chen', subject: 'Physics', issue: 'Struggling with momentum concepts', severity: 'medium' },
    { student: 'Maria Garcia', subject: 'Math', issue: 'Excellent progress in calculus', severity: 'positive' },
    { student: 'John Smith', subject: 'Physics', issue: 'Missing assignments', severity: 'high' },
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
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            color: 'white',
          }}
        >
          <Group justify="space-between">
            <div>
              <Title order={2} mb="xs">
                {t('teacher.welcomeBack', { name: user?.name })}
              </Title>
              <Text size="lg" opacity={0.9}>
                {t('teacher.readyToInspire')}
              </Text>
            </div>
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              style={{ fontSize: '3rem' }}
            >
              📚
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
                      <div>
                        <Text size="sm" c="dimmed" fw={500}>
                          {stat.title}
                        </Text>
                        <Text size="xl" fw={700} mt="xs">
                          {stat.value}
                        </Text>
                        <Text size="xs" c="dimmed" mt="xs">
                          {stat.change}
                        </Text>
                      </div>
                      <ThemeIcon color={stat.color} variant="light" size="lg">
                        <Icon size={20} />
                      </ThemeIcon>
                    </Group>
                  </Card>
                </motion.div>
              </Grid.Col>
            );
          })}
        </Grid>

        <Grid>
          {/* Today's Schedule */}
          <Grid.Col span={{ base: 12, lg: 6 }}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
                <Group justify="space-between" mb="md">
                  <Title order={4}>{t('teacher.todaysSchedule')}</Title>
                  <IconClock size={20} color="gray" />
                </Group>
                <Stack gap="sm">
                  {upcomingClasses.map((class_, index) => (
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
                              {class_.subject} - Grade {class_.grade}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {class_.students} students • {class_.room}
                            </Text>
                          </div>
                          <Badge color="blue" variant="light">
                            {class_.time}
                          </Badge>
                        </Group>
                      </Paper>
                    </motion.div>
                  ))}
                </Stack>
              </Card>
            </motion.div>
          </Grid.Col>

          {/* Recent Activities */}
          <Grid.Col span={{ base: 12, lg: 6 }}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
                <Group justify="space-between" mb="md">
                  <Title order={4}>{t('teacher.recentActivities')}</Title>
                  <IconFileText size={20} color="blue" />
                </Group>
                <Timeline active={recentActivities.length - 1} bulletSize={20} lineWidth={2}>
                  {recentActivities.map((activity, index) => {
                    const Icon = activity.icon;
                    return (
                      <Timeline.Item
                        key={index}
                        bullet={
                          <ThemeIcon size="sm" color={activity.color} variant="light">
                            <Icon size={12} />
                          </ThemeIcon>
                        }
                        title={
                          <Text size="sm" fw={500}>
                            {activity.title}
                          </Text>
                        }
                      >
                        <Text size="xs" c="dimmed">
                          {activity.time}
                        </Text>
                      </Timeline.Item>
                    );
                  })}
                </Timeline>
              </Card>
            </motion.div>
          </Grid.Col>
        </Grid>

        {/* Performance Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card shadow="sm" padding="lg" radius="md" withBorder mt="xl">
            <Group justify="space-between" mb="md">
              <Title order={4}>{t('teacher.performanceAlerts')}</Title>
              <IconAlertCircle size={20} color="orange" />
            </Group>
            <Grid>
              {performanceAlerts.map((alert, index) => (
                <Grid.Col key={index} span={{ base: 12, md: 4 }}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                  >
                    <Paper
                      p="md"
                      withBorder
                      style={{
                        borderLeftWidth: 4,
                        borderLeftColor:
                          alert.severity === 'high' ? 'var(--mantine-color-red-6)' :
                          alert.severity === 'medium' ? 'var(--mantine-color-yellow-6)' :
                          'var(--mantine-color-green-6)',
                      }}
                    >
                      <Text fw={500} size="sm" mb="xs">
                        {alert.student}
                      </Text>
                      <Text size="xs" c="dimmed" mb="sm">
                        {alert.subject}
                      </Text>
                      <Text size="sm">
                        {alert.issue}
                      </Text>
                    </Paper>
                  </motion.div>
                </Grid.Col>
              ))}
            </Grid>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card shadow="sm" padding="lg" radius="md" withBorder mt="xl">
            <Title order={4} mb="md">
              Quick Actions
            </Title>
            <Grid>
              <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
                <Paper
                  p="md"
                  withBorder
                  style={{
                    cursor: 'pointer',
                    background: 'linear-gradient(135deg, #3b82f620, #1d4ed820)',
                  }}
                >
                  <Group>
                    <ThemeIcon color="blue" variant="light" size="lg">
                      <IconFileText size={20} />
                    </ThemeIcon>
                    <div>
                      <Text fw={500}>{t('teacher.createLesson')}</Text>
                      <Text size="xs" c="dimmed">AI-powered plans</Text>
                    </div>
                  </Group>
                </Paper>
              </Grid.Col>
              
              <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
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
                      <IconCheck size={20} />
                    </ThemeIcon>
                    <div>
                      <Text fw={500}>{t('teacher.gradeAssignments')}</Text>
                      <Text size="xs" c="dimmed">Auto-grading</Text>
                    </div>
                  </Group>
                </Paper>
              </Grid.Col>
              
              <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
                <Paper
                  p="md"
                  withBorder
                  style={{
                    cursor: 'pointer',
                    background: 'linear-gradient(135deg, #8b5cf620, #7c3aed20)',
                  }}
                >
                  <Group>
                    <ThemeIcon color="purple" variant="light" size="lg">
                      <IconChartBar size={20} />
                    </ThemeIcon>
                    <div>
                      <Text fw={500}>{t('teacher.viewAnalytics')}</Text>
                      <Text size="xs" c="dimmed">Class insights</Text>
                    </div>
                  </Group>
                </Paper>
              </Grid.Col>
              
              <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
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
                      <IconUsers size={20} />
                    </ThemeIcon>
                    <div>
                      <Text fw={500}>{t('teacher.manageStudents')}</Text>
                      <Text size="xs" c="dimmed">Class roster</Text>
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