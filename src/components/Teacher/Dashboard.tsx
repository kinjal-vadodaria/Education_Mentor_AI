import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Clock,
  Award,
  AlertCircle,
  CheckCircle,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Teacher } from '../../types';

export const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const teacher = user as Teacher;

  const stats = [
    {
      label: 'Total Students',
      value: 156,
      icon: Users,
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      change: '+12 this month'
    },
    {
      label: 'Active Classes',
      value: 8,
      icon: BookOpen,
      color: 'text-green-500',
      bg: 'bg-green-50 dark:bg-green-900/20',
      change: '2 new classes'
    },
    {
      label: 'Avg. Performance',
      value: '87%',
      icon: TrendingUp,
      color: 'text-purple-500',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      change: '+5% from last week'
    },
    {
      label: 'Hours Taught',
      value: 342,
      icon: Clock,
      color: 'text-orange-500',
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      change: '28 hours this week'
    }
  ];

  const recentActivities = [
    { 
      type: 'lesson_created', 
      title: 'Created lesson plan for "Newton\'s Laws"', 
      time: '2 hours ago',
      icon: BookOpen,
      color: 'text-green-500'
    },
    { 
      type: 'quiz_graded', 
      title: 'Auto-graded 25 physics quizzes', 
      time: '4 hours ago',
      icon: CheckCircle,
      color: 'text-blue-500'
    },
    { 
      type: 'student_help', 
      title: 'Sarah Johnson requested help with calculus', 
      time: '6 hours ago',
      icon: AlertCircle,
      color: 'text-yellow-500'
    },
    { 
      type: 'performance_review', 
      title: 'Weekly performance report generated', 
      time: '1 day ago',
      icon: BarChart3,
      color: 'text-purple-500'
    }
  ];

  const upcomingClasses = [
    { subject: 'Physics', grade: '11th', time: '9:00 AM', students: 28, room: 'Lab 1' },
    { subject: 'Mathematics', grade: '10th', time: '11:00 AM', students: 32, room: 'Room 205' },
    { subject: 'Physics', grade: '12th', time: '2:00 PM', students: 24, room: 'Lab 2' }
  ];

  const performanceAlerts = [
    { student: 'Alex Chen', subject: 'Physics', issue: 'Struggling with momentum concepts', severity: 'medium' },
    { student: 'Maria Garcia', subject: 'Math', issue: 'Excellent progress in calculus', severity: 'positive' },
    { student: 'John Smith', subject: 'Physics', issue: 'Missing assignments', severity: 'high' }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="teacher-theme rounded-xl p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Welcome back, {teacher?.name}! 👨‍🏫
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Ready to inspire minds today?
            </p>
          </div>
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="text-4xl"
          >
            📚
          </motion.div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card hover:shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {stat.change}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Classes */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Today's Schedule
            </h2>
            <Clock className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {upcomingClasses.map((class_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {class_.subject} - Grade {class_.grade}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {class_.students} students • {class_.room}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-teacher-primary">
                    {class_.time}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Recent Activities
            </h2>
            <Award className="h-5 w-5 text-teacher-primary" />
          </div>
          <div className="space-y-3">
            {recentActivities.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-start space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <div className={`p-1 rounded ${activity.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {activity.time}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Performance Alerts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Student Performance Alerts
          </h2>
          <AlertCircle className="h-5 w-5 text-yellow-500" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {performanceAlerts.map((alert, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className={`p-4 rounded-lg border-l-4 ${
                alert.severity === 'high' 
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                  : alert.severity === 'medium'
                  ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                  : 'border-green-500 bg-green-50 dark:bg-green-900/20'
              }`}
            >
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {alert.student}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {alert.subject}
              </p>
              <p className="text-sm mt-2">
                {alert.issue}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="card"
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center space-x-3 p-4 bg-gradient-to-r from-teacher-primary/10 to-teacher-secondary/10 rounded-lg border border-teacher-primary/20 hover:border-teacher-primary/40 transition-colors"
          >
            <BookOpen className="h-6 w-6 text-teacher-primary" />
            <div className="text-left">
              <p className="font-medium text-gray-900 dark:text-gray-100">Create Lesson</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">AI-powered plans</p>
            </div>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20 hover:border-green-500/40 transition-colors"
          >
            <CheckCircle className="h-6 w-6 text-green-500" />
            <div className="text-left">
              <p className="font-medium text-gray-900 dark:text-gray-100">Grade Assignments</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Auto-grading</p>
            </div>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20 hover:border-purple-500/40 transition-colors"
          >
            <BarChart3 className="h-6 w-6 text-purple-500" />
            <div className="text-left">
              <p className="font-medium text-gray-900 dark:text-gray-100">View Analytics</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Class insights</p>
            </div>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center space-x-3 p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg border border-orange-500/20 hover:border-orange-500/40 transition-colors"
          >
            <Users className="h-6 w-6 text-orange-500" />
            <div className="text-left">
              <p className="font-medium text-gray-900 dark:text-gray-100">Manage Students</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Class roster</p>
            </div>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};