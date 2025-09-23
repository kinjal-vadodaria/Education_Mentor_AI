import React from 'react';
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
  Progress,
  Table,
  Badge,
  Select,
} from '@mantine/core';
import {
  IconChartBar,
  IconTrendingUp,
  IconTrendingDown,
  IconUsers,
  IconTarget,
  IconClock,
  IconAward,
} from '@tabler/icons-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';

export const Analytics: React.FC = () => {
  const { t } = useTranslation();

  // Mock data for charts
  const performanceData = [
    { month: 'Jan', average: 78, physics: 82, math: 75, chemistry: 77 },
    { month: 'Feb', average: 82, physics: 85, math: 79, chemistry: 82 },
    { month: 'Mar', average: 85, physics: 88, math: 82, chemistry: 85 },
    { month: 'Apr', average: 87, physics: 90, math: 84, chemistry: 87 },
    { month: 'May', average: 89, physics: 92, math: 86, chemistry: 89 },
    { month: 'Jun', average: 91, physics: 94, math: 88, chemistry: 91 },
  ];

  const subjectDistribution = [
    { name: 'Physics', value: 35, color: '#3b82f6' },
    { name: 'Mathematics', value: 30, color: '#10b981' },
    { name: 'Chemistry', value: 25, color: '#f59e0b' },
    { name: 'Biology', value: 10, color: '#ef4444' },
  ];

  const topStudents = [
    { name: 'Sarah Johnson', subject: 'Physics', score: 98, trend: 'up' },
    { name: 'Michael Chen', subject: 'Mathematics', score: 96, trend: 'up' },
    { name: 'Emma Davis', subject: 'Chemistry', score: 94, trend: 'stable' },
    { name: 'James Wilson', subject: 'Physics', score: 92, trend: 'up' },
    { name: 'Lisa Anderson', subject: 'Mathematics', score: 90, trend: 'down' },
  ];

  const classStats = [
    {
      title: 'Average Performance',
      value: '87%',
      change: '+5%',
      trend: 'up',
      icon: IconChartBar,
      color: 'blue',
    },
    {
      title: 'Active Students',
      value: '156',
      change: '+12',
      trend: 'up',
      icon: IconUsers,
      color: 'green',
    },
    {
      title: 'Completion Rate',
      value: '94%',
      change: '+2%',
      trend: 'up',
      icon: IconTarget,
      color: 'purple',
    },
    {
      title: 'Avg. Study Time',
      value: '4.2h',
      change: '+0.5h',
      trend: 'up',
      icon: IconClock,
      color: 'orange',
    },
  ];

  return (
    <Container size="xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Group justify="space-between" mb="xl">
          <div>
            <Title order={2}>Class Analytics</Title>
            <Text c="dimmed" size="lg">
              Comprehensive insights into student performance and engagement
            </Text>
          </div>
          <Select
            data={[
              { value: 'all', label: 'All Classes' },
              { value: 'physics-10', label: 'Physics - Grade 10' },
              { value: 'math-11', label: 'Mathematics - Grade 11' },
              { value: 'chemistry-12', label: 'Chemistry - Grade 12' },
            ]}
            defaultValue="all"
            w={200}
          />
        </Group>

        {/* Stats Cards */}
        <Grid mb="xl">
          {classStats.map((stat, index) => {
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
                        <Group gap="xs" mt="xs">
                          <ThemeIcon
                            size="xs"
                            color={stat.trend === 'up' ? 'green' : 'red'}
                            variant="light"
                          >
                            {stat.trend === 'up' ? (
                              <IconTrendingUp size={10} />
                            ) : (
                              <IconTrendingDown size={10} />
                            )}
                          </ThemeIcon>
                          <Text
                            size="xs"
                            c={stat.trend === 'up' ? 'green' : 'red'}
                            fw={500}
                          >
                            {stat.change}
                          </Text>
                        </Group>
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
          {/* Performance Trends */}
          <Grid.Col span={{ base: 12, lg: 8 }}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card shadow="sm" padding="lg" radius="md" withBorder h="400px">
                <Title order={4} mb="md">
                  Performance Trends
                </Title>
                <ResponsiveContainer width="100%" height="90%">
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[70, 100]} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="physics"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      name="Physics"
                    />
                    <Line
                      type="monotone"
                      dataKey="math"
                      stroke="#10b981"
                      strokeWidth={3}
                      name="Mathematics"
                    />
                    <Line
                      type="monotone"
                      dataKey="chemistry"
                      stroke="#f59e0b"
                      strokeWidth={3}
                      name="Chemistry"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </motion.div>
          </Grid.Col>

          {/* Subject Distribution */}
          <Grid.Col span={{ base: 12, lg: 4 }}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card shadow="sm" padding="lg" radius="md" withBorder h="400px">
                <Title order={4} mb="md">
                  Subject Distribution
                </Title>
                <ResponsiveContainer width="100%" height="70%">
                  <PieChart>
                    <Pie
                      data={subjectDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {subjectDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </motion.div>
          </Grid.Col>
        </Grid>

        {/* Top Performers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card shadow="sm" padding="lg" radius="md" withBorder mt="xl">
            <Group justify="space-between" mb="md">
              <Title order={4}>Top Performing Students</Title>
              <ThemeIcon color="yellow" variant="light">
                <IconAward size={20} />
              </ThemeIcon>
            </Group>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Student</Table.Th>
                  <Table.Th>Subject</Table.Th>
                  <Table.Th>Score</Table.Th>
                  <Table.Th>Trend</Table.Th>
                  <Table.Th>Progress</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {topStudents.map((student, index) => (
                  <Table.Tr key={index}>
                    <Table.Td>
                      <Text fw={500}>{student.name}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge variant="light" color="blue">
                        {student.subject}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text fw={600}>{student.score}%</Text>
                    </Table.Td>
                    <Table.Td>
                      <ThemeIcon
                        size="sm"
                        color={
                          student.trend === 'up' ? 'green' :
                          student.trend === 'down' ? 'red' : 'gray'
                        }
                        variant="light"
                      >
                        {student.trend === 'up' ? (
                          <IconTrendingUp size={14} />
                        ) : student.trend === 'down' ? (
                          <IconTrendingDown size={14} />
                        ) : (
                          <IconTarget size={14} />
                        )}
                      </ThemeIcon>
                    </Table.Td>
                    <Table.Td>
                      <Progress
                        value={student.score}
                        color={student.score >= 90 ? 'green' : student.score >= 80 ? 'blue' : 'orange'}
                        size="sm"
                        w={100}
                      />
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Card>
        </motion.div>

        {/* Weekly Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card shadow="sm" padding="lg" radius="md" withBorder mt="xl">
            <Title order={4} mb="md">
              Weekly Activity Overview
            </Title>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  { day: 'Mon', quizzes: 12, lessons: 8, assignments: 15 },
                  { day: 'Tue', quizzes: 15, lessons: 10, assignments: 18 },
                  { day: 'Wed', quizzes: 18, lessons: 12, assignments: 20 },
                  { day: 'Thu', quizzes: 14, lessons: 9, assignments: 16 },
                  { day: 'Fri', quizzes: 20, lessons: 15, assignments: 25 },
                  { day: 'Sat', quizzes: 8, lessons: 5, assignments: 10 },
                  { day: 'Sun', quizzes: 5, lessons: 3, assignments: 7 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quizzes" fill="#3b82f6" name="Quizzes" />
                <Bar dataKey="lessons" fill="#10b981" name="Lessons" />
                <Bar dataKey="assignments" fill="#f59e0b" name="Assignments" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      </motion.div>
    </Container>
  );
};