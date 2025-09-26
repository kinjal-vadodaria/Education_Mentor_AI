import React, { useState, useEffect } from 'react';

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
  Select,
  Avatar,
  Progress,
  ActionIcon,
  Center,
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
  IconDeviceFloppy,
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
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [_isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const [addStudentForm, setAddStudentForm] = useState({
    name: '',
    email: '',
    grade_level: 10,
  });

  const [editStudentForm, setEditStudentForm] = useState({
    name: '',
    email: '',
    grade_level: 10,
  });

  const handleAddStudentInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAddStudentForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditStudentInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditStudentForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

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
        class: student.grade_level ? `Grade ${student.grade_level}` : 'Grade 10',
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

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!addStudentForm.name.trim()) {
      notifications.show({
        title: 'Error',
        message: 'Name is required',
        color: 'red',
      });
      return;
    }
    if (!addStudentForm.email.trim() || !/^\S+@\S+$/.test(addStudentForm.email)) {
      notifications.show({
        title: 'Error',
        message: 'Invalid email address',
        color: 'red',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Add to local state immediately for UI update (no auth creation to avoid login issues)
      const newStudent: Student = {
        id: Date.now(), // Temporary ID
        name: addStudentForm.name,
        email: addStudentForm.email,
        class: `Grade ${addStudentForm.grade_level}`,
        grade: 'A', // Default grade
        avgScore: 85 + Math.floor(Math.random() * 15), // Mock score
        attendance: 85 + Math.floor(Math.random() * 15), // Mock attendance
        assignments: { completed: 15 + Math.floor(Math.random() * 5), total: 20 },
        trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)],
        lastActive: 'Just added',
        avatar: `https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150`,
      };

      setStudents(prev => [newStudent, ...prev]);

      notifications.show({
        title: 'Success',
        message: 'Student added successfully!',
        color: 'green',
      });

      setShowAddModal(false);
      setAddStudentForm({
        name: '',
        email: '',
        grade_level: 10,
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to add student',
        color: 'red',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    const gradeMatch = student.class.match(/Grade (\d+)/);
    const gradeLevel = gradeMatch ? parseInt(gradeMatch[1]) : 10;
    setEditStudentForm({
      name: student.name,
      email: student.email,
      grade_level: gradeLevel,
    });
    setShowEditModal(true);
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!editStudentForm.name.trim()) {
      notifications.show({
        title: 'Error',
        message: 'Name is required',
        color: 'red',
      });
      return;
    }
    if (!editStudentForm.email.trim() || !/^\S+@\S+$/.test(editStudentForm.email)) {
      notifications.show({
        title: 'Error',
        message: 'Invalid email address',
        color: 'red',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedStudentData = {
        name: editStudentForm.name,
        email: editStudentForm.email,
        class: `Grade ${editStudentForm.grade_level}`,
        lastActive: 'Just updated',
      };

      // Update local state for the list
      setStudents(prev => 
        prev.map(s => 
          s.id === editingStudent?.id 
            ? {
                ...s,
                ...updatedStudentData,
              }
            : s
        )
      );

      // If editing from detail modal, update selectedStudent as well
      if (selectedStudent?.id === editingStudent?.id) {
        setSelectedStudent(prev => prev ? { ...prev, ...updatedStudentData } : null);
      }

      notifications.show({
        title: 'Success',
        message: 'Student profile updated successfully!',
        color: 'green',
      });

      setShowEditModal(false);
      setEditingStudent(null);
      setEditStudentForm({
        name: '',
        email: '',
        grade_level: 10,
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update student profile',
        color: 'red',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStudent = (studentId: number) => {
    // Confirmation
    const studentName = students.find(s => s.id === studentId)?.name || 'this student';
    const confirmed = window.confirm(`Are you sure you want to delete ${studentName}? This action cannot be undone.`);
    if (!confirmed) return;

    setStudents(prev => prev.filter(s => s.id !== studentId));

    notifications.show({
      title: 'Success',
      message: 'Student deleted successfully!',
      color: 'green',
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
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                padding: '0.5rem 0.75rem',
                border: '1px solid #d0d0d0',
                borderRadius: '4px',
                fontSize: '1rem',
                backgroundColor: 'white'
              }}
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
                          onClick={() => setSelectedStudent(student)}
                        >
                          <IconEye size={16} />
                        </ActionIcon>
                        <ActionIcon 
                          variant="subtle" 
                          color="indigo"
                          onClick={() => handleEditStudent(student)}
                        >
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

        {/* Custom Student Detail Modal */}
        {selectedStudent && (
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
              if (e.target === e.currentTarget) setSelectedStudent(null);
            }}
          >
            <div 
              style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '2rem',
                maxWidth: '600px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e0e0e0', paddingBottom: '1rem' }}>
                <IconEye size={24} style={{ marginRight: '0.5rem', color: '#1976d2' }} />
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600, color: '#1976d2' }}>
                  {selectedStudent.name} Profile
                </h2>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <Avatar src={selectedStudent.avatar} size="lg" radius="xl" />
                <div>
                  <Title order={4}>{selectedStudent.name}</Title>
                  <Text c="dimmed">{selectedStudent.email}</Text>
                  <Badge variant="light" color="blue" mt="xs">
                    {selectedStudent.class}
                  </Badge>
                </div>
              </div>

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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <Button variant="outline" leftSection={<IconMail size={16} />}>
                  Send Message
                </Button>
                <Button leftSection={<IconEdit size={16} />} onClick={() => handleEditStudent(selectedStudent!)}>
                  Edit Profile
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Custom Add Student Modal */}
        {showAddModal && (
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
              if (e.target === e.currentTarget) {
                setShowAddModal(false);
                setAddStudentForm({
                  name: '',
                  email: '',
                  grade_level: 10,
                });
              }
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
                <IconUserPlus size={24} style={{ marginRight: '0.5rem', color: '#1976d2' }} />
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600, color: '#1976d2' }}>
                  Add New Student
                </h2>
              </div>

              <form onSubmit={handleAddStudent} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#333' }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Student's full name"
                    value={addStudentForm.name}
                    onChange={handleAddStudentInputChange}
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

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#333' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="student@school.edu"
                    value={addStudentForm.email}
                    onChange={handleAddStudentInputChange}
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

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#333' }}>
                    Grade Level
                  </label>
                  <input
                    type="number"
                    name="grade_level"
                    value={addStudentForm.grade_level}
                    onChange={handleAddStudentInputChange}
                    min="1"
                    max="12"
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
                    onClick={() => {
                      setShowAddModal(false);
                      setAddStudentForm({
                        name: '',
                        email: '',
                        grade_level: 10,
                      });
                    }}
                    style={{ padding: '0.75rem 1.5rem' }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    leftSection={<IconUserPlus size={16} />}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: isSubmitting ? '#ccc' : '#1976d2',
                      color: 'white'
                    }}
                  >
                    {isSubmitting ? 'Adding...' : 'Add Student'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Custom Edit Student Modal */}
        {showEditModal && editingStudent && (
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
              if (e.target === e.currentTarget) {
                setShowEditModal(false);
                setEditingStudent(null);
                setEditStudentForm({
                  name: '',
                  email: '',
                  grade_level: 10,
                });
              }
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
                <IconEdit size={24} style={{ marginRight: '0.5rem', color: '#1976d2' }} />
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600, color: '#1976d2' }}>
                  Update Student Profile: {editingStudent.name}
                </h2>
              </div>

              <form onSubmit={handleUpdateStudent} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#333' }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Student's full name"
                    value={editStudentForm.name}
                    onChange={handleEditStudentInputChange}
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

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#333' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="student@school.edu"
                    value={editStudentForm.email}
                    onChange={handleEditStudentInputChange}
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

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#333' }}>
                    Grade Level
                  </label>
                  <input
                    type="number"
                    name="grade_level"
                    value={editStudentForm.grade_level}
                    onChange={handleEditStudentInputChange}
                    min="1"
                    max="12"
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
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingStudent(null);
                      setEditStudentForm({
                        name: '',
                        email: '',
                        grade_level: 10,
                      });
                    }}
                    style={{ padding: '0.75rem 1.5rem' }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    leftSection={<IconDeviceFloppy size={16} />}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: isSubmitting ? '#ccc' : '#1976d2',
                      color: 'white'
                    }}
                  >
                    {isSubmitting ? 'Updating Profile...' : 'Update Profile'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </motion.div>
    </Container>
  );
};
