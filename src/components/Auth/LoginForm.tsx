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
  Divider,
  Select,
  NumberInput,
  Center,
  ThemeIcon,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconBrain, IconUser, IconChalkboard } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { notifications } from '@mantine/notifications';

export const LoginForm: React.FC = () => {
  const { t } = useTranslation();
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      role: 'student' as 'student' | 'teacher',
      gradeLevel: 10,
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => (value.length < 6 ? 'Password must be at least 6 characters' : null),
      confirmPassword: (value, values) =>
        !isLogin && value !== values.password ? 'Passwords do not match' : null,
      name: (value) => (!isLogin && !value ? 'Name is required' : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setIsLoading(true);
    try {
      if (isLogin) {
        await signIn(values.email, values.password);
        notifications.show({
          title: 'Welcome back!',
          message: 'Successfully signed in',
          color: 'green',
        });
      } else {
        await signUp(
          values.email,
          values.password,
          values.name,
          values.role,
          values.role === 'student' ? values.gradeLevel : undefined
        );
        notifications.show({
          title: 'Account created!',
          message: 'Welcome to EduMentor AI',
          color: 'green',
        });
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Something went wrong';
      notifications.show({
        title: 'Error',
        message: message,
        color: 'red',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container size="sm" py="xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Center mb="xl">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <ThemeIcon size={80} color="indigo" variant="light">
              <IconBrain size={40} />
            </ThemeIcon>
          </motion.div>
        </Center>

        <Paper shadow="md" p="xl" radius="md" withBorder>
          <Stack gap="lg">
            <div style={{ textAlign: 'center' }}>
              <Title order={2} mb="xs">
                {isLogin ? t('auth.welcomeBack') : t('auth.createAccount')}
              </Title>
              <Text c="dimmed" size="lg">
                {isLogin 
                  ? 'Sign in to continue your learning journey'
                  : 'Join thousands of learners worldwide'
                }
              </Text>
            </div>

            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack gap="md">
                {!isLogin && (
                  <>
                    <TextInput
                      label={t('auth.name')}
                      placeholder="Your full name"
                      {...form.getInputProps('name')}
                    />

                    <Select
                      label="Account Type"
                      data={[
                        { value: 'student', label: '👨‍🎓 Student' },
                        { value: 'teacher', label: '👩‍🏫 Teacher' },
                      ]}
                      {...form.getInputProps('role')}
                      leftSection={
                        form.values.role === 'student' ? (
                          <IconUser size={16} />
                        ) : (
                          <IconChalkboard size={16} />
                        )
                      }
                    />

                    {form.values.role === 'student' && (
                      <NumberInput
                        label="Grade Level"
                        min={1}
                        max={12}
                        {...form.getInputProps('gradeLevel')}
                      />
                    )}
                  </>
                )}

                <TextInput
                  label={t('auth.email')}
                  placeholder="your@email.com"
                  {...form.getInputProps('email')}
                />

                <PasswordInput
                  label={t('auth.password')}
                  placeholder="Your password"
                  {...form.getInputProps('password')}
                />

                {!isLogin && (
                  <PasswordInput
                    label={t('auth.confirmPassword')}
                    placeholder="Confirm your password"
                    {...form.getInputProps('confirmPassword')}
                  />
                )}

                <Button
                  type="submit"
                  loading={isLoading}
                  size="lg"
                  variant="gradient"
                  gradient={{ from: 'indigo', to: 'purple' }}
                  fullWidth
                >
                  {isLogin ? t('auth.login') : t('auth.signup')}
                </Button>
              </Stack>
            </form>

            <Divider label="or" labelPosition="center" />

            <Group justify="center">
              <Text size="sm" c="dimmed">
                {isLogin ? t('auth.dontHaveAccount') : t('auth.alreadyHaveAccount')}
              </Text>
              <Button
                variant="subtle"
                onClick={() => {
                  setIsLogin(!isLogin);
                  form.reset();
                }}
              >
                {isLogin ? t('auth.signup') : t('auth.login')}
              </Button>
            </Group>

            {/* Demo Accounts */}
            <Paper p="md" style={{ backgroundColor: 'var(--mantine-color-gray-0)' }} radius="sm">
              <Text size="sm" fw={500} mb="xs">
                🚀 Demo Accounts (Click to auto-fill):
              </Text>
              <Group gap="xs">
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => {
                    form.setValues({
                      email: 'student@demo.com',
                      password: 'demo123',
                    });
                  }}
                >
                  👨‍🎓 Student Demo
                </Button>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => {
                    form.setValues({
                      email: 'teacher@demo.com',
                      password: 'demo123',
                    });
                  }}
                >
                  👩‍🏫 Teacher Demo
                </Button>
              </Group>
              <Text size="xs" c="dimmed" mt="xs">
                Use these accounts to test the app without creating new accounts
              </Text>
            </Paper>
          </Stack>
        </Paper>
      </motion.div>
    </Container>
  );
};