import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Title,
  Text,
  Button,
  Group,
  Stack,
  Grid,
  ThemeIcon,
  Badge,
  Modal,
  TextInput,
  Textarea,
  Select,
  NumberInput,
  TagsInput,
  Switch,
  ActionIcon,
  Table,
  Loader,
  Center,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { Dropzone, FileWithPath } from '@mantine/dropzone';
import {
  IconFolder,
  IconPlus,
  IconEdit,
  IconTrash,
  IconUpload,
  IconFile,
  IconDownload,
  IconX,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { getLibraryItems, createLibraryItem, updateLibraryItem, deleteLibraryItem } from '../../services/supabase';
import { notifications } from '@mantine/notifications';
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
  is_public: boolean;
  file_url?: string;
  file_type?: string;
  created_at: string;
}

export const Resources: React.FC = () => {
  const { user } = useAuth();
  const [resources, setResources] = useState<LibraryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingResource, setEditingResource] = useState<LibraryItem | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<FileWithPath[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    initialValues: {
      title: '',
      description: '',
      category: 'Textbook',
      subject: 'Physics',
      grade_level: 10,
      difficulty: 'intermediate',
      tags: [] as string[],
      is_public: true,
    },
    validate: {
      title: (value) => (!value ? 'Title is required' : null),
      description: (value) => (!value ? 'Description is required' : null),
    },
  });

  const categories = [
    'Textbook', 'Worksheet', 'Guide', 'Video', 'Interactive', 'Assessment'
  ];

  const subjects = [
    'Physics', 'Mathematics', 'Chemistry', 'Biology', 'History', 'Literature', 'Computer Science'
  ];

  const difficulties = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
  ];

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await getLibraryItems(user?.id);
      
      if (error) {
        throw error;
      }

      setResources(data || []);
    } catch (error) {
      errorReporting.reportError(error, { context: 'LOAD_RESOURCES' });
      // Use mock data as fallback
      setResources([
        {
          id: '1',
          title: 'Physics Lab Manual',
          description: 'Comprehensive lab manual for physics experiments',
          category: 'Guide',
          subject: 'Physics',
          grade_level: 11,
          difficulty: 'intermediate',
          tags: ['physics', 'laboratory', 'experiments'],
          is_public: true,
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateResource = async (values: typeof form.values) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      // In a real implementation, you would upload files to storage first
      let fileUrl = '';
      let fileType = '';
      
      if (uploadedFiles.length > 0) {
        const file = uploadedFiles[0];
        // Mock file upload - in reality, upload to Supabase Storage
        fileUrl = `https://example.com/files/${file.name}`;
        fileType = file.type;
      }

      const { error } = await createLibraryItem({
        ...values,
        author_id: user.id,
        file_url: fileUrl || undefined,
        file_type: fileType || undefined,
      });

      if (error) {
        throw error;
      }

      notifications.show({
        title: 'Success',
        message: 'Resource created successfully!',
        color: 'green',
      });

      setShowCreateModal(false);
      form.reset();
      setUploadedFiles([]);
      loadResources();
    } catch (error) {
      errorReporting.reportError(error, { context: 'CREATE_RESOURCE' });
      notifications.show({
        title: 'Error',
        message: 'Failed to create resource',
        color: 'red',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditResource = async (values: typeof form.values) => {
    if (!editingResource) return;

    setIsSubmitting(true);
    try {
      const { error } = await updateLibraryItem(editingResource.id, values);

      if (error) {
        throw error;
      }

      notifications.show({
        title: 'Success',
        message: 'Resource updated successfully!',
        color: 'green',
      });

      setShowEditModal(false);
      setEditingResource(null);
      form.reset();
      loadResources();
    } catch (error) {
      errorReporting.reportError(error, { context: 'UPDATE_RESOURCE' });
      notifications.show({
        title: 'Error',
        message: 'Failed to update resource',
        color: 'red',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteResource = async (id: string) => {
    try {
      const { error } = await deleteLibraryItem(id);

      if (error) {
        throw error;
      }

      notifications.show({
        title: 'Success',
        message: 'Resource deleted successfully!',
        color: 'green',
      });

      loadResources();
    } catch (error) {
      errorReporting.reportError(error, { context: 'DELETE_RESOURCE' });
      notifications.show({
        title: 'Error',
        message: 'Failed to delete resource',
        color: 'red',
      });
    }
  };

  const openEditModal = (resource: LibraryItem) => {
    setEditingResource(resource);
    form.setValues({
      title: resource.title,
      description: resource.description,
      category: resource.category,
      subject: resource.subject,
      grade_level: resource.grade_level,
      difficulty: resource.difficulty,
      tags: resource.tags,
      is_public: resource.is_public,
    });
    setShowEditModal(true);
  };

  if (isLoading) {
    return (
      <Container size="lg">
        <Center style={{ height: '60vh' }}>
          <Stack align="center">
            <Loader size="xl" color="blue" />
            <Text size="lg" c="dimmed">
              Loading resources...
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
        <Group justify="space-between" mb="xl">
          <div>
            <Title order={2}>Educational Resources</Title>
            <Text c="dimmed" size="lg">
              Manage your educational materials and resources
            </Text>
          </div>
          
          <Button
            onClick={() => setShowCreateModal(true)}
            leftSection={<IconPlus size={16} />}
            variant="gradient"
            gradient={{ from: 'blue', to: 'cyan' }}
          >
            Add Resource
          </Button>
        </Group>

        {/* Resources Table */}
        {resources.length > 0 ? (
          <Paper shadow="sm" radius="md" withBorder>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Title</Table.Th>
                  <Table.Th>Category</Table.Th>
                  <Table.Th>Subject</Table.Th>
                  <Table.Th>Grade</Table.Th>
                  <Table.Th>Difficulty</Table.Th>
                  <Table.Th>Visibility</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {resources.map((resource, index) => (
                  <motion.tr
                    key={resource.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Table.Td>
                      <div>
                        <Text fw={500} size="sm">
                          {resource.title}
                        </Text>
                        <Text size="xs" c="dimmed" lineClamp={1}>
                          {resource.description}
                        </Text>
                      </div>
                    </Table.Td>
                    <Table.Td>
                      <Badge variant="light" color="blue">
                        {resource.category}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{resource.subject}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">Grade {resource.grade_level}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        variant="light"
                        color={
                          resource.difficulty === 'beginner' ? 'green' :
                          resource.difficulty === 'intermediate' ? 'blue' : 'red'
                        }
                      >
                        {resource.difficulty}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        variant="light"
                        color={resource.is_public ? 'green' : 'gray'}
                      >
                        {resource.is_public ? 'Public' : 'Private'}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <ActionIcon
                          variant="subtle"
                          color="blue"
                          onClick={() => openEditModal(resource)}
                        >
                          <IconEdit size={16} />
                        </ActionIcon>
                        {resource.file_url && (
                          <ActionIcon
                            variant="subtle"
                            color="green"
                            onClick={() => window.open(resource.file_url, '_blank')}
                          >
                            <IconDownload size={16} />
                          </ActionIcon>
                        )}
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          onClick={() => handleDeleteResource(resource.id)}
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
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Paper shadow="sm" p="xl" radius="md" withBorder>
              <Center>
                <Stack align="center" gap="md">
                  <ThemeIcon size={80} color="gray" variant="light">
                    <IconFolder size={40} />
                  </ThemeIcon>
                  <div style={{ textAlign: 'center' }}>
                    <Title order={4} mb="xs">
                      No resources yet
                    </Title>
                    <Text c="dimmed" mb="lg">
                      Create your first educational resource to get started
                    </Text>
                    <Button
                      onClick={() => setShowCreateModal(true)}
                      leftSection={<IconPlus size={16} />}
                    >
                      Add Resource
                    </Button>
                  </div>
                </Stack>
              </Center>
            </Paper>
          </motion.div>
        )}

        {/* Create Resource Modal */}
        <Modal
          opened={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            form.reset();
            setUploadedFiles([]);
          }}
          title="Create New Resource"
          size="lg"
        >
          <form onSubmit={form.onSubmit(handleCreateResource)}>
            <Stack gap="md">
              <TextInput
                label="Title"
                placeholder="Resource title"
                {...form.getInputProps('title')}
              />

              <Textarea
                label="Description"
                placeholder="Describe this resource"
                minRows={3}
                {...form.getInputProps('description')}
              />

              <Grid>
                <Grid.Col span={6}>
                  <Select
                    label="Category"
                    data={categories}
                    {...form.getInputProps('category')}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <Select
                    label="Subject"
                    data={subjects}
                    {...form.getInputProps('subject')}
                  />
                </Grid.Col>
              </Grid>

              <Grid>
                <Grid.Col span={6}>
                  <NumberInput
                    label="Grade Level"
                    min={1}
                    max={12}
                    {...form.getInputProps('grade_level')}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <Select
                    label="Difficulty"
                    data={difficulties}
                    {...form.getInputProps('difficulty')}
                  />
                </Grid.Col>
              </Grid>

              <TagsInput
                label="Tags"
                placeholder="Add tags"
                {...form.getInputProps('tags')}
              />

              <Switch
                label="Make this resource public"
                description="Public resources can be viewed by all students"
                {...form.getInputProps('is_public', { type: 'checkbox' })}
              />

              <div>
                <Text size="sm" fw={500} mb="xs">
                  Upload Files (Optional)
                </Text>
                <Dropzone
                  onDrop={setUploadedFiles}
                  maxFiles={1}
                  accept={['application/pdf', 'image/*', 'video/*', 'text/*']}
                >
                  <Group justify="center" gap="xl" mih={220} style={{ pointerEvents: 'none' }}>
                    <div>
                      <Text size="xl" inline>
                        <IconUpload size={50} />
                      </Text>
                      <Text size="lg" inline>
                        Drag files here or click to select
                      </Text>
                    </div>
                  </Group>
                </Dropzone>
                
                {uploadedFiles.length > 0 && (
                  <Stack gap="xs" mt="sm">
                    {uploadedFiles.map((file, index) => (
                      <Group key={index} gap="sm">
                        <IconFile size={16} />
                        <Text size="sm">{file.name}</Text>
                        <ActionIcon
                          size="sm"
                          color="red"
                          onClick={() => setUploadedFiles([])}
                        >
                          <IconX size={12} />
                        </ActionIcon>
                      </Group>
                    ))}
                  </Stack>
                )}
              </div>

              <Group justify="flex-end" mt="md">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateModal(false);
                    form.reset();
                    setUploadedFiles([]);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" loading={isSubmitting}>
                  Create Resource
                </Button>
              </Group>
            </Stack>
          </form>
        </Modal>

        {/* Edit Resource Modal */}
        <Modal
          opened={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingResource(null);
            form.reset();
          }}
          title="Edit Resource"
          size="lg"
        >
          <form onSubmit={form.onSubmit(handleEditResource)}>
            <Stack gap="md">
              <TextInput
                label="Title"
                placeholder="Resource title"
                {...form.getInputProps('title')}
              />

              <Textarea
                label="Description"
                placeholder="Describe this resource"
                minRows={3}
                {...form.getInputProps('description')}
              />

              <Grid>
                <Grid.Col span={6}>
                  <Select
                    label="Category"
                    data={categories}
                    {...form.getInputProps('category')}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <Select
                    label="Subject"
                    data={subjects}
                    {...form.getInputProps('subject')}
                  />
                </Grid.Col>
              </Grid>

              <Grid>
                <Grid.Col span={6}>
                  <NumberInput
                    label="Grade Level"
                    min={1}
                    max={12}
                    {...form.getInputProps('grade_level')}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <Select
                    label="Difficulty"
                    data={difficulties}
                    {...form.getInputProps('difficulty')}
                  />
                </Grid.Col>
              </Grid>

              <TagsInput
                label="Tags"
                placeholder="Add tags"
                {...form.getInputProps('tags')}
              />

              <Switch
                label="Make this resource public"
                description="Public resources can be viewed by all students"
                {...form.getInputProps('is_public', { type: 'checkbox' })}
              />

              <Group justify="flex-end" mt="md">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingResource(null);
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" loading={isSubmitting}>
                  Update Resource
                </Button>
              </Group>
            </Stack>
          </form>
        </Modal>
      </motion.div>
    </Container>
  );
};