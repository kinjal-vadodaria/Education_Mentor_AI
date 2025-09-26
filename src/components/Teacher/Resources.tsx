import React, { useState, useEffect, useRef } from 'react';
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
import { getLibraryItems, createLibraryItem, updateLibraryItem, deleteLibraryItem, uploadFile } from '../../services/supabase';
import { errorReporting } from '../../services/errorReporting';
import {
  Container,
  Paper,
  Title,
  Text,
  Button,
  Group,
  Stack,
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
  Card,
  Grid,
} from '@mantine/core';
import { Dropzone, FileWithPath } from '@mantine/dropzone';
import { notifications } from '@mantine/notifications';
import { useForm } from '@mantine/form';
import './Resources.css';

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
  file_name?: string;
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(files as FileWithPath[]);
    setShowCreateModal(true);
  };



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
          file_name: 'physics_lab_manual.pdf',
          file_url: 'https://via.placeholder.com/300x200?text=Physics+Lab+Manual',
          file_type: 'application/pdf',
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Sample Image Resource',
          description: 'A sample image for educational purposes',
          category: 'Image',
          subject: 'General',
          grade_level: 10,
          difficulty: 'beginner',
          tags: ['image', 'sample', 'demo'],
          is_public: true,
          file_name: 'sample_image.jpg',
          file_url: 'https://via.placeholder.com/300x200/4A90E2/FFFFFF?text=Sample+Image',
          file_type: 'image/jpeg',
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const createResourceCallback = async (values: typeof form.values) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      let fileUrl = '';
      let fileType = '';
      let fileName = '';

      if (uploadedFiles.length > 0) {
        const file = uploadedFiles[0];
        // const path = `${user.id}/${Date.now()}-${file.name}`;
        // fileUrl = await uploadFile(file, path);
        fileUrl = `https://via.placeholder.com/300x200?text=${encodeURIComponent(file.name)}`;
        fileType = file.type;
        fileName = file.name;
      }

      const { error } = await createLibraryItem({
        ...values,
        author_id: user.id,
        file_url: fileUrl || undefined,
        file_type: fileType || undefined,
        file_name: fileName || undefined,
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

  const handleCreateResource = form.onSubmit(createResourceCallback);

  const editResourceCallback = async (values: typeof form.values) => {
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

  const handleEditResource = form.onSubmit(editResourceCallback);

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
    setEditingResource(resource);
    setShowEditModal(true);
  };

  if (isLoading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading resources...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="header">
          <div>
            <h2 className="header-title">Educational Resources</h2>
            <p className="header-subtitle">Manage your educational materials and resources</p>
          </div>
          
          <button
            className="btn"
            onClick={() => fileInputRef.current?.click()}
          >
            <IconPlus size={16} />
            Add Resource
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept="application/pdf,image/*"
          />
        </div>

        {/* Resources Cards */}
        {resources.length > 0 ? (
          <div className="grid">
            {resources.map((resource, index) => (
              <div key={resource.id} className="card">
                <div className="card-header">
                  <h3 className="card-title">{resource.title}</h3>
                  <span className="badge badge-blue">{resource.category}</span>
                </div>
                <p className="card-description">{resource.description}</p>
                <div className="card-details">
                  <span>Subject: {resource.subject}</span>
                  <span>Grade: {resource.grade_level}</span>
                  <span className={`badge ${resource.difficulty === 'beginner' ? 'badge-green' : resource.difficulty === 'intermediate' ? 'badge-blue' : 'badge-red'}`}>{resource.difficulty}</span>
                </div>
                <div className="card-tags">
                  {resource.tags.map((tag, idx) => (
                    <span key={idx} className="badge badge-dot">{tag}</span>
                  ))}
                </div>
                {resource.file_name && (
                  <p className="card-description">
                    File: {resource.file_name}
                  </p>
                )}
                {resource.file_type?.startsWith('image/') && resource.file_url && (
                  <img
                    src={resource.file_url}
                    alt={resource.file_name}
                    style={{ maxWidth: '100%', height: 'auto', borderRadius: '4px', marginTop: '8px' }}
                  />
                )}
                <div className="card-actions">
                  <span className={`badge ${resource.is_public ? 'badge-green' : 'badge-gray'}`}>
                    {resource.is_public ? 'Public' : 'Private'}
                  </span>
                  <div className="card-actions-right">
                    <button
                      className="icon-btn icon-btn-blue"
                      onClick={() => openEditModal(resource)}
                    >
                      <IconEdit size={16} />
                    </button>
                    {resource.file_url && (
                      <button
                        className="icon-btn icon-btn-green"
                        onClick={() => window.open(resource.file_url, '_blank')}
                      >
                        <IconDownload size={16} />
                      </button>
                    )}
                    <button
                      className="icon-btn icon-btn-red"
                      onClick={() => handleDeleteResource(resource.id)}
                    >
                      <IconTrash size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
                      onClick={() => fileInputRef.current?.click()}
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
          <form onSubmit={form.onSubmit(createResourceCallback)}>
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
                  accept={['application/pdf', 'image/*']}
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
          <form onSubmit={form.onSubmit(editResourceCallback)}>
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
    </div>
  );
};
