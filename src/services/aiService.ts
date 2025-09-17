import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIResponse, Quiz, Question, LessonPlan } from '../types';

// Note: In production, this should be stored in environment variables
const API_KEY = 'your-google-ai-api-key-here';

class AIService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    // For demo purposes, we'll simulate AI responses
    // In production, uncomment the following lines and add your API key
    // this.genAI = new GoogleGenerativeAI(API_KEY);
    // this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
  }

  async generateExplanation(
    topic: string, 
    difficulty: string = 'intermediate',
    language: string = 'en',
    learningStyle: string = 'visual'
  ): Promise<AIResponse> {
    // Simulate AI response for demo
    await this.delay(1500);
    
    const explanations = {
      "Newton's Laws": {
        beginner: "Newton's Laws are like rules for how things move! Imagine you're playing with toy cars...",
        intermediate: "Newton's Three Laws of Motion describe the relationship between forces and motion...",
        advanced: "Newton's laws form the foundation of classical mechanics, mathematically describing..."
      }
    };

    const content = explanations["Newton's Laws"]?.[difficulty as keyof typeof explanations["Newton's Laws"]] || 
      "Let me explain this concept in a way that's perfect for your learning level...";

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
  }

  async generateQuiz(topic: string, difficulty: string = 'intermediate'): Promise<Quiz> {
    await this.delay(2000);

    const questions: Question[] = [
      {
        id: '1',
        type: 'multiple-choice',
        question: "What is Newton's First Law of Motion also known as?",
        options: [
          "Law of Inertia",
          "Law of Acceleration", 
          "Law of Action-Reaction",
          "Law of Gravity"
        ],
        correctAnswer: "Law of Inertia",
        explanation: "Newton's First Law is called the Law of Inertia because it describes how objects resist changes in motion.",
        points: 10
      },
      {
        id: '2',
        type: 'multiple-choice',
        question: "According to Newton's Second Law, what happens when you apply more force to an object?",
        options: [
          "It moves slower",
          "It accelerates more",
          "Nothing changes",
          "It stops moving"
        ],
        correctAnswer: "It accelerates more",
        explanation: "F = ma shows that force and acceleration are directly proportional.",
        points: 10
      }
    ];

    return {
      id: Date.now().toString(),
      title: `${topic} Quiz`,
      questions,
      topic,
      difficulty: difficulty as 'beginner' | 'intermediate' | 'advanced',
      timeLimit: 300 // 5 minutes
    };
  }

  async generateLessonPlan(
    topic: string,
    grade: string,
    duration: number = 45
  ): Promise<LessonPlan> {
    await this.delay(2500);

    return {
      id: Date.now().toString(),
      title: `${topic} - Grade ${grade}`,
      subject: 'Physics',
      grade,
      duration,
      objectives: [
        `Students will understand the three laws of motion`,
        `Students will be able to apply Newton's laws to real-world scenarios`,
        `Students will demonstrate understanding through practical examples`
      ],
      materials: [
        'Whiteboard and markers',
        'Toy cars and ramps',
        'Balls of different masses',
        'Video demonstrations',
        'Worksheet handouts'
      ],
      activities: [
        {
          id: '1',
          name: 'Introduction and Hook',
          description: 'Start with a demonstration using toy cars to capture attention',
          duration: 10,
          type: 'presentation'
        },
        {
          id: '2',
          name: 'Concept Explanation',
          description: 'Explain each law with visual aids and real-world examples',
          duration: 20,
          type: 'presentation'
        },
        {
          id: '3',
          name: 'Hands-on Activity',
          description: 'Students experiment with different objects to observe the laws in action',
          duration: 10,
          type: 'hands-on'
        },
        {
          id: '4',
          name: 'Wrap-up Discussion',
          description: 'Review key concepts and answer questions',
          duration: 5,
          type: 'discussion'
        }
      ],
      assessment: 'Exit ticket with 3 questions about Newton\'s laws and real-world applications',
      createdBy: 'ai-assistant',
      createdAt: new Date()
    };
  }

  async gradeQuiz(quiz: Quiz, answers: Record<string, string>): Promise<{
    score: number;
    totalPoints: number;
    feedback: string[];
    suggestions: string[];
  }> {
    await this.delay(1000);

    let score = 0;
    const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
    const feedback: string[] = [];

    quiz.questions.forEach(question => {
      const userAnswer = answers[question.id];
      const isCorrect = userAnswer === question.correctAnswer;
      
      if (isCorrect) {
        score += question.points;
        feedback.push(`✅ Question ${question.id}: Correct! ${question.explanation}`);
      } else {
        feedback.push(`❌ Question ${question.id}: Incorrect. ${question.explanation}`);
      }
    });

    const percentage = (score / totalPoints) * 100;
    const suggestions = percentage < 70 
      ? ["Review the concepts again", "Try some practice problems", "Ask for help with specific topics"]
      : percentage < 90
      ? ["Great job! Try some advanced problems", "Explore related topics"]
      : ["Excellent work! You've mastered this topic", "Ready for more challenging material"];

    return { score, totalPoints, feedback, suggestions };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const aiService = new AIService();