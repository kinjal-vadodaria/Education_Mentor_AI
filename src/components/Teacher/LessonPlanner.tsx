import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Paper,
  Title,
  Text,
  Button,
  Group,
  Stack,
  Card,
  Grid,
  ThemeIcon,
  Badge,
  Modal,
  TextInput,
  Select,
  NumberInput,
  Timeline,
  Loader,
  Center,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import {
  IconFileText,
  IconClock,
  IconUsers,
  IconTarget,
  IconBook,
  IconDownload,
  IconShare,
  IconEdit,
  IconPlus,
  IconWand,
  IconCheck,
} from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { aiService, LessonPlan } from '../../services/aiService';
import { notifications } from '@mantine/notifications';

export const LessonPlanner: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<LessonPlan | null>(null);

  const form = useForm({
    initialValues: {
      topic: '',
      subject: 'Physics',
      grade: '10',
      duration: 45,
    },
    validate: {
      topic: (value) => (!value ? 'Topic is required' : null),
    },
  });

  const subjects = ['Physics', 'Mathematics', 'Chemistry', 'Biology', 'History', 'Literature'];
  const grades = ['6', '7', '8', '9', '10', '11', '12'];

  const generateLessonPlan = async (values: typeof form.values) => {
    setIsGenerating(true);
    try {
      const plan = await aiService.generateLessonPlan(
        values.topic,
        values.grade,
        values.duration,
        values.subject
      );
      
      setLessonPlans(prev => [plan, ...prev]);
      setSelectedPlan(plan);
      setShowGenerator(false);
      form.reset();
      
      notifications.show({
        title: 'Success',
        message: 'Lesson plan generated successfully!',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to generate lesson plan. Please try again.',
        color: 'red',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Sample lesson plans for demo
  const samplePlans: LessonPlan[] = [
    {
      id: '1',
      title: "Newton's Laws of Motion - Grade 10",
      subject: 'Physics',
      grade: '10',
      duration: 45,
      objectives: [
        'Students will understand the three laws of motion',
        'Students will apply Newton\'s laws to real-world scenarios',
        'Students will solve basic physics problems',
      ],
      materials: ['Whiteboard', 'Toy cars', 'Ramps', 'Balls', 'Video clips'],
      activities: [
        {
          id: '1',
          name: 'Introduction Hook',
          description: 'Demonstrate with toy cars and ramps',
          duration: 10,
          type: 'presentation',
        },
        {
          id: '2',
          name: 'Concept Explanation',
          description: 'Explain each law with examples',
          duration: 20,
          type: 'presentation',
        },
        {
          id: '3',
          name: 'Hands-on Activity',
          description: 'Students experiment with objects',
          duration: 10,
          type: 'hands-on',
        },
        {
          id: '4',
          name: 'Wrap-up Discussion',
          description: 'Review and Q&A',
          duration: 5,
          type: 'discussion',
        },
      ],
      assessment: 'Exit ticket with 3 questions about Newton\'s laws',
      createdAt: new Date(),
    },
  ];

  const allPlans = [...lessonPlans, ...samplePlans];

  if (selectedPlan) {
    return (
      <Container size="lg">
        {/* Header */}
        <Group justify="space-between" mb="xl">
          <Button
            variant="outline"
            onClick={() => setSelectedPlan(null)}
            leftSection={<IconFileText size={16} />}
          >
            ← Back to Plans
          </Button>
          
          <Group>
            <Button variant="outline" leftSection={<IconEdit size={16} />}>
              Edit
            </Button>
            <Button variant="outline" leftSection={<IconShare size={16} />}>
              Share
            </Button>
            <Button leftSection={<IconDownload size={16} />}>
              Export PDF
            </Button>
          </Group>
        </Group>

        {/* Lesson Plan Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Title Section */}
          <Paper shadow="sm" p="xl" radius="md" withBorder>
            <Group justify="space-between" align="flex-start">
              <div>
                <Title order={2} mb="sm">
                  {selectedPlan.title}
                </Title>
                <Group gap="md">
                  <Group gap="xs">
                    <IconBook size={16} />
                    <Text size="sm" c="dimmed">{selectedPlan.subject}</Text>
                  </Group>
                  <Group gap="xs">
                    <IconUsers size={16} />
                    <Text size="sm" c="dimmed">Grade {selectedPlan.grade}</Text>
                  </Group>
                  <Group gap="xs">
                    <IconClock size={16} />
                    <Text size="sm" c="dimmed">{selectedPlan.duration} minutes</Text>
                  </Group>
                </Group>
              </div>
              <Text size="sm" c="dimmed">
                Created {selectedPlan.createdAt.toLocaleDateString()}
              </Text>
            </Group>
          </Paper>

          {/* Learning Objectives */}
          <Paper shadow="sm" p="lg" radius="md" withBorder>
            <Group mb="md">
              <ThemeIcon color="blue" variant="light">
                <IconTarget size={20} />
              </ThemeIcon>
              <Title order={4}>Learning Objectives</Title>
            </Group>
            <Stack gap="sm">
              {selectedPlan.objectives.map((objective, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Group gap="sm">
                    <IconCheck size={16} color="var(--mantine-color-green-6)" />
                    <Text>{objective}</Text>
                  </Group>
                </motion.div>
              ))}
            </Stack>
          </Paper>

          {/* Materials */}
          <Paper shadow="sm" p="lg" radius="md" withBorder>
            <Title order={4} mb="md">
              Required Materials
            </Title>
            <Group gap="xs">
              {selectedPlan.materials.map((material, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Badge variant="light" color="blue">
                    {material}
                  </Badge>
                </motion.div>
              ))}
            </Group>
          </Paper>

          {/* Activities Timeline */}
          <Paper shadow="sm" p="lg" radius="md" withBorder>
            <Title order={4} mb="md">
              Lesson Activities
            </Title>
            <Timeline active={selectedPlan.activities.length - 1} bulletSize={24} lineWidth={2}>
              {selectedPlan.activities.map((activity, index) => (
                <Timeline.Item
                  key={activity.id}
                  bullet={
                    <ThemeIcon
                      size="sm"
                      color={
                        activity.type === 'presentation' ? 'blue' :
                        activity.type === 'hands-on' ? 'green' :
                        activity.type === 'discussion' ? 'purple' : 'orange'
                      }
                      variant="light"
                    >
                      {index + 1}
                    </ThemeIcon>
                  }
                  title={
                    <Group justify="space-between">
                      <Text fw={500}>{activity.name}</Text>
                      <Badge size="sm" variant="light">
                        {activity.duration} min
                      </Badge>
                    </Group>
                  }
                >
                  <Text size="sm" c="dimmed" mb="xs">
                    {activity.description}
                  </Text>
                  <Badge
                    size="xs"
                    color={
                      activity.type === 'presentation' ? 'blue' :
                      activity.type === 'hands-on' ? 'green' :
                      activity.type === 'discussion' ? 'purple' : 'orange'
                    }
                    variant="light"
                  >
                    {activity.type}
                  </Badge>
                </Timeline.Item>
              ))}
            </Timeline>
          </Paper>

          {/* Assessment */}
          <Paper shadow="sm" p="lg" radius="md" withBorder>
            <Title order={4} mb="md">
              Assessment Strategy
            </Title>
            <Paper p="md" withBorder style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
              <Text>{selectedPlan.assessment}</Text>
            </Paper>
          </Paper>
        </motion.div>
      </Container>
    );
  }

  return (
    <Container size="xl">
      <Stack gap="xl">
        {/* Header */}
        <Group justify="space-between">
          <div>
            <Title order={2}>{t('lessonPlanner.title')}</Title>
            <Text c="dimmed" size="lg">
              {t('lessonPlanner.subtitle')}
            </Text>
          </div>
          
          <Button
            onClick={() => setShowGenerator(true)}
            leftSection={<IconPlus size={16} />}
            variant="gradient"
            gradient={{ from: 'blue', to: 'cyan' }}
          >
            {t('lessonPlanner.createNew')}
          </Button>
        </Group>

        {/* Generator Modal */}
        <Modal
          opened={showGenerator}
          onClose={() => setShowGenerator(false)}
          title={
            <Group>
              <IconWand size={20} />
              <Text fw={600}>{t('lessonPlanner.generatePlan')}</Text>
            </Group>
          }
          size="md"
        >
          <form onSubmit={form.onSubmit(generateLessonPlan)}>
            <Stack gap="md">
              <TextInput
                label={t('lessonPlanner.topic')}
                placeholder="e.g., Newton's Laws of Motion"
                {...form.getInputProps('topic')}
              />

              <Grid>
                <Grid.Col span={6}>
                  <Select
                    label={t('lessonPlanner.subject')}
                    data={subjects}
                    {...form.getInputProps('subject')}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <Select
                    label={t('lessonPlanner.grade')}
                    data={grades.map(g => ({ value: g, label: `Grade ${g}` }))}
                    {...form.getInputProps('grade')}
                  />
                </Grid.Col>
              </Grid>

              <NumberInput
                label={t('lessonPlanner.duration')}
                min={15}
                max={120}
                step={15}
                {...form.getInputProps('duration')}
              />

              <Group justify="flex-end" mt="md">
                <Button variant="outline" onClick={() => setShowGenerator(false)}>
                  {t('common.cancel')}
                </Button>
                <Button
                  type="submit"
                  loading={isGenerating}
                  leftSection={<IconWand size={16} />}
                >
                  {isGenerating ? 'Generating...' : t('lessonPlanner.generatePlan')}
                </Button>
              </Group>
            </Stack>
          </form>
        </Modal>

        {/* Lesson Plans Grid */}
        {allPlans.length > 0 ? (
          <Grid>
            {allPlans.map((plan, index) => (
              <Grid.Col key={plan.id} span={{ base: 12, md: 6, lg: 4 }}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    shadow="sm"
                    padding="lg"
                    radius="md"
                    withBorder
                    style={{ cursor: 'pointer', height: '100%' }}
                    onClick={() => setSelectedPlan(plan)}
                  >
                    <Stack gap="md">
                      <Group justify="space-between" align="flex-start">
                        <ThemeIcon color="blue" variant="light" size="lg">
                          <IconFileText size={20} />
                        </ThemeIcon>
                        <Text size="xs" c="dimmed">
                          {plan.createdAt.toLocaleDateString()}
                        </Text>
                      </Group>

                      <div>
                        <Title order={5} mb="xs" lineClamp={2}>
                          {plan.title}
                        </Title>
                        
                        <Group gap="md" mb="sm">
                          <Group gap="xs">
                            <IconBook size={14} />
                            <Text size="xs" c="dimmed">{plan.subject}</Text>
                          </Group>
                          <Group gap="xs">
                            <IconClock size={14} />
                            <Text size="xs" c="dimmed">{plan.duration}m</Text>
                          </Group>
                        </Group>
                      </div>

                      <Stack gap="xs">
                        <Text size="sm" c="dimmed">
                          {plan.objectives.length} learning objectives
                        </Text>
                        <Text size="sm" c="dimmed">
                          {plan.activities.length} activities planned
                        </Text>
                      </Stack>

                      <Group justify="center" c="blue" style={{ opacity: 0.8 }}>
                        <IconFileText size={16} />
                        <Text size="sm" fw={500}>
                          {t('lessonPlanner.viewDetails')}
                        </Text>
                      </Group>
                    </Stack>
                  </Card>
                </motion.div>
              </Grid.Col>
            ))}
          </Grid>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Paper shadow="sm" p="xl" radius="md" withBorder>
              <Center>
                <Stack align="center" gap="md">
                  <ThemeIcon size={80} color="gray" variant="light">
                    <IconFileText size={40} />
                  </ThemeIcon>
                  <div style={{ textAlign: 'center' }}>
                    <Title order={4} mb="xs">
                      {t('lessonPlanner.noPlansYet')}
                    </Title>
                    <Text c="dimmed" mb="lg">
                      {t('lessonPlanner.createFirst')}
                    </Text>
                    <Button
                      onClick={() => setShowGenerator(true)}
                      leftSection={<IconWand size={16} />}
                      variant="gradient"
                      gradient={{ from: 'blue', to: 'cyan' }}
                    >
                      {t('lessonPlanner.generatePlan')}
                    </Button>
                  </div>
                </Stack>
              </Center>
            </Paper>
          </motion.div>
        )}
      </Stack>
    </Container>
  );
};