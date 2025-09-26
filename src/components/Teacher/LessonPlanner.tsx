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
  Timeline,
  Center,
} from '@mantine/core';

import {
  IconFileText,
  IconClock,
  IconUsers,
  IconTarget,
  IconBook,
  IconDownload,
  IconShare,
  IconPlus,
  IconWand,
  IconCheck,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';

import { aiService, LessonPlan } from '../../services/aiService';
import { notifications } from '@mantine/notifications';

import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const LessonPlanner: React.FC = () => {
  const { t } = useTranslation();
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<LessonPlan | null>(null);

  const [formValues, setFormValues] = useState({
    topic: '',
    subject: 'Physics',
    grade: '10',
    duration: 45,
  });

  const subjects = ['Physics', 'Mathematics', 'Chemistry', 'Biology', 'History', 'Literature'];
  const grades = ['6', '7', '8', '9', '10', '11', '12'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateLessonPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValues.topic.trim()) {
      notifications.show({
        title: 'Error',
        message: 'Topic is required',
        color: 'red',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const plan = await aiService.generateLessonPlan(
        formValues.topic,
        formValues.grade,
        formValues.duration,
        formValues.subject
      );
      
      setLessonPlans(prev => [plan, ...prev]);
      setSelectedPlan(plan);
      setShowGenerator(false);
      setFormValues({
        topic: '',
        subject: 'Physics',
        grade: '10',
        duration: 45,
      });
      
      notifications.show({
        title: 'Success',
        message: 'Lesson plan generated successfully!',
        color: 'green',
      });
    } catch {
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

  const exportPDF = (plan: LessonPlan) => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(plan.title, 14, 22);

    doc.setFontSize(12);
    doc.text(`Subject: ${plan.subject}`, 14, 32);
    doc.text(`Grade: ${plan.grade}`, 14, 38);
    doc.text(`Duration: ${plan.duration} minutes`, 14, 44);
    doc.text(`Created: ${plan.createdAt.toLocaleDateString()}`, 14, 50);

    doc.text('Learning Objectives:', 14, 60);
    plan.objectives.forEach((obj, index) => {
      doc.text(`${index + 1}. ${obj}`, 20, 66 + index * 6);
    });

    doc.text('Materials:', 14, 66 + plan.objectives.length * 6 + 6);
    plan.materials.forEach((mat, index) => {
      doc.text(`- ${mat}`, 20, 72 + plan.objectives.length * 6 + index * 6);
    });

    doc.text('Activities:', 14, 78 + plan.objectives.length * 6 + plan.materials.length * 6);
    plan.activities.forEach((act, index) => {
      doc.text(
        `${index + 1}. ${act.name} (${act.duration} min) - ${act.type}`,
        20,
        84 + plan.objectives.length * 6 + plan.materials.length * 6 + index * 6
      );
      doc.text(`   ${act.description}`, 25, 90 + plan.objectives.length * 6 + plan.materials.length * 6 + index * 6);
    });

    doc.text('Assessment:', 14, 96 + plan.objectives.length * 6 + plan.materials.length * 6 + plan.activities.length * 6);
    doc.text(plan.assessment, 20, 102 + plan.objectives.length * 6 + plan.materials.length * 6 + plan.activities.length * 6);

    doc.save(`${plan.title}.pdf`);
  };

  const sharePlan = (plan: LessonPlan) => {
    if (navigator.share) {
      navigator.share({
        title: plan.title,
        text: `Check out this lesson plan on ${plan.subject} for grade ${plan.grade}.`,
        url: window.location.href,
      }).catch(() => {
        notifications.show({
          title: 'Error',
          message: 'Failed to share the lesson plan.',
          color: 'red',
        });
      });
    } else {
      notifications.show({
        title: 'Not Supported',
        message: 'Sharing is not supported on this browser.',
        color: 'yellow',
      });
    }
  };

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
            <Button variant="outline" leftSection={<IconShare size={16} />} onClick={() => sharePlan(selectedPlan)}>
              Share
            </Button>
            <Button leftSection={<IconDownload size={16} />} onClick={() => exportPDF(selectedPlan)}>
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
        <div>
          <Title order={2}>{t('lessonPlanner.title')}</Title>
          <Text c="dimmed" size="lg" mb="md">
            {t('lessonPlanner.subtitle')}
          </Text>

          <Button
            onClick={() => setShowGenerator(true)}
            leftSection={<IconPlus size={16} />}
            variant="filled"
            color="blue"
            type="button"
            style={{ backgroundColor: 'var(--mantine-color-blue-6)', color: 'white' }}
          >
            {t('lessonPlanner.createNew')}
          </Button>
        </div>

        {/* Custom Generator Modal */}
        {showGenerator && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '1rem'
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowGenerator(false);
            }}
          >
            <div 
              style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '2rem',
                maxWidth: '500px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e0e0e0', paddingBottom: '1rem' }}>
                <IconWand size={24} style={{ marginRight: '0.5rem', color: '#1976d2' }} />
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600, color: '#1976d2' }}>
                  {t('lessonPlanner.generatePlan')}
                </h2>
              </div>

              <form onSubmit={generateLessonPlan} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#333' }}>
                    {t('lessonPlanner.topic')}
                  </label>
                  <input
                    type="text"
                    name="topic"
                    placeholder="e.g., Newton's Laws of Motion"
                    value={formValues.topic}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d0d0d0',
                      borderRadius: '4px',
                      fontSize: '1rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#333' }}>
                      {t('lessonPlanner.subject')}
                    </label>
                    <select
                      name="subject"
                      value={formValues.subject}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d0d0d0',
                        borderRadius: '4px',
                        fontSize: '1rem',
                        backgroundColor: 'white'
                      }}
                    >
                      {subjects.map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#333' }}>
                      {t('lessonPlanner.grade')}
                    </label>
                    <select
                      name="grade"
                      value={formValues.grade}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d0d0d0',
                        borderRadius: '4px',
                        fontSize: '1rem',
                        backgroundColor: 'white'
                      }}
                    >
                      {grades.map(g => (
                        <option key={g} value={g}>Grade {g}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#333' }}>
                    {t('lessonPlanner.duration')} (minutes)
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={formValues.duration}
                    onChange={handleInputChange}
                    min="15"
                    max="120"
                    step="15"
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d0d0d0',
                      borderRadius: '4px',
                      fontSize: '1rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                  <Button
                    variant="outline"
                    onClick={() => setShowGenerator(false)}
                    style={{ padding: '0.75rem 1.5rem' }}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button
                    type="submit"
                    disabled={isGenerating}
                    leftSection={<IconWand size={16} />}
                    style={{ 
                      padding: '0.75rem 1.5rem', 
                      backgroundColor: isGenerating ? '#ccc' : '#1976d2',
                      color: 'white'
                    }}
                  >
                    {isGenerating ? 'Generating...' : t('lessonPlanner.generatePlan')}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

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
