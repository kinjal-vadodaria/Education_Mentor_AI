import React from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Target, 
  Trophy, 
  Flame, 
  BookOpen, 
  Clock,
  TrendingUp,
  Star
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Student } from '../../types';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const student = user as Student;

  const stats = [
    {
      label: 'Current Level',
      value: student?.progress?.level || 1,
      icon: Trophy,
      color: 'text-yellow-500',
      bg: 'bg-yellow-50 dark:bg-yellow-900/20'
    },
    {
      label: 'Learning Streak',
      value: `${student?.progress?.streak || 0} days`,
      icon: Flame,
      color: 'text-orange-500',
      bg: 'bg-orange-50 dark:bg-orange-900/20'
    },
    {
      label: 'Topics Completed',
      value: student?.progress?.completedTopics?.length || 0,
      icon: BookOpen,
      color: 'text-green-500',
      bg: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      label: 'Total XP',
      value: student?.progress?.xp || 0,
      icon: Star,
      color: 'text-purple-500',
      bg: 'bg-purple-50 dark:bg-purple-900/20'
    }
  ];

  const recentActivities = [
    { topic: 'Newton\'s Laws', type: 'Quiz Completed', score: '85%', time: '2 hours ago' },
    { topic: 'Algebra Basics', type: 'Lesson Finished', score: '92%', time: '1 day ago' },
    { topic: 'Geometry', type: 'Practice Session', score: '78%', time: '2 days ago' }
  ];

  const recommendations = [
    { title: 'Review Newton\'s Third Law', reason: 'Based on quiz performance', difficulty: 'Medium' },
    { title: 'Advanced Algebra Problems', reason: 'You\'re ready for the next level!', difficulty: 'Hard' },
    { title: 'Physics Experiments', reason: 'Visual learning style detected', difficulty: 'Easy' }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="student-theme rounded-xl p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Welcome back, {student?.name}! 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Ready to continue your learning journey?
            </p>
          </div>
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="text-4xl"
          >
            🎓
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
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {stat.value}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Recent Activities
            </h2>
            <Clock className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {recentActivities.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {activity.topic}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {activity.type}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-student-primary">
                    {activity.score}
                  </p>
                  <p className="text-xs text-gray-500">
                    {activity.time}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* AI Recommendations */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              AI Recommendations
            </h2>
            <Brain className="h-5 w-5 text-student-primary" />
          </div>
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-student-primary/50 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {rec.title}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {rec.reason}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    rec.difficulty === 'Easy' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : rec.difficulty === 'Medium'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {rec.difficulty}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card"
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center space-x-3 p-4 bg-gradient-to-r from-student-primary/10 to-student-secondary/10 rounded-lg border border-student-primary/20 hover:border-student-primary/40 transition-colors"
          >
            <Brain className="h-6 w-6 text-student-primary" />
            <div className="text-left">
              <p className="font-medium text-gray-900 dark:text-gray-100">Ask AI Tutor</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Get instant help</p>
            </div>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20 hover:border-green-500/40 transition-colors"
          >
            <Target className="h-6 w-6 text-green-500" />
            <div className="text-left">
              <p className="font-medium text-gray-900 dark:text-gray-100">Take Quiz</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Test your knowledge</p>
            </div>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20 hover:border-purple-500/40 transition-colors"
          >
            <TrendingUp className="h-6 w-6 text-purple-500" />
            <div className="text-left">
              <p className="font-medium text-gray-900 dark:text-gray-100">View Progress</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Track improvement</p>
            </div>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};