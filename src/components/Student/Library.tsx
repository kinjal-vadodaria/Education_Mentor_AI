import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Paper,
  Title,
  Text,
  TextInput,
  Select,
  Group,
  Stack,
  Card,
  Grid,
  ThemeIcon,
  Badge,
  Button,
  Loader,
  Center,
  Pagination,
} from '@mantine/core';
import {
  IconBook,
  IconSearch,
  IconFilter,
  IconDownload,
  IconEye,
  IconFileText,
  IconVideo,
  IconPhoto,
  IconFile,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { getLibraryItems } from '../../services/supabase';
import { errorReporting } from '../../services/errorReporting';

interface LibraryItem {
  id: string;
  title: string;
  description: string;
  category: string;
  subject: string;
  grade_level: number;
  difficulty: string;
  tags: string[];
  file_url?: string;
  file_type?: string;
  created_at: string;
}

export const Library: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<LibraryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'Textbook', label: 'Textbooks' },
    { value: 'Worksheet', label: 'Worksheets' },
    { value: 'Guide', label: 'Study Guides' },
    { value: 'Video', label: 'Videos' },
    { value: 'Interactive', label: 'Interactive Content' },
  ];

  const subjects = [
    { value: 'all', label: 'All Subjects' },
    { value: 'Physics', label: 'Physics' },
    { value: 'Mathematics', label: 'Mathematics' },
    { value: 'Chemistry', label: 'Chemistry' },
    { value: 'Biology', label: 'Biology' },
    { value: 'History', label: 'History' },
    { value: 'Literature', label: 'Literature' },
  ];

  const difficulties = [
    { value: 'all', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
  ];

  useEffect(() => {
    loadLibraryItems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [items, searchQuery, selectedCategory, selectedSubject, selectedDifficulty]);

  const loadLibraryItems = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await getLibraryItems();
      
      if (error) {
        throw error;
      }

      setItems(data || []);
    } catch (error) {
      errorReporting.reportError(error, { context: 'LOAD_LIBRARY_ITEMS' });
      // Use mock data as fallback
      setItems([
        {
          id: '1',
          title: 'Introduction to Physics',
          description: 'Basic concepts of physics including motion, forces, and energy',
          category: 'Textbook',
          subject: 'Physics',
          grade_level: 10,
          difficulty: 'beginner',
          tags: ['physics', 'motion', 'forces'],
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Advanced Calculus Problems',
          description: 'Challenging calculus problems for advanced students',
          category: 'Worksheet',
          subject: 'Mathematics',
          grade_level: 12,
          difficulty: 'advanced',
          tags: ['calculus', 'derivatives'],
          created_at: new Date().toISOString(),
        },
        {
          id: '3',
          title: 'Chemistry Lab Safety',
          description: 'Essential safety guidelines for chemistry laboratory work',
          category: 'Guide',
          subject: 'Chemistry',
          grade_level: 11,
          difficulty: 'intermediate',
          tags: ['chemistry', 'safety'],
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = items;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Subject filter
    if (selectedSubject !== 'all') {
      filtered = filtered.filter(item => item.subject === selectedSubject);
    }

    // Difficulty filter
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(item => item.difficulty === selectedDifficulty);
    }

    // Grade level filter for students
    if (user?.role === 'student' && user?.grade_level !== undefined) {
      filtered = filtered.filter(item =>
        !item.grade_level ||
        Math.abs(item.grade_level - user.grade_level!) <= 1
      );
    }

    setFilteredItems(filtered);
    setCurrentPage(1);
  };

  const getFileIcon = (fileType?: string) => {
    if (!fileType) return IconFileText;
    
    if (fileType.includes('video')) return IconVideo;
    if (fileType.includes('image')) return IconPhoto;
    if (fileType.includes('pdf')) return IconFile;
    return IconFileText;
  };

  const handleDownload = (item: LibraryItem) => {
    if (item.file_url) {
      window.open(item.file_url, '_blank');
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  if (isLoading) {
    return (
      <Container size="lg">
        <Center style={{ height: '60vh' }}>
          <Stack align="center">
            <Loader size="xl" color="indigo" />
            <Text size="lg" c="dimmed">
              Loading library resources...
            </Text>
          </Stack>
        </Center>
      </Container>
    );
  }

  return (
    <Container size="xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <ThemeIcon size={80} color="indigo" variant="light" mx="auto" mb="md">
              <IconBook size={40} />
            </ThemeIcon>
          </motion.div>
          <Title order={2} mb="xs">
            {t('navigation.library')}
          </Title>
          <Text c="dimmed" size="lg">
            Explore educational resources and materials
          </Text>
        </div>

        {/* Filters */}
        <Paper shadow="sm" p="md" radius="md" withBorder mb="xl">
          <Stack gap="md">
            <TextInput
              placeholder="Search resources..."
              leftSection={<IconSearch size={16} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            
            <Group>
              <Select
                placeholder="Category"
                leftSection={<IconFilter size={16} />}
                data={categories}
                value={selectedCategory}
                onChange={(value) => setSelectedCategory(value || 'all')}
                w={150}
              />
              
              <Select
                placeholder="Subject"
                data={subjects}
                value={selectedSubject}
                onChange={(value) => setSelectedSubject(value || 'all')}
                w={150}
              />
              
              <Select
                placeholder="Difficulty"
                data={difficulties}
                value={selectedDifficulty}
                onChange={(value) => setSelectedDifficulty(value || 'all')}
                w={150}
              />
            </Group>
          </Stack>
        </Paper>

        {/* Results */}
        <Text size="sm" c="dimmed" mb="md">
          Showing {paginatedItems.length} of {filteredItems.length} resources
        </Text>

        {/* Library Items Grid */}
        {paginatedItems.length > 0 ? (
          <>
            <Grid>
              {paginatedItems.map((item, index) => {
                const FileIcon = getFileIcon(item.file_type);
                return (
                  <Grid.Col key={item.id} span={{ base: 12, sm: 6, lg: 4 }}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
                        <Stack gap="md" h="100%">
                          <Group justify="space-between" align="flex-start">
                            <ThemeIcon color="indigo" variant="light" size="lg">
                              <FileIcon size={20} />
                            </ThemeIcon>
                            <Badge
                              color={
                                item.difficulty === 'beginner' ? 'green' :
                                item.difficulty === 'intermediate' ? 'blue' : 'red'
                              }
                              variant="light"
                              size="sm"
                            >
                              {item.difficulty}
                            </Badge>
                          </Group>

                          <div style={{ flex: 1 }}>
                            <Title order={5} mb="xs" lineClamp={2}>
                              {item.title}
                            </Title>
                            
                            <Text size="sm" c="dimmed" mb="sm" lineClamp={3}>
                              {item.description}
                            </Text>

                            <Group gap="xs" mb="sm">
                              <Badge variant="outline" size="xs">
                                {item.category}
                              </Badge>
                              <Badge variant="outline" size="xs">
                                {item.subject}
                              </Badge>
                              {item.grade_level && (
                                <Badge variant="outline" size="xs">
                                  Grade {item.grade_level}
                                </Badge>
                              )}
                            </Group>

                            {item.tags.length > 0 && (
                              <Group gap="xs" mb="md">
                                {item.tags.slice(0, 3).map((tag, tagIndex) => (
                                  <Badge key={tagIndex} variant="light" size="xs" color="gray">
                                    {tag}
                                  </Badge>
                                ))}
                                {item.tags.length > 3 && (
                                  <Badge variant="light" size="xs" color="gray">
                                    +{item.tags.length - 3}
                                  </Badge>
                                )}
                              </Group>
                            )}
                          </div>

                          <Group justify="space-between">
                            <Button
                              variant="light"
                              size="sm"
                              leftSection={<IconEye size={14} />}
                            >
                              View
                            </Button>
                            {item.file_url && (
                              <Button
                                variant="outline"
                                size="sm"
                                leftSection={<IconDownload size={14} />}
                                onClick={() => handleDownload(item)}
                              >
                                Download
                              </Button>
                            )}
                          </Group>
                        </Stack>
                      </Card>
                    </motion.div>
                  </Grid.Col>
                );
              })}
            </Grid>

            {/* Pagination */}
            {totalPages > 1 && (
              <Group justify="center" mt="xl">
                <Pagination
                  value={currentPage}
                  onChange={setCurrentPage}
                  total={totalPages}
                  size="sm"
                />
              </Group>
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Paper shadow="sm" p="xl" radius="md" withBorder>
              <Center>
                <Stack align="center" gap="md">
                  <ThemeIcon size={80} color="gray" variant="light">
                    <IconBook size={40} />
                  </ThemeIcon>
                  <div style={{ textAlign: 'center' }}>
                    <Title order={4} mb="xs">
                      No resources found
                    </Title>
                    <Text c="dimmed">
                      Try adjusting your search criteria or filters
                    </Text>
                  </div>
                </Stack>
              </Center>
            </Paper>
          </motion.div>
        )}
      </motion.div>
    </Container>
  );
};