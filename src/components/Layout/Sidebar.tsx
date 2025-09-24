import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
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
  activeTab?: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onTabChange }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const studentTabs = [
    { id: 'dashboard', label: t('navigation.dashboard'), icon: IconHome, path: '/student/dashboard' },
    { id: 'ai-tutor', label: t('navigation.aiTutor'), icon: IconBrain, path: '/student/ai-tutor' },
    { id: 'quizzes', label: t('navigation.quizzes'), icon: IconTarget, path: '/student/quizzes' },
    { id: 'progress', label: t('navigation.progress'), icon: IconTrophy, path: '/student/progress' },
    { id: 'library', label: t('navigation.library'), icon: IconBook, path: '/student/library' },
  ];

  const teacherTabs = [
    { id: 'dashboard', label: t('navigation.dashboard'), icon: IconHome, path: '/teacher/dashboard' },
    { id: 'lesson-planner', label: t('navigation.lessonPlanner'), icon: IconFileText, path: '/teacher/lesson-planner' },
    { id: 'analytics', label: t('navigation.analytics'), icon: IconChartBar, path: '/teacher/analytics' },
    { id: 'students', label: t('navigation.students'), icon: IconUsers, path: '/teacher/students' },
    { id: 'resources', label: t('navigation.resources'), icon: IconFolder, path: '/teacher/resources' },
  ];

  const tabs = user?.role === 'student' ? studentTabs : teacherTabs;
  const primaryColor = user?.role === 'student' ? 'indigo' : 'blue';

  const handleTabClick = (tab: typeof tabs[0]) => {
    navigate(tab.path);
    onTabChange(tab.id);
  };

  // Get current active tab from URL
  const getCurrentTab = () => {
    const currentPath = location.pathname;
    const currentTab = tabs.find(tab => tab.path === currentPath);
    return currentTab?.id || 'dashboard';
  };

  return (
    <Stack gap="xs">
      <Text size="xs" tt="uppercase" fw={700} c="dimmed" px="sm">
        {t('common.navigation')}
      </Text>
      
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = getCurrentTab() === tab.id;
        
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
              onClick={() => handleTabClick(tab)}
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