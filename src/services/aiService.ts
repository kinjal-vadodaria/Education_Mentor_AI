import { GoogleGenerativeAI } from '@google/generative-ai';
import { errorReporting } from './errorReporting';
import { saveChatMessage, saveQuizResult } from './supabase';

const API_KEY = import.meta.env.VITE_GOOGLE_AI_API_KEY;

if (!API_KEY) {
  console.warn('Google AI API key not found. AI features will use fallback responses.');
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

// Rate limiting
type CachedResponse = Quiz | LessonPlan | { content: string };
const requestCache = new Map<string, { response: CachedResponse; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const RATE_LIMIT = 10; // requests per minute
const rateLimitTracker = new Map<string, number[]>();

export interface Quiz {
  id: string;
  title: string;
  topic: string;
  difficulty: string;
  questions: QuizQuestion[];
  timeLimit?: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  options?: string[];
  correctAnswer: string;
  explanation?: string;
}

export interface LessonPlan {
  id: string;
  title: string;
  subject: string;
  grade: string;
  duration: number;
  objectives: string[];
  materials: string[];
  activities: LessonActivity[];
  assessment: string;
  createdAt: Date;
}

export interface LessonActivity {
  id: string;
  name: string;
  description: string;
  duration: number;
  type: 'presentation' | 'hands-on' | 'discussion' | 'assessment';
}

interface QuizData {
  title: string;
  questions: {
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
  }[];
}

interface LessonPlanData {
  title: string;
  objectives: string[];
  materials: string[];
  activities: {
    name: string;
    description: string;
    duration: number;
    type: string;
  }[];
  assessment: string;
}

class AIService {
  private checkRateLimit(userId?: string): boolean {
    const key = userId || 'anonymous';
    const now = Date.now();
    const requests = rateLimitTracker.get(key) || [];
    
    // Remove requests older than 1 minute
    const recentRequests = requests.filter(time => now - time < 60000);
    
    if (recentRequests.length >= RATE_LIMIT) {
      return false;
    }
    
    recentRequests.push(now);
    rateLimitTracker.set(key, recentRequests);
    return true;
  }

  private getCachedResponse(cacheKey: string): Quiz | LessonPlan | { content: string } | null {
    const cached = requestCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.response;
    }
    return null;
  }

  private setCachedResponse(cacheKey: string, response: Quiz | LessonPlan | { content: string }): void {
    requestCache.set(cacheKey, { response, timestamp: Date.now() });
  }

  async generateExplanation(
    topic: string,
    difficulty: string = 'intermediate',
    language: string = 'en',
    gradeLevel?: number,
    userId?: string,
    sessionId?: string
  ): Promise<{ content: string }> {
    const cacheKey = `explanation:${topic}:${difficulty}:${language}:${gradeLevel}`;
    const cached = this.getCachedResponse(cacheKey);
    if (cached && 'content' in cached) return cached as { content: string };

    if (!this.checkRateLimit(userId)) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    try {
      if (!genAI) {
        throw new Error('AI service not available');
      }

      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `Explain "${topic}" in ${language} for a ${difficulty} level student${gradeLevel ? ` in grade ${gradeLevel}` : ''}. 
      Make it engaging, clear, and educational. Use examples and analogies where appropriate.
      Keep the explanation concise but comprehensive.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();

      const aiResponse = { content };
      this.setCachedResponse(cacheKey, aiResponse);

      // Save to database if user is logged in
      if (userId && sessionId) {
        try {
          await saveChatMessage(userId, {
            message: topic,
            response: content,
            session_id: sessionId,
          });
        } catch (error) {
          errorReporting.reportError(error, { context: 'SAVE_CHAT_MESSAGE' });
        }
      }

      return aiResponse;
    } catch (error) {
      errorReporting.reportError(error, { context: 'GENERATE_EXPLANATION' });
      
      // Provide fallback response
      return {
        content: this.getFallbackExplanation(topic, difficulty),
      };
    }
  }

  async generateQuiz(
    topic: string,
    difficulty: string = 'intermediate',
    questionCount: number = 5,
    userId?: string
  ): Promise<Quiz> {
    const cacheKey = `quiz:${topic}:${difficulty}:${questionCount}`;
    const cached = this.getCachedResponse(cacheKey);
    if (cached && 'topic' in cached && 'questions' in cached) return cached as Quiz;

    if (!this.checkRateLimit(userId)) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    try {
      if (!genAI) {
        throw new Error('AI service not available');
      }

      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `Create a ${difficulty} level quiz about "${topic}" with ${questionCount} multiple-choice questions.
      Format as JSON with this structure:
      {
        "title": "Quiz title",
        "questions": [
          {
            "question": "Question text",
            "options": ["A", "B", "C", "D"],
            "correctAnswer": "A",
            "explanation": "Why this is correct"
          }
        ]
      }`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();

      // Parse JSON response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid response format');
      }

      const quizData: QuizData = JSON.parse(jsonMatch[0]);

      const quiz: Quiz = {
        id: Date.now().toString(),
        title: quizData.title || `${topic} Quiz`,
        topic,
        difficulty,
        questions: quizData.questions.map((q, index: number) => ({
          id: `q${index + 1}`,
          question: q.question,
          type: 'multiple-choice' as const,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
        })),
        timeLimit: questionCount * 60, // 1 minute per question
      };

      this.setCachedResponse(cacheKey, quiz);
      return quiz;
    } catch (error) {
      errorReporting.reportError(error, { context: 'GENERATE_QUIZ' });
      
      // Provide fallback quiz
      return this.getFallbackQuiz(topic, difficulty, questionCount);
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
    const feedback: string[] = [];
    const totalPoints = quiz.questions.length;

    quiz.questions.forEach((question) => {
      const userAnswer = answers[question.id];
      const isCorrect = userAnswer === question.correctAnswer;
      
      if (isCorrect) {
        score++;
        feedback.push(`✓ Question ${question.id}: Correct! ${question.explanation || ''}`);
      } else {
        feedback.push(`✗ Question ${question.id}: Incorrect. The correct answer was ${question.correctAnswer}. ${question.explanation || ''}`);
      }
    });

    const percentage = (score / totalPoints) * 100;
    const xpGained = score * 10 + (percentage >= 90 ? 50 : percentage >= 70 ? 25 : 0);

    const suggestions = [
      percentage >= 90 ? 'Excellent work! Try a more advanced topic.' : 
      percentage >= 70 ? 'Good job! Review the missed questions and try again.' :
      'Keep practicing! Focus on the fundamentals.',
    ];

    // Save quiz result if user is logged in
    if (userId) {
      try {
        await saveQuizResult(userId, {
          quiz_topic: quiz.topic,
          score,
          total_questions: totalPoints,
        });
      } catch (error) {
        errorReporting.reportError(error, { context: 'SAVE_QUIZ_RESULT' });
      }
    }

    return {
      score,
      totalPoints,
      feedback,
      suggestions,
      xpGained,
    };
  }

  async generateLessonPlan(
    topic: string,
    grade: string,
    duration: number,
    subject: string
  ): Promise<LessonPlan> {
    const cacheKey = `lesson:${topic}:${grade}:${duration}:${subject}`;
    const cached = this.getCachedResponse(cacheKey);
    if (cached && 'subject' in cached && 'objectives' in cached) return cached as LessonPlan;

    if (!this.checkRateLimit()) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    try {
      if (!genAI) {
        throw new Error('AI service not available');
      }

      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `Create a comprehensive lesson plan for "${topic}" in ${subject} for grade ${grade} students.
      Duration: ${duration} minutes.
      
      Include:
      - Learning objectives (3-5)
      - Required materials
      - Detailed activities with time allocations
      - Assessment strategy
      
      Format as JSON with this structure:
      {
        "title": "Lesson title",
        "objectives": ["objective1", "objective2"],
        "materials": ["material1", "material2"],
        "activities": [
          {
            "name": "Activity name",
            "description": "Description",
            "duration": 15,
            "type": "presentation"
          }
        ],
        "assessment": "Assessment description"
      }`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();

      // Parse JSON response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid response format');
      }

      const planData: LessonPlanData = JSON.parse(jsonMatch[0]);

      const lessonPlan: LessonPlan = {
        id: Date.now().toString(),
        title: planData.title || `${topic} - Grade ${grade}`,
        subject,
        grade,
        duration,
        objectives: planData.objectives || [],
        materials: planData.materials || [],
        activities: planData.activities.map((activity, index: number) => ({
          id: `activity${index + 1}`,
          name: activity.name,
          description: activity.description,
          duration: activity.duration,
          type: (activity.type || 'presentation') as 'presentation' | 'hands-on' | 'discussion' | 'assessment',
        })),
        assessment: planData.assessment || 'Formative assessment through observation and questioning',
        createdAt: new Date(),
      };

      this.setCachedResponse(cacheKey, lessonPlan);
      return lessonPlan;
    } catch (error) {
      errorReporting.reportError(error, { context: 'GENERATE_LESSON_PLAN' });
      
      // Provide fallback lesson plan
      return this.getFallbackLessonPlan(topic, grade, duration, subject);
    }
  }

  private getFallbackExplanation(topic: string, difficulty: string): string {
    const explanations: Record<string, Record<string, string>> = {
      "newton": {
        beginner: "Newton's Laws are like rules for how things move! The first law says things at rest stay at rest, and things moving keep moving unless something stops them. The second law says the harder you push something, the faster it goes. The third law says for every action, there's an equal and opposite reaction - like when you walk, you push back on the ground and it pushes you forward!",
        intermediate: "Newton's Three Laws of Motion describe the relationship between forces and motion. The First Law (Inertia) states that objects remain at rest or in uniform motion unless acted upon by an external force. The Second Law relates force, mass, and acceleration (F=ma). The Third Law states that for every action, there is an equal and opposite reaction.",
        advanced: "Newton's laws form the foundation of classical mechanics. The First Law defines inertial reference frames and the concept of inertia. The Second Law, F=ma, is actually F=dp/dt in its most general form. The Third Law reflects the conservation of momentum and is fundamental to understanding interactions between objects."
      },
      "photosynthesis": {
        beginner: "Photosynthesis is how plants make their own food! They use sunlight, water, and carbon dioxide from the air to create sugar and oxygen. It's like plants are cooking their own meals using sunlight as their energy source!",
        intermediate: "Photosynthesis is the process by which plants convert light energy into chemical energy. The equation is: 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂. This occurs in chloroplasts and involves light-dependent and light-independent reactions.",
        advanced: "Photosynthesis involves complex biochemical pathways including the light reactions in thylakoids (photosystems I and II, electron transport chain) and the Calvin cycle in the stroma. The process converts light energy to ATP and NADPH, which drive carbon fixation."
      }
    };

    const topicKey = Object.keys(explanations).find(key => 
      topic.toLowerCase().includes(key)
    );

    if (topicKey && explanations[topicKey][difficulty]) {
      return explanations[topicKey][difficulty];
    }

    return `I'd be happy to help you learn about ${topic}! This is a fascinating topic. While I'm having trouble accessing my full knowledge base right now, I can tell you that understanding ${topic} is important for building a strong foundation in your studies. Would you like me to suggest some specific questions about ${topic} that I might be able to help with?`;
  }

  private getFallbackQuiz(topic: string, difficulty: string, questionCount: number): Quiz {
    const topicQuestions: Record<string, QuizQuestion[]> = {
      "newton": [
        {
          id: 'q1',
          question: "What is Newton's First Law of Motion?",
          type: 'multiple-choice',
          options: ["An object at rest stays at rest", "Force equals mass times acceleration", "For every action there is an equal and opposite reaction", "Objects fall at the same rate"],
          correctAnswer: "An object at rest stays at rest",
          explanation: "Newton's First Law states that an object at rest stays at rest and an object in motion stays in motion unless acted upon by an external force.",
        },
        {
          id: 'q2',
          question: "What does Newton's Second Law describe?",
          type: 'multiple-choice',
          options: ["Inertia", "Acceleration due to gravity", "Relationship between force, mass, and acceleration", "Conservation of energy"],
          correctAnswer: "Relationship between force, mass, and acceleration",
          explanation: "F = ma, where force is proportional to mass and acceleration.",
        },
        {
          id: 'q3',
          question: "What is Newton's Third Law?",
          type: 'multiple-choice',
          options: ["Objects attract each other", "For every action there is an equal and opposite reaction", "Energy is conserved", "Mass is conserved"],
          correctAnswer: "For every action there is an equal and opposite reaction",
          explanation: "When one object exerts a force on another, the second object exerts an equal force back.",
        },
        {
          id: 'q4',
          question: "Which law explains why you feel pushed back when a car accelerates?",
          type: 'multiple-choice',
          options: ["First Law", "Second Law", "Third Law", "Law of Gravity"],
          correctAnswer: "Third Law",
          explanation: "The car's acceleration pushes you back due to the equal and opposite reaction.",
        },
        {
          id: 'q5',
          question: "What is inertia?",
          type: 'multiple-choice',
          options: ["The tendency of objects to stay in motion or at rest", "The force of gravity", "The speed of light", "The amount of matter in an object"],
          correctAnswer: "The tendency of objects to stay in motion or at rest",
          explanation: "Inertia is the property that resists changes in motion, as described by Newton's First Law.",
        },
      ],
      "photosynthesis": [
        {
          id: 'q1',
          question: "What is photosynthesis?",
          type: 'multiple-choice',
          options: ["Process by which plants make food", "Process of respiration", "Process of transpiration", "Process of pollination"],
          correctAnswer: "Process by which plants make food",
          explanation: "Photosynthesis is how plants convert light energy into chemical energy to make food.",
        },
        {
          id: 'q2',
          question: "What gas do plants take in during photosynthesis?",
          type: 'multiple-choice',
          options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"],
          correctAnswer: "Carbon Dioxide",
          explanation: "Plants take in carbon dioxide from the air for photosynthesis.",
        },
        {
          id: 'q3',
          question: "What is the main product of photosynthesis?",
          type: 'multiple-choice',
          options: ["Glucose", "Protein", "Fat", "Vitamin"],
          correctAnswer: "Glucose",
          explanation: "Glucose is the sugar produced by plants during photosynthesis.",
        },
        {
          id: 'q4',
          question: "Where does photosynthesis occur in plants?",
          type: 'multiple-choice',
          options: ["Roots", "Stems", "Leaves", "Flowers"],
          correctAnswer: "Leaves",
          explanation: "Photosynthesis primarily occurs in the leaves where chlorophyll is present.",
        },
        {
          id: 'q5',
          question: "What is the role of chlorophyll in photosynthesis?",
          type: 'multiple-choice',
          options: ["Absorbs water", "Absorbs light", "Absorbs minerals", "Absorbs oxygen"],
          correctAnswer: "Absorbs light",
          explanation: "Chlorophyll absorbs light energy needed for photosynthesis.",
        },
      ],
      "electricity": [
        {
          id: 'q1',
          question: "What is electric current?",
          type: 'multiple-choice',
          options: ["Flow of water", "Flow of electrons", "Flow of air", "Flow of heat"],
          correctAnswer: "Flow of electrons",
          explanation: "Electric current is the flow of electric charge, typically electrons.",
        },
        {
          id: 'q2',
          question: "What is the unit of electric current?",
          type: 'multiple-choice',
          options: ["Volt", "Ampere", "Ohm", "Watt"],
          correctAnswer: "Ampere",
          explanation: "Ampere is the unit of electric current.",
        },
        {
          id: 'q3',
          question: "What is resistance?",
          type: 'multiple-choice',
          options: ["Opposition to current flow", "Flow of current", "Generation of current", "Storage of current"],
          correctAnswer: "Opposition to current flow",
          explanation: "Resistance opposes the flow of electric current.",
        },
        {
          id: 'q4',
          question: "What is Ohm's Law?",
          type: 'multiple-choice',
          options: ["V = IR", "P = IV", "E = mc²", "F = ma"],
          correctAnswer: "V = IR",
          explanation: "Ohm's Law states that voltage equals current times resistance.",
        },
        {
          id: 'q5',
          question: "What is a conductor?",
          type: 'multiple-choice',
          options: ["Material that allows current to flow", "Material that blocks current", "Material that generates current", "Material that stores current"],
          correctAnswer: "Material that allows current to flow",
          explanation: "Conductors allow electric current to flow through them easily.",
        },
      ],
      "default": [
        {
          id: 'q1',
          question: `What is a key concept in ${topic}?`,
          type: 'multiple-choice',
          options: ["Concept A", "Concept B", "Concept C", "Concept D"],
          correctAnswer: "Concept A",
          explanation: "This is the correct answer based on fundamental principles.",
        },
        {
          id: 'q2',
          question: `How does ${topic} work?`,
          type: 'multiple-choice',
          options: ["Way 1", "Way 2", "Way 3", "Way 4"],
          correctAnswer: "Way 1",
          explanation: "This is how it works.",
        },
        {
          id: 'q3',
          question: `What is an example of ${topic}?`,
          type: 'multiple-choice',
          options: ["Example 1", "Example 2", "Example 3", "Example 4"],
          correctAnswer: "Example 1",
          explanation: "This is an example.",
        },
        {
          id: 'q4',
          question: `Why is ${topic} important?`,
          type: 'multiple-choice',
          options: ["Reason 1", "Reason 2", "Reason 3", "Reason 4"],
          correctAnswer: "Reason 1",
          explanation: "This is why it's important.",
        },
        {
          id: 'q5',
          question: `What is a challenge in ${topic}?`,
          type: 'multiple-choice',
          options: ["Challenge 1", "Challenge 2", "Challenge 3", "Challenge 4"],
          correctAnswer: "Challenge 1",
          explanation: "This is a challenge.",
        },
      ],
    };

    const topicKey = Object.keys(topicQuestions).find(key => topic.toLowerCase().includes(key)) || 'default';
    const questions = topicQuestions[topicKey].slice(0, questionCount).map((q, index) => ({
      ...q,
      id: `q${index + 1}`,
    }));

    return {
      id: Date.now().toString(),
      title: `${topic} Quiz`,
      topic,
      difficulty,
      questions,
      timeLimit: questionCount * 60,
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
        `Students will understand the basic concepts of ${topic}`,
        `Students will be able to apply ${topic} knowledge`,
        `Students will demonstrate understanding through activities`,
      ],
      materials: ['Whiteboard', 'Handouts', 'Visual aids', 'Student notebooks'],
      activities: [
        {
          id: 'activity1',
          name: 'Introduction',
          description: `Introduce the topic of ${topic} with engaging examples`,
          duration: Math.floor(duration * 0.2),
          type: 'presentation',
        },
        {
          id: 'activity2',
          name: 'Main Content',
          description: `Detailed explanation of ${topic} concepts`,
          duration: Math.floor(duration * 0.5),
          type: 'presentation',
        },
        {
          id: 'activity3',
          name: 'Practice Activity',
          description: `Students practice ${topic} concepts`,
          duration: Math.floor(duration * 0.2),
          type: 'hands-on',
        },
        {
          id: 'activity4',
          name: 'Wrap-up',
          description: 'Review and assess understanding',
          duration: Math.floor(duration * 0.1),
          type: 'discussion',
        },
      ],
      assessment: 'Formative assessment through questioning and observation',
      createdAt: new Date(),
    };
  }
}

export const aiService = new AIService();