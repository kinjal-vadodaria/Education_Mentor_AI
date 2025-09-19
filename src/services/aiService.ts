import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase, saveChatMessage, saveQuizResult, updateStudentProgress } from './supabase';

const API_KEY = import.meta.env.VITE_GOOGLE_AI_API_KEY || 'your-google-ai-api-key';

export interface AIResponse {
  content: string;
  type: 'explanation' | 'quiz' | 'lesson-plan' | 'feedback';
  confidence: number;
  suggestions?: string[];
  followUp?: string[];
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
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  points: number;
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
  createdAt: Date;
}

export interface Activity {
  id: string;
  name: string;
  description: string;
  duration: number;
  type: 'discussion' | 'hands-on' | 'presentation' | 'group-work';
}

class AIService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  constructor() {
    if (API_KEY && API_KEY !== 'your-google-ai-api-key') {
      this.genAI = new GoogleGenerativeAI(API_KEY);
      this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
    }
  }

  async generateExplanation(
    topic: string,
    difficulty: string = 'intermediate',
    language: string = 'en',
    gradeLevel?: number,
    userId?: string,
    sessionId?: string
  ): Promise<AIResponse> {
    try {
      if (!this.model) {
        // Fallback for demo
        return this.getFallbackExplanation(topic, difficulty);
      }

      const prompt = this.buildExplanationPrompt(topic, difficulty, language, gradeLevel);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();

      // Save to database if user is logged in
      if (userId && sessionId) {
        await saveChatMessage({
          user_id: userId,
          message: topic,
          response: content,
          timestamp: new Date().toISOString(),
          session_id: sessionId,
        });
      }

      return {
        content,
        type: 'explanation',
        confidence: 0.95,
        suggestions: [
          "Would you like me to create a quiz on this topic?",
          "Should I explain this with more examples?",
          "Would you like to see this concept in action?"
        ],
        followUp: [
          "What part would you like me to explain further?",
          "How does this relate to what you already know?"
        ]
      };
    } catch (error) {
      console.error('AI Service Error:', error);
      return this.getFallbackExplanation(topic, difficulty);
    }
  }

  async generateQuiz(
    topic: string,
    difficulty: string = 'intermediate',
    questionCount: number = 5,
    userId?: string
  ): Promise<Quiz> {
    try {
      if (!this.model) {
        return this.getFallbackQuiz(topic, difficulty);
      }

      const prompt = this.buildQuizPrompt(topic, difficulty, questionCount);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();

      // Parse AI response to create quiz structure
      const quiz = this.parseQuizFromAI(content, topic, difficulty);
      
      return quiz;
    } catch (error) {
      console.error('Quiz Generation Error:', error);
      return this.getFallbackQuiz(topic, difficulty);
    }
  }

  async generateLessonPlan(
    topic: string,
    grade: string,
    duration: number = 45,
    subject: string = 'General'
  ): Promise<LessonPlan> {
    try {
      if (!this.model) {
        return this.getFallbackLessonPlan(topic, grade, duration, subject);
      }

      const prompt = this.buildLessonPlanPrompt(topic, grade, duration, subject);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();

      // Parse AI response to create lesson plan structure
      const lessonPlan = this.parseLessonPlanFromAI(content, topic, grade, duration, subject);
      
      return lessonPlan;
    } catch (error) {
      console.error('Lesson Plan Generation Error:', error);
      return this.getFallbackLessonPlan(topic, grade, duration, subject);
    }
  }

  async gradeQuiz(
    quiz: Quiz,
    answers: Record<string, string>,
    userId?: string
  ): Promise<{
    score: number;
    totalPoints: number;
    feedback: string[];
    suggestions: string[];
    xpGained: number;
  }> {
    let score = 0;
    const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
    const feedback: string[] = [];
    let correctAnswers = 0;

    quiz.questions.forEach(question => {
      const userAnswer = answers[question.id];
      const isCorrect = userAnswer === question.correctAnswer;
      
      if (isCorrect) {
        score += question.points;
        correctAnswers++;
        feedback.push(`✅ Question ${question.id}: Correct! ${question.explanation}`);
      } else {
        feedback.push(`❌ Question ${question.id}: Incorrect. ${question.explanation}`);
      }
    });

    const percentage = (score / totalPoints) * 100;
    const xpGained = correctAnswers * 10 + (percentage >= 80 ? 50 : 0); // Bonus XP for high scores

    const suggestions = percentage < 70 
      ? ["Review the concepts again", "Try some practice problems", "Ask for help with specific topics"]
      : percentage < 90
      ? ["Great job! Try some advanced problems", "Explore related topics"]
      : ["Excellent work! You've mastered this topic", "Ready for more challenging material"];

    // Save quiz result and update progress if user is logged in
    if (userId) {
      await saveQuizResult({
        user_id: userId,
        quiz_topic: quiz.topic,
        score,
        total_questions: quiz.questions.length,
        completed_at: new Date().toISOString(),
        time_taken: 300, // Default time for demo
      });

      // Update student progress
      await updateStudentProgress(userId, quiz.topic, {
        xp_points: xpGained,
        current_streak: 1, // Simplified for demo
        level: percentage >= 90 ? 'advanced' : percentage >= 70 ? 'intermediate' : 'beginner',
        badges: percentage >= 90 ? ['quiz_master'] : [],
      });
    }

    return { score, totalPoints, feedback, suggestions, xpGained };
  }

  private buildExplanationPrompt(topic: string, difficulty: string, language: string, gradeLevel?: number): string {
    const gradeContext = gradeLevel ? `for grade ${gradeLevel} students` : '';
    const difficultyContext = difficulty === 'beginner' ? 'in simple terms' : 
                             difficulty === 'advanced' ? 'with detailed technical explanations' : 
                             'with clear examples and moderate detail';

    return `Explain "${topic}" ${difficultyContext} ${gradeContext} in ${language}. 
            Make it engaging and educational. Use analogies and real-world examples where appropriate.
            Keep the explanation concise but comprehensive.`;
  }

  private buildQuizPrompt(topic: string, difficulty: string, questionCount: number): string {
    return `Create a ${difficulty} level quiz about "${topic}" with ${questionCount} multiple-choice questions.
            Format the response as JSON with this structure:
            {
              "questions": [
                {
                  "question": "Question text",
                  "options": ["A", "B", "C", "D"],
                  "correctAnswer": "A",
                  "explanation": "Why this is correct"
                }
              ]
            }`;
  }

  private buildLessonPlanPrompt(topic: string, grade: string, duration: number, subject: string): string {
    return `Create a comprehensive lesson plan for "${topic}" for grade ${grade} ${subject} class, 
            lasting ${duration} minutes. Include learning objectives, required materials, 
            detailed activities with time allocations, and assessment strategies.
            Format as a structured lesson plan suitable for classroom use.`;
  }

  private getFallbackExplanation(topic: string, difficulty: string): AIResponse {
    const explanations: Record<string, Record<string, string>> = {
      "Newton's Laws": {
        beginner: "Newton's Laws are like rules for how things move! The first law says things at rest stay at rest, and things moving keep moving unless something stops them. The second law says the harder you push something, the faster it goes. The third law says for every action, there's an equal and opposite reaction - like when you walk, you push back on the ground and it pushes you forward!",
        intermediate: "Newton's Three Laws of Motion describe the relationship between forces and motion. The First Law (Inertia) states that objects remain at rest or in uniform motion unless acted upon by an external force. The Second Law relates force, mass, and acceleration (F=ma). The Third Law states that for every action, there is an equal and opposite reaction.",
        advanced: "Newton's laws form the foundation of classical mechanics. The First Law defines inertial reference frames and the concept of inertia. The Second Law, F=ma, is actually F=dp/dt in its most general form. The Third Law reflects the conservation of momentum and is fundamental to understanding interactions between objects."
      }
    };

    const content = explanations[topic]?.[difficulty] || 
      `Let me explain ${topic} at a ${difficulty} level. This is a fascinating concept that helps us understand how the world works around us.`;

    return {
      content,
      type: 'explanation',
      confidence: 0.85,
      suggestions: [
        "Would you like me to create a quiz on this topic?",
        "Should I explain this with more examples?",
        "Would you like to see this concept in action?"
      ],
      followUp: [
        "What part would you like me to explain further?",
        "How does this relate to what you already know?"
      ]
    };
  }

  private getFallbackQuiz(topic: string, difficulty: string): Quiz {
    const questions: Question[] = [
      {
        id: '1',
        type: 'multiple-choice',
        question: `What is the main concept behind ${topic}?`,
        options: [
          "Objects in motion stay in motion",
          "Energy cannot be created or destroyed",
          "Matter is made of atoms",
          "Light travels in waves"
        ],
        correctAnswer: "Objects in motion stay in motion",
        explanation: "This relates to Newton's First Law of Motion, also known as the law of inertia.",
        points: 10
      },
      {
        id: '2',
        type: 'multiple-choice',
        question: `Which formula is associated with ${topic}?`,
        options: [
          "E = mc²",
          "F = ma",
          "PV = nRT",
          "v = d/t"
        ],
        correctAnswer: "F = ma",
        explanation: "F = ma represents Newton's Second Law, relating force, mass, and acceleration.",
        points: 10
      }
    ];

    return {
      id: Date.now().toString(),
      title: `${topic} Quiz`,
      questions,
      topic,
      difficulty: difficulty as 'beginner' | 'intermediate' | 'advanced',
      timeLimit: 300
    };
  }

  private getFallbackLessonPlan(topic: string, grade: string, duration: number, subject: string): LessonPlan {
    return {
      id: Date.now().toString(),
      title: `${topic} - Grade ${grade}`,
      subject,
      grade,
      duration,
      objectives: [
        `Students will understand the key concepts of ${topic}`,
        `Students will be able to apply ${topic} to real-world scenarios`,
        `Students will demonstrate understanding through practical examples`
      ],
      materials: [
        'Whiteboard and markers',
        'Visual aids and diagrams',
        'Hands-on materials',
        'Worksheet handouts'
      ],
      activities: [
        {
          id: '1',
          name: 'Introduction and Hook',
          description: `Engage students with an interesting demonstration related to ${topic}`,
          duration: Math.floor(duration * 0.2),
          type: 'presentation'
        },
        {
          id: '2',
          name: 'Concept Explanation',
          description: `Explain the key concepts of ${topic} with visual aids and examples`,
          duration: Math.floor(duration * 0.4),
          type: 'presentation'
        },
        {
          id: '3',
          name: 'Hands-on Activity',
          description: `Students work with materials to explore ${topic} concepts`,
          duration: Math.floor(duration * 0.3),
          type: 'hands-on'
        },
        {
          id: '4',
          name: 'Wrap-up and Assessment',
          description: 'Review key concepts and assess understanding',
          duration: Math.floor(duration * 0.1),
          type: 'discussion'
        }
      ],
      assessment: `Exit ticket with questions about ${topic} and real-world applications`,
      createdAt: new Date()
    };
  }

  private parseQuizFromAI(content: string, topic: string, difficulty: string): Quiz {
    try {
      // Try to parse JSON from AI response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.questions) {
          const questions: Question[] = parsed.questions.map((q: any, index: number) => ({
            id: (index + 1).toString(),
            type: 'multiple-choice' as const,
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            points: 10
          }));

          return {
            id: Date.now().toString(),
            title: `${topic} Quiz`,
            questions,
            topic,
            difficulty: difficulty as 'beginner' | 'intermediate' | 'advanced',
            timeLimit: questions.length * 60
          };
        }
      }
    } catch (error) {
      console.error('Failed to parse AI quiz response:', error);
    }

    // Fallback to default quiz
    return this.getFallbackQuiz(topic, difficulty);
  }

  private parseLessonPlanFromAI(content: string, topic: string, grade: string, duration: number, subject: string): LessonPlan {
    // For demo purposes, return structured lesson plan
    // In production, this would parse the AI response more intelligently
    return this.getFallbackLessonPlan(topic, grade, duration, subject);
  }
}

export const aiService = new AIService();