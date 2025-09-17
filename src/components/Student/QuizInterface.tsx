import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Trophy,
  RefreshCw,
  Brain,
  Zap,
  Star
} from 'lucide-react';
import { Quiz, Question, QuizResult } from '../../types';
import { aiService } from '../../services/aiService';
import { cn } from '../../utils/cn';
import toast from 'react-hot-toast';

export const QuizInterface: React.FC = () => {
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [quizResult, setQuizResult] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  const topics = [
    { name: "Newton's Laws", difficulty: 'intermediate', icon: '⚡' },
    { name: 'Photosynthesis', difficulty: 'beginner', icon: '🌱' },
    { name: 'Algebra Basics', difficulty: 'intermediate', icon: '📐' },
    { name: 'World History', difficulty: 'advanced', icon: '🏛️' },
    { name: 'Chemistry Bonds', difficulty: 'advanced', icon: '🧪' },
    { name: 'Literature Analysis', difficulty: 'intermediate', icon: '📚' }
  ];

  useEffect(() => {
    if (currentQuiz && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && currentQuiz && !showResults) {
      handleSubmitQuiz();
    }
  }, [timeLeft, currentQuiz, showResults]);

  const startQuiz = async (topic: string, difficulty: string) => {
    setIsLoading(true);
    try {
      const quiz = await aiService.generateQuiz(topic, difficulty);
      setCurrentQuiz(quiz);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setShowResults(false);
      setTimeLeft(quiz.timeLimit || 300);
      toast.success(`Quiz started: ${topic}`);
    } catch (error) {
      toast.error('Failed to generate quiz. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < (currentQuiz?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleSubmitQuiz();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!currentQuiz) return;

    setIsLoading(true);
    try {
      const result = await aiService.gradeQuiz(currentQuiz, answers);
      setQuizResult(result);
      setShowResults(true);
      
      const percentage = (result.score / result.totalPoints) * 100;
      if (percentage >= 90) {
        toast.success('Excellent work! 🎉');
      } else if (percentage >= 70) {
        toast.success('Good job! 👍');
      } else {
        toast('Keep practicing! 💪', { icon: '📚' });
      }
    } catch (error) {
      toast.error('Failed to grade quiz. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetQuiz = () => {
    setCurrentQuiz(null);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setShowResults(false);
    setQuizResult(null);
    setTimeLeft(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-student-primary mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Generating your personalized quiz...
          </p>
        </div>
      </div>
    );
  }

  if (showResults && quizResult) {
    const percentage = (quizResult.score / quizResult.totalPoints) * 100;
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto"
      >
        <div className="card text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mb-6"
          >
            {percentage >= 90 ? (
              <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            ) : percentage >= 70 ? (
              <Star className="h-16 w-16 text-blue-500 mx-auto mb-4" />
            ) : (
              <Target className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            )}
          </motion.div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Quiz Complete!
          </h2>
          
          <div className="text-4xl font-bold mb-4">
            <span className={cn(
              percentage >= 90 ? 'text-green-500' :
              percentage >= 70 ? 'text-blue-500' :
              percentage >= 50 ? 'text-yellow-500' : 'text-red-500'
            )}>
              {percentage.toFixed(0)}%
            </span>
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You scored {quizResult.score} out of {quizResult.totalPoints} points
          </p>

          {/* Feedback */}
          <div className="text-left mb-6 space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Detailed Feedback:
            </h3>
            {quizResult.feedback.map((feedback: string, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm"
              >
                {feedback}
              </motion.div>
            ))}
          </div>

          {/* Suggestions */}
          <div className="text-left mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Recommendations:
            </h3>
            <div className="space-y-2">
              {quizResult.suggestions.map((suggestion: string, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400"
                >
                  <Zap className="h-4 w-4 text-student-primary" />
                  <span>{suggestion}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="flex space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetQuiz}
              className="flex-1 btn-primary"
            >
              Take Another Quiz
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => startQuiz(currentQuiz?.topic || "Newton's Laws", 'intermediate')}
              className="flex-1 btn-secondary"
            >
              Retry This Quiz
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  if (currentQuiz) {
    const currentQuestion = currentQuiz.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100;

    return (
      <div className="max-w-2xl mx-auto">
        {/* Quiz Header */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {currentQuiz.title}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Question {currentQuestionIndex + 1} of {currentQuiz.questions.length}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="h-4 w-4" />
                <span className={cn(
                  timeLeft < 60 ? 'text-red-500 font-bold' : ''
                )}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="bg-gradient-to-r from-student-primary to-student-secondary h-2 rounded-full"
            />
          </div>
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="card"
          >
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                {currentQuestion.question}
              </h3>

              {currentQuestion.type === 'multiple-choice' && (
                <div className="space-y-3">
                  {currentQuestion.options?.map((option, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswerSelect(currentQuestion.id, option)}
                      className={cn(
                        "w-full p-4 text-left rounded-lg border-2 transition-all duration-200",
                        answers[currentQuestion.id] === option
                          ? "border-student-primary bg-student-primary/10 text-student-primary"
                          : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-700"
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={cn(
                          "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                          answers[currentQuestion.id] === option
                            ? "border-student-primary bg-student-primary"
                            : "border-gray-300 dark:border-gray-600"
                        )}>
                          {answers[currentQuestion.id] === option && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                        <span className="text-gray-900 dark:text-gray-100">
                          {option}
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className={cn(
                  "px-6 py-2 rounded-lg transition-all duration-200",
                  currentQuestionIndex === 0
                    ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                    : "btn-secondary"
                )}
              >
                Previous
              </motion.button>

              <span className="text-sm text-gray-500 dark:text-gray-400">
                {Object.keys(answers).length} of {currentQuiz.questions.length} answered
              </span>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNextQuestion}
                disabled={!answers[currentQuestion.id]}
                className={cn(
                  "px-6 py-2 rounded-lg transition-all duration-200",
                  !answers[currentQuestion.id]
                    ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                    : currentQuestionIndex === currentQuiz.questions.length - 1
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                    : "btn-primary"
                )}
              >
                {currentQuestionIndex === currentQuiz.questions.length - 1 ? 'Submit' : 'Next'}
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-student-primary to-student-secondary rounded-full mb-4"
        >
          <Target className="h-8 w-8 text-white" />
        </motion.div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Interactive Quizzes
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Test your knowledge with AI-generated quizzes
        </p>
      </div>

      {/* Topic Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topics.map((topic, index) => (
          <motion.div
            key={topic.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card hover:shadow-xl cursor-pointer group"
            onClick={() => startQuiz(topic.name, topic.difficulty)}
          >
            <div className="text-center">
              <div className="text-4xl mb-4 group-hover:animate-bounce-gentle">
                {topic.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {topic.name}
              </h3>
              <span className={cn(
                "inline-block px-3 py-1 text-xs rounded-full font-medium",
                topic.difficulty === 'beginner' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  : topic.difficulty === 'intermediate'
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
              )}>
                {topic.difficulty}
              </span>
              <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center justify-center space-x-2 text-sm text-student-primary">
                  <Brain className="h-4 w-4" />
                  <span>Start Quiz</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};