import { } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Stack, NavLink, Text, ThemeIcon } from '@mantine/core';
import {
  IconHome,
  IconBrain,
  IconTarget,
  IconTrophy,
  IconBook,
  IconFileText,
  IconChartBar,
  IconUsers,
  IconFolder,
} from '@tabler/icons-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const studentTabs = [
    { id: 'dashboard', label: t('navigation.dashboard'), icon: IconHome },
    { id: 'ai-tutor', label: t('navigation.aiTutor'), icon: IconBrain },
    { id: 'quizzes', label: t('navigation.quizzes'), icon: IconTarget },
    { id: 'progress', label: t('navigation.progress'), icon: IconTrophy },
    { id: 'library', label: t('navigation.library'), icon: IconBook },
  ];

  const teacherTabs = [
    { id: 'dashboard', label: t('navigation.dashboard'), icon: IconHome },
    { id: 'lesson-planner', label: t('navigation.lessonPlanner'), icon: IconFileText },
    { id: 'analytics', label: t('navigation.analytics'), icon: IconChartBar },
    { id: 'students', label: t('navigation.students'), icon: IconUsers },
    { id: 'resources', label: t('navigation.resources'), icon: IconFolder },
  ];

  const tabs = user?.role === 'student' ? studentTabs : teacherTabs;
  const primaryColor = user?.role === 'student' ? 'indigo' : 'blue';

  return (
    <Stack gap="xs">
      <Text size="xs" tt="uppercase" fw={700} c="dimmed" px="sm">
        {t('common.navigation')}
      </Text>
      
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <motion.div
            key={tab.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <NavLink
              active={isActive}
              label={tab.label}
              leftSection={
                <ThemeIcon
                  size="sm"
                  variant={isActive ? 'filled' : 'light'}
                  color={primaryColor}
                >
                  <Icon size={16} />
                </ThemeIcon>
              }
              onClick={() => onTabChange(tab.id)}
              style={{
                borderRadius: 8,
              }}
            />
          </motion.div>
        );
      })}
    </Stack>
  );
};