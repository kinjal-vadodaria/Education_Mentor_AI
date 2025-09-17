import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Clock, 
  Users, 
  Target, 
  BookOpen,
  Download,
  Share,
  Edit,
  Plus,
  Wand2,
  CheckCircle
} from 'lucide-react';
import { LessonPlan } from '../../types';
import { aiService } from '../../services/aiService';
import { cn } from '../../utils/cn';
import toast from 'react-hot-toast';

export const LessonPlanner: React.FC = () => {
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<LessonPlan | null>(null);
  
  // Form state
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('Physics');
  const [grade, setGrade] = useState('10');
  const [duration, setDuration] = useState(45);

  const subjects = ['Physics', 'Mathematics', 'Chemistry', 'Biology', 'History', 'Literature'];
  const grades = ['6', '7', '8', '9', '10', '11', '12'];

  const generateLessonPlan = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    setIsGenerating(true);
    try {
      const plan = await aiService.generateLessonPlan(topic, grade, duration);
      plan.subject = subject;
      setLessonPlans(prev => [plan, ...prev]);
      setSelectedPlan(plan);
      setShowGenerator(false);
      
      // Reset form
      setTopic('');
      setSubject('Physics');
      setGrade('10');
      setDuration(45);
      
      toast.success('Lesson plan generated successfully!');
    } catch (error) {
      toast.error('Failed to generate lesson plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const samplePlans: LessonPlan[] = [
    {
      id: '1',
      title: "Newton's Laws of Motion - Grade 10",
      subject: 'Physics',
      grade: '10',
      duration: 45,
      objectives: [
        'Students will understand the three laws of motion',
        'Students will apply Newton\'s laws to real-world scenarios',
        'Students will solve basic physics problems'
      ],
      materials: ['Whiteboard', 'Toy cars', 'Ramps', 'Balls', 'Video clips'],
      activities: [
        {
          id: '1',
          name: 'Introduction Hook',
          description: 'Demonstrate with toy cars and ramps',
          duration: 10,
          type: 'presentation'
        },
        {
          id: '2',
          name: 'Concept Explanation',
          description: 'Explain each law with examples',
          duration: 20,
          type: 'presentation'
        },
        {
          id: '3',
          name: 'Hands-on Activity',
          description: 'Students experiment with objects',
          duration: 10,
          type: 'hands-on'
        },
        {
          id: '4',
          name: 'Wrap-up Discussion',
          description: 'Review and Q&A',
          duration: 5,
          type: 'discussion'
        }
      ],
      assessment: 'Exit ticket with 3 questions about Newton\'s laws',
      createdBy: 'ai-assistant',
      createdAt: new Date()
    }
  ];

  const allPlans = [...lessonPlans, ...samplePlans];

  if (selectedPlan) {
    return (
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedPlan(null)}
            className="btn-secondary"
          >
            ← Back to Plans
          </motion.button>
          
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-secondary"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-secondary"
            >
              <Share className="h-4 w-4 mr-2" />
              Share
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </motion.button>
          </div>
        </div>

        {/* Lesson Plan Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Title Section */}
          <div className="card">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {selectedPlan.title}
                </h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center">
                    <BookOpen className="h-4 w-4 mr-1" />
                    {selectedPlan.subject}
                  </span>
                  <span className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    Grade {selectedPlan.grade}
                  </span>
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {selectedPlan.duration} minutes
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Created {selectedPlan.createdAt.toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Learning Objectives */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <Target className="h-5 w-5 mr-2 text-teacher-primary" />
              Learning Objectives
            </h2>
            <ul className="space-y-2">
              {selectedPlan.objectives.map((objective, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start space-x-2"
                >
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">{objective}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Materials */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Required Materials
            </h2>
            <div className="flex flex-wrap gap-2">
              {selectedPlan.materials.map((material, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="px-3 py-1 bg-teacher-primary/10 text-teacher-primary rounded-full text-sm"
                >
                  {material}
                </motion.span>
              ))}
            </div>
          </div>

          {/* Activities Timeline */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Lesson Activities
            </h2>
            <div className="space-y-4">
              {selectedPlan.activities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex-shrink-0">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold",
                      activity.type === 'presentation' ? 'bg-blue-500' :
                      activity.type === 'hands-on' ? 'bg-green-500' :
                      activity.type === 'discussion' ? 'bg-purple-500' :
                      'bg-orange-500'
                    )}>
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {activity.name}
                      </h3>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {activity.duration} min
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {activity.description}
                    </p>
                    <span className={cn(
                      "inline-block mt-2 px-2 py-1 text-xs rounded-full",
                      activity.type === 'presentation' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                      activity.type === 'hands-on' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                      activity.type === 'discussion' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' :
                      'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                    )}>
                      {activity.type}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Assessment */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Assessment Strategy
            </h2>
            <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              {selectedPlan.assessment}
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            AI Lesson Planner
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Generate comprehensive lesson plans with AI assistance
          </p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowGenerator(true)}
          className="btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Plan
        </motion.button>
      </div>

      {/* Generator Modal */}
      <AnimatePresence>
        {showGenerator && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowGenerator(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Generate Lesson Plan
                </h2>
                <Wand2 className="h-6 w-6 text-teacher-primary" />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Topic
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., Newton's Laws of Motion"
                    className="input-field"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Subject
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="input-field"
                    >
                      {subjects.map(subj => (
                        <option key={subj} value={subj}>{subj}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Grade
                    </label>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="input-field"
                    >
                      {grades.map(g => (
                        <option key={g} value={g}>Grade {g}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    min="15"
                    max="120"
                    step="15"
                    className="input-field"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowGenerator(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={generateLessonPlan}
                  disabled={isGenerating || !topic.trim()}
                  className={cn(
                    "flex-1 btn-primary",
                    (isGenerating || !topic.trim()) && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Generate
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lesson Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allPlans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card hover:shadow-xl cursor-pointer group"
            onClick={() => setSelectedPlan(plan)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-teacher-primary/10 rounded-lg">
                <FileText className="h-6 w-6 text-teacher-primary" />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {plan.createdAt.toLocaleDateString()}
              </span>
            </div>

            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-teacher-primary transition-colors">
              {plan.title}
            </h3>

            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
              <span className="flex items-center">
                <BookOpen className="h-3 w-3 mr-1" />
                {plan.subject}
              </span>
              <span className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {plan.duration}m
              </span>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {plan.objectives.length} learning objectives
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {plan.activities.length} activities planned
              </p>
            </div>

            <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center justify-center space-x-2 text-sm text-teacher-primary">
                <FileText className="h-4 w-4" />
                <span>View Details</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {allPlans.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No lesson plans yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Create your first AI-generated lesson plan to get started
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowGenerator(true)}
            className="btn-primary"
          >
            <Wand2 className="h-4 w-4 mr-2" />
            Generate Lesson Plan
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};