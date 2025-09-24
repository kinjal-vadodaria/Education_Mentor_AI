import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase, saveChatMessage, saveQuizResult, updateStudentProgress } from './supabase';
import { errorReporting } from './errorReporting';

const API_KEY = import.meta.env.VITE_GOOGLE_AI_API_KEY || 'your-google-ai-api-key';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// Rate limiting
class RateLimiter {
  private requests: number[] = [];
  private maxRequests: number;
  private timeWindow: number;

  constructor(maxRequests: number = 10, timeWindowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindowMs;
  }

  canMakeRequest(): boolean {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.timeWindow);
    
    if (this.requests.length >= this.maxRequests) {
      return false;
    }
    
    this.requests.push(now);
    return true;
  }

  getTimeUntilNextRequest(): number {
    if (this.requests.length < this.maxRequests) return 0;
    const oldestRequest = Math.min(...this.requests);
    return this.timeWindow - (Date.now() - oldestRequest);
  }
}

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

interface ParsedQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
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
  private model: ReturnType<GoogleGenerativeAI['getGenerativeModel']> | null = null;
  private rateLimiter = new RateLimiter(10, 60000); // 10 requests per minute
  private cache = new Map<string, { data: unknown; timestamp: number }>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor() {
    if (API_KEY && API_KEY !== 'your-google-ai-api-key') {
      try {
        this.genAI = new GoogleGenerativeAI(API_KEY);
        this.model = this.genAI.getGenerativeModel({ 
          model: "gemini-pro",
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        });
      } catch (error) {
        console.error('Failed to initialize Google AI:', error);
        errorReporting.reportError(error as Error, { context: 'AI_INITIALIZATION' });
      }
    }
  }

  private getCacheKey(method: string, ...args: unknown[]): string {
    return `${method}_${JSON.stringify(args)}`;
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key) as CacheEntry<T> | undefined;
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: unknown): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private async makeAIRequest<T>(
    requestFn: () => Promise<T>,
    fallbackFn: () => T,
    cacheKey?: string
  ): Promise<T> {
    // Check cache first
    if (cacheKey) {
      const cached = this.getFromCache<T>(cacheKey);
      if (cached) return cached;
    }

    // Check rate limit
    if (!this.rateLimiter.canMakeRequest()) {
      const waitTime = this.rateLimiter.getTimeUntilNextRequest();
      throw new Error(`Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds.`);
    }

    try {
      if (!this.model) {
        return fallbackFn();
      }

      const result = await requestFn();
      
      // Cache the result
      if (cacheKey) {
        this.setCache(cacheKey, result);
      }
      
      return result;
    } catch (error) {
      console.error('AI Service Error:', error);
      errorReporting.reportError(error as Error, { context: 'AI_REQUEST' });
      return fallbackFn();
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
    const cacheKey = this.getCacheKey('explanation', topic, difficulty, language, gradeLevel);
    
    return this.makeAIRequest(
      async () => {
        const prompt = this.buildExplanationPrompt(topic, difficulty, language, gradeLevel);
        const result = await this.model!.generateContent(prompt);
        const response = await result.response;
        const content = response.text();

        // Save to database if user is logged in
        if (userId && sessionId) {
          try {
            await saveChatMessage({
              user_id: userId,
              message: topic,
              response: content,
              timestamp: new Date().toISOString(),
              session_id: sessionId,
            });
          } catch (dbError) {
            console.error('Failed to save chat message:', dbError);
          }
        }

        return {
          content,
          type: 'explanation' as const,
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
      },
      () => this.getFallbackExplanation(topic, difficulty),
      cacheKey
    );
  }

  async generateQuiz(
    topic: string,
    difficulty: string = 'intermediate',
    questionCount: number = 5,
    userId?: string
  ): Promise<Quiz> {
    const cacheKey = this.getCacheKey('quiz', topic, difficulty, questionCount);
    
    return this.makeAIRequest(
      async () => {
        const prompt = this.buildQuizPrompt(topic, difficulty, questionCount);
        const result = await this.model!.generateContent(prompt);
        const response = await result.response;
        const content = response.text();

        return this.parseQuizFromAI(content, topic, difficulty);
      },
      () => this.getFallbackQuiz(topic, difficulty),
      cacheKey
    );
  }

  async generateLessonPlan(
    topic: string,
    grade: string,
    duration: number = 45,
    subject: string = 'General'
  ): Promise<LessonPlan> {
    const cacheKey = this.getCacheKey('lessonPlan', topic, grade, duration, subject);
    
    return this.makeAIRequest(
      async () => {
        const prompt = this.buildLessonPlanPrompt(topic, grade, duration, subject);
        const result = await this.model!.generateContent(prompt);
        const response = await result.response;
        const content = response.text();

        return this.parseLessonPlanFromAI(content, topic, grade, duration, subject);
      },
      () => this.getFallbackLessonPlan(topic, grade, duration, subject),
      cacheKey
    );
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
      try {
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
      } catch (dbError) {
        console.error('Failed to save quiz results:', dbError);
        errorReporting.reportError(dbError as Error, { context: 'QUIZ_SAVE' });
      }
    }

    return { score, totalPoints, feedback, suggestions, xpGained };
  }

  private buildExplanationPrompt(topic: string, difficulty: string, language: string, gradeLevel?: number): string {
    const gradeContext = gradeLevel ? `for grade ${gradeLevel} students` : '';
    const difficultyContext = difficulty === 'beginner' ? 'in simple terms' : 
                             difficulty === 'advanced' ? 'with detailed technical explanations' : 
                             'with clear examples and moderate detail';

    return `You are an expert educator. Explain "${topic}" ${difficultyContext} ${gradeContext} in ${language}. 
            Requirements:
            - Make it engaging and educational
            - Use analogies and real-world examples where appropriate
            - Keep the explanation concise but comprehensive
            - Structure the response with clear sections
            - Include practical applications when relevant
            - Adapt the vocabulary to the specified difficulty level`;
  }

  private buildQuizPrompt(topic: string, difficulty: string, questionCount: number): string {
    return `You are an expert quiz creator. Create a ${difficulty} level quiz about "${topic}" with ${questionCount} multiple-choice questions.
            
            Requirements:
            - Questions should test understanding, not just memorization
            - Include a mix of conceptual and application questions
            - Provide clear, educational explanations for correct answers
            - Ensure all options are plausible
            
            Format the response as valid JSON with this exact structure:
            {
              "questions": [
                {
                  "question": "Question text",
                  "options": ["A", "B", "C", "D"],
                  "correctAnswer": "A",
                  "explanation": "Detailed explanation of why this is correct and why other options are wrong"
                }
              ]
            }`;
  }

  private buildLessonPlanPrompt(topic: string, grade: string, duration: number, subject: string): string {
    return `You are an expert curriculum designer. Create a comprehensive lesson plan for "${topic}" for grade ${grade} ${subject} class, lasting ${duration} minutes.
            
            Requirements:
            - Include 3-5 specific, measurable learning objectives
            - List all required materials and resources
            - Design engaging activities with specific time allocations
            - Include formative and summative assessment strategies
            - Consider different learning styles and abilities
            - Provide clear instructions for each activity
            - Include extension activities for advanced learners
            
            Structure the response as a professional lesson plan suitable for classroom use.`;
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
          const questions: Question[] = parsed.questions.map((q: ParsedQuestion, index: number) => ({
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
      errorReporting.reportError(error as Error, { context: 'QUIZ_PARSING', content });
    }

    // Fallback to default quiz
    return this.getFallbackQuiz(topic, difficulty);
  }

  private parseLessonPlanFromAI(content: string, topic: string, grade: string, duration: number, subject: string): LessonPlan {
    // For demo purposes, return structured lesson plan
    // In production, this would parse the AI response more intelligently
    return this.getFallbackLessonPlan(topic, grade, duration, subject);
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      if (!this.model) return false;
      
      const result = await this.model!.generateContent("Say 'OK' if you're working.");
      const response = await result.response;
      return response.text().includes('OK');
    } catch (error) {
      return false;
    }
  }

  // Clear cache method
  clearCache(): void {
    this.cache.clear();
  }
}

export const aiService = new AIService();