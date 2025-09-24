import React, { useState } from 'react';

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
  Table,
  TextInput,
  Select,
  Avatar,
  Progress,
  ActionIcon,
  Modal,
} from '@mantine/core';
import {
  IconUsers,
  IconSearch,
  IconFilter,
  IconUserPlus,
  IconMail,
  IconEye,
  IconEdit,
  IconTrash,
  IconTrendingUp,
  IconTrendingDown,
  IconTarget,
  IconX,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { getAllStudents, createStudent } from '../../services/supabase';
import { notifications } from '@mantine/notifications';
import { errorReporting } from '../../services/errorReporting';
import { useForm } from '@mantine/form';

interface Student {
  id: number;
  name: string;
  email: string;
  class: string;
  grade: string;
  avgScore: number;
  attendance: number;
  assignments: { completed: number; total: number };
  trend: string;
  lastActive: string;
  avatar: string;
}

export const StudentManagement: React.FC = (): JSX.Element => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  // Check if user is teacher
  if (user?.role !== 'teacher') {
    return (
      <Container size="sm">
        <Center style={{ height: '60vh' }}>
          <Stack align="center">
            <ThemeIcon size={80} color="red" variant="light">
              <IconX size={40} />
            </ThemeIcon>
            <Title order={3}>Access Denied</Title>
            <Text c="dimmed" ta="center">
              This section is only available to teachers.
            </Text>
          </Stack>
        </Center>
      </Container>
    );
  }

  const addStudentForm = useForm({
    initialValues: {
      name: '',
      email: '',
      grade_level: 10,
      password: '',
      confirmPassword: '',
    },
    validate: {
      name: (value) => (!value ? 'Name is required' : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => (value.length < 6 ? 'Password must be at least 6 characters' : null),
      confirmPassword: (value, values) =>
        value !== values.password ? 'Passwords do not match' : null,
    },
  });

  const mockStudents = [
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@school.edu',
      class: 'Physics - Grade 10',
      grade: 'A',
      avgScore: 94,
      attendance: 98,
      assignments: { completed: 18, total: 20 },
      trend: 'up',
      lastActive: '2 hours ago',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
    },
    {
      id: 2,
      name: 'Michael Chen',
      email: 'michael.chen@school.edu',
      class: 'Mathematics - Grade 11',
      grade: 'A-',
      avgScore: 91,
      attendance: 95,
      assignments: { completed: 16, total: 18 },
      trend: 'up',
      lastActive: '1 day ago',
      avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150',
    },
    {
      id: 3,
      name: 'Emma Davis',
      email: 'emma.davis@school.edu',
      class: 'Chemistry - Grade 12',
      grade: 'B+',
      avgScore: 87,
      attendance: 92,
      assignments: { completed: 14, total: 16 },
      trend: 'stable',
      lastActive: '3 hours ago',
      avatar: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=150',
    },
    {
      id: 4,
      name: 'James Wilson',
      email: 'james.wilson@school.edu',
      class: 'Physics - Grade 10',
      grade: 'B',
      avgScore: 83,
      attendance: 88,
      assignments: { completed: 15, total: 20 },
      trend: 'down',
      lastActive: '5 hours ago',
      avatar: 'https://images.pexels.com/photos/1181684/pexels-photo-1181684.jpeg?auto=compress&cs=tinysrgb&w=150',
    },
    {
      id: 5,
      name: 'Lisa Anderson',
      email: 'lisa.anderson@school.edu',
      class: 'Mathematics - Grade 11',
      grade: 'A',
      avgScore: 92,
      attendance: 96,
      assignments: { completed: 17, total: 18 },
      trend: 'up',
      lastActive: '1 hour ago',
      avatar: 'https://images.pexels.com/photos/1181688/pexels-photo-1181688.jpeg?auto=compress&cs=tinysrgb&w=150',
    },
  ];

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await getAllStudents();
      
      if (error) {
        throw error;
      }

      // Transform data to match component interface
      const transformedStudents = (data || []).map(student => ({
        id: parseInt(student.id),
        name: student.name,
        email: student.email,
        class: `Grade ${student.grade_level}`,
        grade: 'A', // Mock grade
        avgScore: 85 + Math.floor(Math.random() * 15), // Mock score
        attendance: 85 + Math.floor(Math.random() * 15), // Mock attendance
        assignments: { completed: 15 + Math.floor(Math.random() * 5), total: 20 },
        trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)],
        lastActive: '2 hours ago',
        avatar: `https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150`,
      }));

      setStudents(transformedStudents);
    } catch (error) {
      errorReporting.reportError(error, { context: 'LOAD_STUDENTS' });
      // Use mock data as fallback
      setStudents(mockStudents);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStudent = async (values: typeof addStudentForm.values) => {
    setIsSubmitting(true);
    try {
      const { data, error } = await createStudent({
        name: values.name,
        email: values.email,
        grade_level: values.grade_level,
        password: values.password,
      });

      if (error) {
        throw error;
      }

      notifications.show({
        title: 'Success',
        message: 'Student account created successfully!',
        color: 'green',
      });

      setShowAddModal(false);
      addStudentForm.reset();
      loadStudents();
    } catch (error) {
      errorReporting.reportError(error, { context: 'CREATE_STUDENT' });
      notifications.show({
        title: 'Error',
        message: 'Failed to create student account',
        color: 'red',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditStudent = (student: Student) => {
    // In a real implementation, open edit modal
    notifications.show({
      title: 'Feature Coming Soon',
      message: 'Student editing functionality will be available soon',
      color: 'blue',
    });
  };

  const handleDeleteStudent = (studentId: number) => {
    // In a real implementation, delete student
    notifications.show({
      title: 'Feature Coming Soon',
      message: 'Student deletion functionality will be available soon',
      color: 'blue',
    });
  };

  const classes = [
    { value: 'all', label: 'All Classes' },
    { value: 'grade-9', label: 'Grade 9' },
    { value: 'grade-10', label: 'Grade 10' },
    { value: 'grade-11', label: 'Grade 11' },
    { value: 'grade-12', label: 'Grade 12' },
  ];

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = selectedClass === 'all' || 
                        student.class.toLowerCase().includes(selectedClass.replace('grade-', 'grade '));
    return matchesSearch && matchesClass;
  });

  const classStats = [
    {
      title: 'Total Students',
      value: students.length,
      icon: IconUsers,
      color: 'blue',
    },
    {
      title: 'Average Score',
      value: `${Math.round(students.reduce((sum, s) => sum + s.avgScore, 0) / students.length)}%`,
      icon: IconTarget,
      color: 'green',
    },
    {
      title: 'Attendance Rate',
      value: `${Math.round(students.reduce((sum, s) => sum + s.attendance, 0) / students.length)}%`,
      icon: IconTrendingUp,
      color: 'purple',
    },
    {
      title: 'Active Today',
      value: students.filter(s => s.lastActive.includes('hour')).length,
      icon: IconUsers,
      color: 'orange',
    },
  ];

  const getModalTitle = () => {
    if (!selectedStudent) return '';
    const escapedName = selectedStudent.name.replace(/'/g, '&#39;');
    return `${escapedName} Profile`;
  };

  return (
    <Container size="xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <Group justify="space-between" mb="xl">
          <div>
            <Title order={2}>Student Management</Title>
            <Text c="dimmed" size="lg">
              Monitor and manage your students&apos; progress and performance
            </Text>
          </div>
          <Button 
            leftSection={<IconUserPlus size={16} />}
            onClick={() => setShowAddModal(true)}
          >
            Add Student
          </Button>
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
                    <Group justify="space-between">
                      <div>
                        <Text size="sm" c="dimmed" fw={500}>
                          {stat.title}
                        </Text>
                        <Text size="xl" fw={700} mt="xs">
                          {stat.value}
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

        {/* Filters */}
        <Paper shadow="sm" p="md" radius="md" withBorder mb="xl">
          <Group>
            <TextInput
              placeholder="Search students..."
              leftSection={<IconSearch size={16} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 1 }}
            />
            <Select
              placeholder="Filter by class"
              leftSection={<IconFilter size={16} />}
              data={classes}
              value={selectedClass}
              onChange={(value) => setSelectedClass(value || 'all')}
              w={200}
            />
          </Group>
        </Paper>

        {/* Students Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Paper shadow="sm" radius="md" withBorder>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Student</Table.Th>
                  <Table.Th>Class</Table.Th>
                  <Table.Th>Grade</Table.Th>
                  <Table.Th>Avg Score</Table.Th>
                  <Table.Th>Attendance</Table.Th>
                  <Table.Th>Assignments</Table.Th>
                  <Table.Th>Trend</Table.Th>
                  <Table.Th>Last Active</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredStudents.map((student, index) => (
                  <motion.tr
                    key={student.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Table.Td>
                      <Group gap="sm">
                        <Avatar src={student.avatar} size="sm" radius="xl" />
                        <div>
                          <Text fw={500} size="sm">
                            {student.name}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {student.email}
                          </Text>
                        </div>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Badge variant="light" color="blue">
                        {student.class}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        variant="light"
                        color={
                          student.grade.startsWith('A') ? 'green' :
                          student.grade.startsWith('B') ? 'blue' :
                          student.grade.startsWith('C') ? 'orange' : 'red'
                        }
                      >
                        {student.grade}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Text fw={600}>{student.avgScore}%</Text>
                        <Progress
                          value={student.avgScore}
                          color={student.avgScore >= 90 ? 'green' : student.avgScore >= 80 ? 'blue' : 'orange'}
                          size="xs"
                          w={50}
                        />
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Text fw={500}>{student.attendance}%</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">
                        {student.assignments.completed}/{student.assignments.total}
                      </Text>
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
                      <Text size="xs" c="dimmed">
                        {student.lastActive}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <ActionIcon
                          variant="subtle"
                          color="blue"
                          onClick={() => handleEditStudent(student)}
                          onClick={() => setSelectedStudent(student)}
                        >
                          <IconEye size={16} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" color="gray">
                          <IconEdit size={16} />
                        </ActionIcon>
                        <ActionIcon 
                          variant="subtle" 
                          color="red"
                          onClick={() => handleDeleteStudent(student.id)}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </motion.tr>
                ))}
              </Table.Tbody>
            </Table>
          </Paper>
        </motion.div>

        {/* Student Detail Modal */}
        <Modal
          opened={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
          title={getModalTitle()}
          size="lg"
        >
          {selectedStudent && (
            <Stack gap="md">
              <Group>
                <Avatar src={selectedStudent.avatar} size="lg" radius="xl" />
                <div>
                  <Title order={4}>{selectedStudent.name}</Title>
                  <Text c="dimmed">{selectedStudent.email}</Text>
                  <Badge variant="light" color="blue" mt="xs">
                    {selectedStudent.class}
                  </Badge>
                </div>
              </Group>

              <Grid>
                <Grid.Col span={6}>
                  <Paper p="md" withBorder>
                    <Text size="sm" c="dimmed" mb="xs">Average Score</Text>
                    <Text size="xl" fw={700}>{selectedStudent.avgScore}%</Text>
                    <Progress value={selectedStudent.avgScore} mt="xs" />
                  </Paper>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Paper p="md" withBorder>
                    <Text size="sm" c="dimmed" mb="xs">Attendance</Text>
                    <Text size="xl" fw={700}>{selectedStudent.attendance}%</Text>
                    <Progress value={selectedStudent.attendance} mt="xs" color="green" />
                  </Paper>
                </Grid.Col>
              </Grid>

              <Paper p="md" withBorder>
                <Text fw={500} mb="sm">Assignment Progress</Text>
                <Group justify="space-between" mb="xs">
                  <Text size="sm">Completed: {selectedStudent.assignments.completed}</Text>
                  <Text size="sm">Total: {selectedStudent.assignments.total}</Text>
                </Group>
                <Progress
                  value={(selectedStudent.assignments.completed / selectedStudent.assignments.total) * 100}
                  color="blue"
                />
              </Paper>

              <Group justify="flex-end">
                <Button variant="outline" leftSection={<IconMail size={16} />}>
                  Send Message
                </Button>
                <Button leftSection={<IconEdit size={16} />}>
                  Edit Profile
                </Button>
              </Group>
            </Stack>
          )}
        </Modal>

        {/* Add Student Modal */}
        <Modal
          opened={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            addStudentForm.reset();
          }}
          title="Add New Student"
          size="md"
        >
          <form onSubmit={addStudentForm.onSubmit(handleAddStudent)}>
            <Stack gap="md">
              <TextInput
                label="Full Name"
                placeholder="Student's full name"
                {...addStudentForm.getInputProps('name')}
              />

              <TextInput
                label="Email Address"
                placeholder="student@school.edu"
                {...addStudentForm.getInputProps('email')}
              />

              <NumberInput
                label="Grade Level"
                min={1}
                max={12}
                {...addStudentForm.getInputProps('grade_level')}
              />

              <PasswordInput
                label="Password"
                placeholder="Create a password"
                {...addStudentForm.getInputProps('password')}
              />

              <PasswordInput
                label="Confirm Password"
                placeholder="Confirm the password"
                {...addStudentForm.getInputProps('confirmPassword')}
              />

              <Group justify="flex-end" mt="md">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddModal(false);
                    addStudentForm.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={isSubmitting}
                  leftSection={<IconUserPlus size={16} />}
                >
                  Add Student
                </Button>
              </Group>
            </Stack>
          </form>
        </Modal>
      </motion.div>
    </Container>
  );
};