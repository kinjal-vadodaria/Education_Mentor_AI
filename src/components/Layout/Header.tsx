import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Group,
  Burger,
  Text,
  ActionIcon,
  Menu,
  Avatar,
  Select,
  useMantineColorScheme,
  ThemeIcon,
} from '@mantine/core';
import {
  IconSun,
  IconMoon,
  IconBell,
  IconSettings,
  IconLogout,
  IconGraduationCap,
  IconWorld,
} from '@tabler/icons-react';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  opened: boolean;
  toggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ opened, toggle }) => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  const languages = [
    { value: 'en', label: '🇺🇸 English' },
    { value: 'es', label: '🇪🇸 Español' },
    { value: 'hi', label: '🇮🇳 हिंदी' },
    { value: 'zh', label: '🇨🇳 中文' },
    { value: 'ar', label: '🇸🇦 العربية' },
    { value: 'fr', label: '🇫🇷 Français' },
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
        
        <Group gap="xs">
          <ThemeIcon
            size="lg"
            radius="md"
            variant="gradient"
            gradient={
              user?.role === 'student'
                ? { from: 'indigo', to: 'purple' }
                : { from: 'blue', to: 'cyan' }
            }
          >
            <IconGraduationCap size={20} />
          </ThemeIcon>
          
          <div>
            <Text size="lg" fw={700} c={user?.role === 'student' ? 'indigo' : 'blue'}>
              EduMentor AI
            </Text>
            <Text size="xs" c="dimmed">
              {user?.role === 'student' ? 'Student Portal' : 'Teacher Dashboard'}
            </Text>
          </div>
        </Group>
      </Group>

      <Group>
        <Select
          data={languages}
          value={i18n.language}
          onChange={handleLanguageChange}
          leftSection={<IconWorld size={16} />}
          w={140}
          size="xs"
        />

        <ActionIcon
          variant="subtle"
          onClick={() => toggleColorScheme()}
          size="lg"
        >
          {colorScheme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
        </ActionIcon>

        <ActionIcon variant="subtle" size="lg">
          <IconBell size={18} />
        </ActionIcon>

        <Menu shadow="md" width={200}>
          <Menu.Target>
            <Group style={{ cursor: 'pointer' }}>
              <Avatar size="sm" radius="xl">
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
              <div style={{ flex: 1 }}>
                <Text size="sm" fw={500}>
                  {user?.name}
                </Text>
                <Text size="xs" c="dimmed">
                  {user?.role}
                </Text>
              </div>
            </Group>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Item leftSection={<IconSettings size={14} />}>
              {t('navigation.settings')}
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item
              leftSection={<IconLogout size={14} />}
              color="red"
              onClick={logout}
            >
              {t('auth.logout')}
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Group>
  );
};