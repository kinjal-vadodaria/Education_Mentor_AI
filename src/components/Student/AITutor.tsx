import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Brain, 
  Lightbulb,
  Target,
  RefreshCw,
  Globe,
  Zap
} from 'lucide-react';
import { ChatMessage } from '../../types';
import { aiService } from '../../services/aiService';
import { cn } from '../../utils/cn';
import toast from 'react-hot-toast';

export const AITutor: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: "Hi! I'm your AI tutor. I can explain any topic, create quizzes, and adapt to your learning style. What would you like to learn today?",
      sender: 'ai',
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [language, setLanguage] = useState('en');
  const [difficulty, setDifficulty] = useState('intermediate');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
    { code: 'fr', name: 'French', flag: '🇫🇷' }
  ];

  const quickPrompts = [
    "Explain Newton's Laws like I'm 12",
    "Create a quiz on photosynthesis",
    "Help me understand calculus derivatives",
    "Explain quantum physics with analogies"
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (message?: string) => {
    const messageText = message || input.trim();
    if (!messageText || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: messageText,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Determine if user wants a quiz or explanation
      const isQuizRequest = messageText.toLowerCase().includes('quiz') || 
                           messageText.toLowerCase().includes('test') ||
                           messageText.toLowerCase().includes('questions');

      if (isQuizRequest) {
        const quiz = await aiService.generateQuiz(messageText, difficulty);
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: `I've created a quiz for you on "${messageText}". Ready to test your knowledge?`,
          sender: 'ai',
          timestamp: new Date(),
          type: 'quiz',
          metadata: { topic: messageText, difficulty }
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        const response = await aiService.generateExplanation(messageText, difficulty, language);
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: response.content,
          sender: 'ai',
          timestamp: new Date(),
          type: 'explanation',
          metadata: { topic: messageText, difficulty, language }
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      toast.error('Sorry, I encountered an error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if (!isListening) {
      setIsListening(true);
      // Simulate voice input for demo
      setTimeout(() => {
        setInput("Explain Newton's Laws");
        setIsListening(false);
        toast.success('Voice input captured!');
      }, 2000);
    } else {
      setIsListening(false);
    }
  };

  const handleTextToSpeech = (text: string) => {
    if (isSpeaking) {
      setIsSpeaking(false);
      // Stop speech synthesis
      return;
    }

    setIsSpeaking(true);
    // Simulate text-to-speech for demo
    setTimeout(() => {
      setIsSpeaking(false);
      toast.success('Speech completed!');
    }, 3000);
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-student-primary to-student-secondary rounded-lg">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              AI Tutor
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Personalized learning assistant
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2">
          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 bg-white dark:bg-gray-700"
          >
            {languages.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>

          {/* Difficulty Selector */}
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 bg-white dark:bg-gray-700"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={cn(
                "flex",
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div className={cn(
                "max-w-[80%] rounded-lg p-4 shadow-sm",
                message.sender === 'user'
                  ? "bg-gradient-to-r from-student-primary to-student-secondary text-white"
                  : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
              )}>
                {message.sender === 'ai' && (
                  <div className="flex items-center space-x-2 mb-2">
                    <Brain className="h-4 w-4 text-student-primary" />
                    <span className="text-xs font-medium text-student-primary">
                      AI Tutor
                    </span>
                    {message.type === 'quiz' && (
                      <Target className="h-4 w-4 text-green-500" />
                    )}
                    {message.type === 'explanation' && (
                      <Lightbulb className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                )}
                
                <p className={cn(
                  "text-sm leading-relaxed",
                  message.sender === 'user' 
                    ? "text-white" 
                    : "text-gray-900 dark:text-gray-100"
                )}>
                  {message.content}
                </p>

                {message.sender === 'ai' && (
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleTextToSpeech(message.content)}
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        {isSpeaking ? (
                          <VolumeX className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Volume2 className="h-4 w-4 text-gray-500" />
                        )}
                      </motion.button>
                      
                      {message.type === 'explanation' && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleSend(`Create a quiz on ${message.metadata?.topic}`)}
                          className="text-xs px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 rounded-full hover:bg-green-200 dark:hover:bg-green-900/40 transition-colors"
                        >
                          Create Quiz
                        </motion.button>
                      )}
                    </div>
                    
                    <span className="text-xs text-gray-400">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
              <div className="flex items-center space-x-2">
                <Brain className="h-4 w-4 text-student-primary animate-pulse" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  AI is thinking<span className="loading-dots"></span>
                </span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      {messages.length === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 pb-2"
        >
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Try these quick prompts:
          </p>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((prompt, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSend(prompt)}
                className="text-xs px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <Zap className="h-3 w-3 inline mr-1" />
                {prompt}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything... (e.g., 'Explain Newton's Laws like I'm 12')"
              className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-student-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              disabled={isLoading}
            />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleVoiceInput}
              className={cn(
                "absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded transition-colors",
                isListening 
                  ? "text-red-500 animate-pulse" 
                  : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              )}
            >
              {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </motion.button>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className={cn(
              "p-3 rounded-lg transition-all duration-200",
              input.trim() && !isLoading
                ? "bg-gradient-to-r from-student-primary to-student-secondary text-white shadow-lg hover:shadow-xl"
                : "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <RefreshCw className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
};