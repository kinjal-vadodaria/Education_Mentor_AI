import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Group,
  Burger,
  Text,
  ActionIcon,
  Menu,
  Avatar,
  UnstyledButton,
  ThemeIcon,
  Select,
} from '@mantine/core';
import {
  IconBrain,
  IconSun,
  IconMoon,
  IconLogout,
  IconSettings,
  IconUser,
  IconWorld,
} from '@tabler/icons-react';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  opened: boolean;
  toggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ opened, toggle }) => {
  const { t, i18n } = useTranslation();
  const { user, signOut } = useAuth();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

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

  const handleLanguageChange = (value: string | null) => {
    if (value) {
      i18n.changeLanguage(value);
    }
  };

  return (
    <Group h="100%" px="md" justify="space-between">
      <Group>
        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Group gap="sm">
            <ThemeIcon
              size="lg"
              color={user?.role === 'student' ? 'indigo' : 'blue'}
              variant="light"
            >
              <IconBrain size={20} />
            </ThemeIcon>
            <div>
              <Text fw={700} size="lg">
                EduMentor AI
              </Text>
              <Text size="xs" c="dimmed">
                {user?.role === 'student' ? t('common.studentPortal') : t('common.teacherDashboard')}
              </Text>
            </div>
          </Group>
        </motion.div>
      </Group>

      <Group gap="sm">
        {/* Language Selector */}
        <Select
          data={languages}
          value={i18n.language}
          onChange={handleLanguageChange}
          leftSection={<IconWorld size={16} />}
          w={140}
          size="sm"
          searchable
        />

        {/* Theme Toggle */}
        <ActionIcon
          onClick={() => toggleColorScheme()}
          variant="subtle"
          size="lg"
          aria-label={colorScheme === 'dark' ? t('common.lightMode') : t('common.darkMode')}
        >
          {colorScheme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
        </ActionIcon>

        {/* User Menu */}
        <Menu shadow="md" width={200}>
          <Menu.Target>
            <UnstyledButton>
              <Group gap="sm">
                <Avatar size="sm" color={user?.role === 'student' ? 'indigo' : 'blue'}>
                  <IconUser size={16} />
                </Avatar>
                <div style={{ flex: 1 }}>
                  <Text size="sm" fw={500}>
                    {user?.name}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {user?.role === 'student' ? t('common.student') : t('common.teacher')}
                  </Text>
                </div>
              </Group>
            </UnstyledButton>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Label>Account</Menu.Label>
            <Menu.Item
              leftSection={<IconSettings size={14} />}
              onClick={() => window.dispatchEvent(new CustomEvent('changeTab', { detail: 'settings' }))}
            >
              {t('navigation.settings')}
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item
              leftSection={<IconLogout size={14} />}
              color="red"
              onClick={signOut}
            >
              {t('auth.logout')}
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Group>
  );
};