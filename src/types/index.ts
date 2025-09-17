export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher';
  avatar?: string;
  preferences: {
    language: string;
    theme: 'light' | 'dark';
    difficulty: 'beginner' | 'intermediate' | 'advanced';
  };
}

export interface Student extends User {
  role: 'student';
  progress: {
    level: number;
    xp: number;
    streak: number;
    badges: Badge[];
    completedTopics: string[];
  };
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
}

export interface Teacher extends User {
  role: 'teacher';
  subjects: string[];
  classes: ClassRoom[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
}

export interface Quiz {
  id: string;
  title: string;
  questions: Question[];
  topic: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timeLimit?: number;
}

export interface Question {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'drag-drop';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  points: number;
}

export interface QuizResult {
  id: string;
  quizId: string;
  studentId: string;
  answers: Record<string, string>;
  score: number;
  totalPoints: number;
  completedAt: Date;
  timeSpent: number;
}

export interface LessonPlan {
  id: string;
  title: string;
  subject: string;
  grade: string;
  duration: number;
  objectives: string[];
  materials: string[];
  activities: Activity[];
  assessment: string;
  createdBy: string;
  createdAt: Date;
}

export interface Activity {
  id: string;
  name: string;
  description: string;
  duration: number;
  type: 'discussion' | 'hands-on' | 'presentation' | 'group-work';
}

export interface ClassRoom {
  id: string;
  name: string;
  subject: string;
  grade: string;
  students: string[];
  teacherId: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type: 'text' | 'quiz' | 'explanation' | 'feedback';
  metadata?: {
    topic?: string;
    difficulty?: string;
    language?: string;
  };
}

export interface AIResponse {
  content: string;
  type: 'explanation' | 'quiz' | 'lesson-plan' | 'feedback';
  confidence: number;
  suggestions?: string[];
  followUp?: string[];
}

export interface PerformanceMetrics {
  studentId: string;
  subject: string;
  averageScore: number;
  completionRate: number;
  timeSpent: number;
  weakAreas: string[];
  strongAreas: string[];
  recommendations: string[];
}