import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { notifications } from '@mantine/notifications';
import {
  Container,
  Paper,
  Title,
  Text,
  Stack,
  Group,
  Switch,
  Select,
  Button,
  Card,
  Grid,
  ThemeIcon,
  TextInput,
  PasswordInput,
  NumberInput,
  Badge,
  ColorInput,
} from '@mantine/core';
import { useTheme, CustomTheme } from '../../contexts/ThemeContext';
import { useForm } from '@mantine/form';
import {
  IconSettings,
  IconUser,
  IconPalette,
  IconWorld,
  IconBell,
  IconShield,
  IconKey,
  IconDeviceFloppy,
  IconCheck,
  IconX,
  IconRefresh,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { updateUserProfile, supabase } from '../../services/supabase';

export const Settings: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, refreshUser } = useAuth();
  const {
    colorScheme,
    toggleColorScheme,
    currentTheme,
    customTheme,
    setPresetTheme,
    setCustomTheme,
    resetToDefault,
    presetThemes,
  } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  const languages = [
    { value: 'en', label: '🇺🇸 English' },
    { value: 'es', label: '🇪🇸 Español' },
    { value: 'fr', label: '🇫🇷 Français' },
    { value: 'de', label: '🇩🇪 Deutsch' },
    { value: 'hi', label: '🇮🇳 हिंदी' },
    { value: 'zh', label: '🇨🇳 中文' },
    { value: 'ar', label: '🇸🇦 العربية' },
    { value: 'pt', label: '🇧🇷 Português' },
    { value: 'ru', label: '🇷🇺 Русский' },
    { value: 'ja', label: '🇯🇵 日本語' },
  ];

  const profileForm = useForm({
    initialValues: {
      name: user?.name || '',
      email: user?.email || '',
      grade_level: user?.grade_level || 10,
    },
    validate: {
      name: (value) => (!value ? 'Name is required' : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
    },
  });

  const passwordForm = useForm({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validate: {
      newPassword: (value) => (value.length < 6 ? 'Password must be at least 6 characters' : null),
      confirmPassword: (value, values) =>
        value !== values.newPassword ? 'Passwords do not match' : null,
    },
  });

  // Early return if user is not available
  if (!user) {
    return <div>Loading...</div>;
  }

  const handleLanguageChange = (value: string | null) => {
    if (value && user) {
      i18n.changeLanguage(value);
      updateUserPreferences({ language: value });
    }
  };

  const handleThemeChange = () => {
    toggleColorScheme();
    updateUserPreferences({ theme: colorScheme === 'dark' ? 'light' : 'dark' });
  };

  const handleDifficultyChange = (value: string | null) => {
    if (value && user) {
      updateUserPreferences({ difficulty: value as 'beginner' | 'intermediate' | 'advanced' });
    }
  };

  const updateUserPreferences = async (preferences: Partial<typeof user.preferences>) => {
    if (!user) return;

    try {
      const updatedPreferences = { ...user.preferences, ...preferences };
      await updateUserProfile(user.id, { preferences: updatedPreferences });
      await refreshUser();

      notifications.show({
        title: 'Success',
        message: 'Preferences updated successfully!',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update preferences',
        color: 'red',
      });
    }
  };

  // New handlers for color panel
  const handlePresetThemeSelect = (themeName: string) => {
    const selected = presetThemes.find((t) => t.name === themeName);
    if (selected) {
      setPresetTheme(selected);
      // Note: themePreset and customTheme not in preferences type, handled by ThemeContext
    }
  };

  const handleCustomColorChange = (field: keyof CustomTheme, value: string) => {
    let currentTheme = customTheme;
    if (!currentTheme) {
      currentTheme = { primary: '#ffffff', background: '#ffffff', text: '#000000' };
    }
    const newTheme = { ...currentTheme, [field]: value };
    setCustomTheme(newTheme);
    // Note: customTheme not in preferences type, handled by ThemeContext
  };

  const handleResetTheme = () => {
    resetToDefault();
    // Note: themePreset and customTheme not in preferences type, handled by ThemeContext
  };

  const handleProfileUpdate = async (values: typeof profileForm.values) => {
    setIsLoading(true);
    try {
      await updateUserProfile(user.id, values);
      await refreshUser();
      notifications.show({
        title: 'Success',
        message: 'Profile updated successfully!',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update profile',
        color: 'red',
        icon: <IconX size={16} />,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (values: typeof passwordForm.values) => {
    if (values.newPassword !== values.confirmPassword) {
      notifications.show({
        title: 'Error',
        message: 'Passwords do not match',
        color: 'red',
        icon: <IconX size={16} />,
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: values.newPassword,
      });

      if (error) throw error;

      notifications.show({
        title: 'Success',
        message: 'Password updated successfully!',
        color: 'green',
        icon: <IconCheck size={16} />,
      });

      // Clear the form
      passwordForm.reset();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: (error as Error).message || 'Failed to update password',
        color: 'red',
        icon: <IconX size={16} />,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container size="lg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <Group mb="xl">
          <ThemeIcon size="xl" color={user?.role === 'student' ? 'indigo' : 'blue'} variant="light">
            <IconSettings size={24} />
          </ThemeIcon>
          <div>
            <Title order={2}>{t('navigation.settings')}</Title>
            <Text c="dimmed" size="lg">
              Manage your account preferences and settings
            </Text>
          </div>
        </Group>

        <Grid>
          {/* Profile Settings */}
          <Grid.Col span={{ base: 12, lg: 6 }}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Group mb="md">
                  <ThemeIcon color="blue" variant="light">
                    <IconUser size={20} />
                  </ThemeIcon>
                  <Title order={4}>Profile Information</Title>
                </Group>

                <form onSubmit={profileForm.onSubmit(handleProfileUpdate)}>
                  <Stack gap="md">
                    <TextInput
                      label="Full Name"
                      placeholder="Your full name"
                      {...profileForm.getInputProps('name')}
                    />

                    <TextInput
                      label="Email"
                      placeholder="your@email.com"
                      disabled
                      {...profileForm.getInputProps('email')}
                    />

                    <Group>
                      <Badge color={user?.role === 'student' ? 'indigo' : 'blue'} variant="light">
                        {user?.role === 'student' ? 'Student' : 'Teacher'}
                      </Badge>
                    </Group>

                    {user?.role === 'student' && (
                      <NumberInput
                        label="Grade Level"
                        min={1}
                        max={12}
                        {...profileForm.getInputProps('grade_level')}
                      />
                    )}

                    <Button
                      type="submit"
                      loading={isLoading}
                      leftSection={<IconDeviceFloppy size={16} />}
                    >
                      Save Profile
                    </Button>
                  </Stack>
                </form>
              </Card>
            </motion.div>
          </Grid.Col>

          {/* Appearance Settings */}
          <Grid.Col span={{ base: 12, lg: 6 }}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Group mb="md">
                  <ThemeIcon color="purple" variant="light">
                    <IconPalette size={20} />
                  </ThemeIcon>
                  <Title order={4}>Appearance</Title>
                </Group>

                <Stack gap="md">
                  <div>
                    <Text fw={500} mb="xs">Language</Text>
                    <Select
                      data={languages}
                      value={i18n.language}
                      onChange={handleLanguageChange}
                      leftSection={<IconWorld size={16} />}
                      searchable
                    />
                  </div>

                  <div>
                    <Text fw={500} mb="xs">Theme</Text>
                    <Group justify="space-between">
                      <div>
                        <Text fw={500}>{colorScheme === 'light' ? t('common.lightMode') : t('common.darkMode')}</Text>
                        <Text size="sm" c="dimmed">
                          Choose your preferred theme
                        </Text>
                      </div>
                      <Switch
                        checked={colorScheme === 'dark'}
                        onChange={handleThemeChange}
                        size="lg"
                      />
                    </Group>
                  </div>

                  <div>
                    <Text fw={500} mb="xs">Learning Difficulty</Text>
                    <Select
                      data={[
                        { value: 'beginner', label: 'Beginner' },
                        { value: 'intermediate', label: 'Intermediate' },
                        { value: 'advanced', label: 'Advanced' },
                      ]}
                      value={user?.preferences?.difficulty || 'intermediate'}
                      onChange={handleDifficultyChange}
                    />
                  </div>

                  {/* New Color Panel */}
                  <div>
                    <Text fw={500} mb="xs">Component Theme</Text>
                    <Group gap="xs" mb="md">
                      {presetThemes.map((theme) => (
                        <Button
                          key={theme.name}
                          size="xs"
                          variant={currentTheme?.name === theme.name ? 'filled' : 'outline'}
                          style={{
                            backgroundColor: theme.primary,
                            color: theme.text,
                            borderColor: currentTheme?.name === theme.name ? undefined : theme.primary,
                          }}
                          onClick={() => handlePresetThemeSelect(theme.name)}
                        >
                          {theme.name}
                        </Button>
                      ))}
                    </Group>
                  </div>

                  <div>
                    <Text fw={500} mb="xs">Customize Your Own Colors</Text>
                    <ColorInput
                      label="Primary Color"
                      value={customTheme?.primary || '#ffffff'}
                      onChange={(value) => handleCustomColorChange('primary', value)}
                      format="hex"
                      swatches={presetThemes.map((t) => t.primary)}
                    />
                    <ColorInput
                      label="Background Color"
                      value={customTheme?.background || '#ffffff'}
                      onChange={(value) => handleCustomColorChange('background', value)}
                      format="hex"
                      swatches={presetThemes.map((t) => t.background)}
                    />
                    <ColorInput
                      label="Text Color"
                      value={customTheme?.text || '#000000'}
                      onChange={(value) => handleCustomColorChange('text', value)}
                      format="hex"
                      swatches={presetThemes.map((t) => t.text)}
                    />
                    <Button mt="sm" variant="outline" leftSection={<IconRefresh size={16} />} onClick={handleResetTheme}>
                      Reset to Default
                    </Button>
                  </div>
                </Stack>
              </Card>
            </motion.div>
          </Grid.Col>

          {/* Security Settings */}
          <Grid.Col span={{ base: 12, lg: 6 }}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Group mb="md">
                  <ThemeIcon color="red" variant="light">
                    <IconShield size={20} />
                  </ThemeIcon>
                  <Title order={4}>Security</Title>
                </Group>

                <form onSubmit={passwordForm.onSubmit(handlePasswordChange)}>
                  <Stack gap="md">
                    <PasswordInput
                      label="Current Password"
                      placeholder="Enter current password"
                      {...passwordForm.getInputProps('currentPassword')}
                    />

                    <PasswordInput
                      label="New Password"
                      placeholder="Enter new password"
                      {...passwordForm.getInputProps('newPassword')}
                    />

                    <PasswordInput
                      label="Confirm New Password"
                      placeholder="Confirm new password"
                      {...passwordForm.getInputProps('confirmPassword')}
                    />

                    <Button
                      type="submit"
                      loading={isLoading}
                      leftSection={<IconKey size={16} />}
                      color="red"
                    >
                      Change Password
                    </Button>
                  </Stack>
                </form>
              </Card>
            </motion.div>
          </Grid.Col>

          {/* Notification Settings */}
          <Grid.Col span={{ base: 12, lg: 6 }}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Group mb="md">
                  <ThemeIcon color="orange" variant="light">
                    <IconBell size={20} />
                  </ThemeIcon>
                  <Title order={4}>Notifications</Title>
                </Group>

                <Stack gap="md">
                  <Group justify="space-between">
                    <div>
                      <Text fw={500}>Email Notifications</Text>
                      <Text size="sm" c="dimmed">
                        Receive updates via email
                      </Text>
                    </div>
                    <Switch defaultChecked size="lg" />
                  </Group>

                  <Group justify="space-between">
                    <div>
                      <Text fw={500}>Quiz Reminders</Text>
                      <Text size="sm" c="dimmed">
                        Get reminded about pending quizzes
                      </Text>
                    </div>
                    <Switch defaultChecked size="lg" />
                  </Group>

                  <Group justify="space-between">
                    <div>
                      <Text fw={500}>Progress Updates</Text>
                      <Text size="sm" c="dimmed">
                        Weekly progress summaries
                      </Text>
                    </div>
                    <Switch defaultChecked size="lg" />
                  </Group>

                  {user?.role === 'teacher' && (
                    <Group justify="space-between">
                      <div>
                        <Text fw={500}>Student Alerts</Text>
                        <Text size="sm" c="dimmed">
                          Notifications about student performance
                        </Text>
                      </div>
                      <Switch defaultChecked size="lg" />
                    </Group>
                  )}
                </Stack>
              </Card>
            </motion.div>
          </Grid.Col>
        </Grid>

        {/* Account Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Paper p="lg" mt="xl" withBorder>
            <Title order={4} mb="md">Account Information</Title>
            <Grid>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Text size="sm" c="dimmed">Account Created</Text>
                <Text fw={500}>
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </Text>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Text size="sm" c="dimmed">Account Type</Text>
                <Badge color={user?.role === 'student' ? 'indigo' : 'blue'} variant="light">
                  {user?.role === 'student' ? 'Student Account' : 'Teacher Account'}
                </Badge>
              </Grid.Col>
            </Grid>
          </Paper>
        </motion.div>
      </motion.div>
    </Container>
  );
};
