import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Paper,
  Title,
  Text,
  TextInput,
  PasswordInput,
  Button,
  Group,
  Stack,
  SegmentedControl,
  Center,
  Box,
  ThemeIcon,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { motion } from 'framer-motion';
import { IconGraduationCap, IconUser, IconBook } from '@tabler/icons-react';
import { useAuth } from '../../contexts/AuthContext';

export const LoginForm: React.FC = () => {
  const { t } = useTranslation();
  const { login, register, isLoading } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<'student' | 'teacher'>('student');

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => (value.length < 6 ? 'Password must be at least 6 characters' : null),
      confirmPassword: (value, values) =>
        mode === 'register' && value !== values.password ? 'Passwords do not match' : null,
      name: (value) => (mode === 'register' && !value ? 'Name is required' : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {
      if (mode === 'login') {
        await login(values.email, values.password);
      } else {
        await register(values.email, values.password, {
          name: values.name,
          role,
          email: values.email,
          preferences: {
            language: 'en',
            theme: 'light',
            difficulty: 'intermediate',
          },
        });
      }
    } catch (error) {
      // Error handling is done in the auth context
    }
  };

  return (
    <Container size={420} my={40}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Center mb="xl">
          <ThemeIcon size={60} radius="md" variant="gradient" gradient={{ from: 'indigo', to: 'purple' }}>
            <IconGraduationCap size={30} />
          </ThemeIcon>
        </Center>

        <Title ta="center" mb="md">
          EduMentor AI
        </Title>

        <Text c="dimmed" size="sm" ta="center" mb="xl">
          {mode === 'login' ? t('auth.welcomeBack') : t('auth.createAccount')}
        </Text>

        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <Stack>
            <SegmentedControl
              value={mode}
              onChange={(value) => setMode(value as 'login' | 'register')}
              data={[
                { label: t('auth.login'), value: 'login' },
                { label: t('auth.signup'), value: 'register' },
              ]}
              fullWidth
            />

            {mode === 'register' && (
              <SegmentedControl
                value={role}
                onChange={(value) => setRole(value as 'student' | 'teacher')}
                data={[
                  {
                    label: (
                      <Center>
                        <IconUser size={16} />
                        <Box ml={10}>Student</Box>
                      </Center>
                    ),
                    value: 'student',
                  },
                  {
                    label: (
                      <Center>
                        <IconBook size={16} />
                        <Box ml={10}>Teacher</Box>
                      </Center>
                    ),
                    value: 'teacher',
                  },
                ]}
                fullWidth
              />
            )}

            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack>
                {mode === 'register' && (
                  <TextInput
                    label="Name"
                    placeholder="Your name"
                    required
                    {...form.getInputProps('name')}
                  />
                )}

                <TextInput
                  label={t('auth.email')}
                  placeholder="your@email.com"
                  required
                  {...form.getInputProps('email')}
                />

                <PasswordInput
                  label={t('auth.password')}
                  placeholder="Your password"
                  required
                  {...form.getInputProps('password')}
                />

                {mode === 'register' && (
                  <PasswordInput
                    label={t('auth.confirmPassword')}
                    placeholder="Confirm your password"
                    required
                    {...form.getInputProps('confirmPassword')}
                  />
                )}

                <Button type="submit" fullWidth loading={isLoading} mt="xl">
                  {mode === 'login' ? t('auth.login') : t('auth.signup')}
                </Button>
              </Stack>
            </form>

            <Text c="dimmed" size="sm" ta="center" mt="md">
              {mode === 'login' ? t('auth.dontHaveAccount') : t('auth.alreadyHaveAccount')}{' '}
              <Text
                component="button"
                type="button"
                c="blue"
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              >
                {mode === 'login' ? t('auth.signup') : t('auth.login')}
              </Text>
            </Text>

            <Text c="dimmed" size="xs" ta="center" mt="md">
              Demo: Use any email/password combination
            </Text>
          </Stack>
        </Paper>
      </motion.div>
    </Container>
  );
};