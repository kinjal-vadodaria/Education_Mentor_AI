import React from 'react';
import { motion } from 'framer-motion';
import { 
  Home,
  MessageCircle,
  BookOpen,
  Trophy,
  BarChart3,
  Users,
  FileText,
  Settings,
  Brain,
  Target
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../utils/cn';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, className }) => {
  const { user } = useAuth();
  const isStudent = user?.role === 'student';

  const studentTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'tutor', label: 'AI Tutor', icon: Brain },
    { id: 'quizzes', label: 'Quizzes', icon: Target },
    { id: 'progress', label: 'Progress', icon: Trophy },
    { id: 'library', label: 'Library', icon: BookOpen },
  ];

  const teacherTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'lesson-planner', label: 'Lesson Planner', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'resources', label: 'Resources', icon: BookOpen },
  ];

  const tabs = isStudent ? studentTabs : teacherTabs;

  return (
    <aside className={cn(
      "w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full",
      className
    )}>
      <div className="p-6">
        <nav className="space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <motion.button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200",
                  isActive
                    ? isStudent
                      ? "bg-gradient-to-r from-student-primary/10 to-student-secondary/10 text-student-primary border-l-4 border-student-primary"
                      : "bg-gradient-to-r from-teacher-primary/10 to-teacher-secondary/10 text-teacher-primary border-l-4 border-teacher-primary"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
                )}
              >
                <Icon className={cn(
                  "h-5 w-5",
                  isActive 
                    ? isStudent ? "text-student-primary" : "text-teacher-primary"
                    : "text-gray-500 dark:text-gray-400"
                )} />
                <span className="font-medium">{tab.label}</span>
              </motion.button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};