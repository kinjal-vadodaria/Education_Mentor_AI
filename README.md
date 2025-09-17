# 🚀 EduMentor AI – Personalized AI Tutor & Teacher Assistant

A comprehensive full-stack web application that provides **AI-powered tutoring for students** and **teaching assistance for educators**. Built with React, TypeScript, Tailwind CSS, and integrated with Google's Generative AI.

## ✨ Features

### 👩‍🎓 Student Features
- **Personal AI Tutor**: Interactive chat interface with explanations adapted to learning level
- **Instant Quizzes**: Auto-generated quizzes with immediate feedback and grading
- **Smart Learning Mode**: Adaptive responses based on student performance
- **Gamified Progress**: Levels, XP, streaks, and badges to motivate learning
- **Multilingual Support**: Available in English, Spanish, Hindi, Chinese, Arabic, and French
- **Voice Integration**: Text-to-speech and speech-to-text capabilities

### 🧑‍🏫 Teacher Features
- **AI Lesson Planner**: Generate comprehensive, curriculum-aligned lesson plans
- **Auto-Grading System**: Consistent evaluation with detailed rubrics
- **Student Analytics**: Performance dashboards with insights and recommendations
- **Classroom Management**: Tools for managing students and tracking progress

## 🛠 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion for smooth interactions
- **AI Integration**: Google Generative AI (@google/generative-ai)
- **Charts**: Recharts for analytics visualization
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **State Management**: React Context API
- **Notifications**: React Hot Toast

## 🎨 Design System

### Color Palette
- **Student Theme**: Bright and engaging colors (Indigo/Purple gradients)
- **Teacher Theme**: Professional and calm colors (Blue/Green palette)
- **Dark/Light Mode**: Seamless theme switching

### UI Components
- Responsive design for desktop, tablet, and mobile
- Smooth animations and micro-interactions
- Consistent spacing using 8px grid system
- Modern glassmorphism effects
- Accessible color contrasts

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd edumentor-ai
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Create .env file and add your Google AI API key
VITE_GOOGLE_AI_API_KEY=your_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## 📱 Demo Flow

### Student Experience
1. Login as a student (any email/password works in demo)
2. Navigate to "AI Tutor" 
3. Type: "Explain Newton's Laws like I'm 12"
4. Receive animated explanation
5. Generate and take a quiz
6. Get instant feedback and recommendations

### Teacher Experience
1. Login as a teacher
2. Go to "Lesson Planner"
3. Click "Create New Plan"
4. Enter "Newton's Laws", select grade and duration
5. Get comprehensive lesson plan with activities and assessment

## 🌍 Multilingual Support

The platform supports the following languages:
- 🇺🇸 English
- 🇪🇸 Spanish  
- 🇮🇳 Hindi
- 🇨🇳 Chinese (Mandarin)
- 🇸🇦 Arabic
- 🇫🇷 French

## 🎯 Key Features Demonstrated

### AI-Powered Learning
- Adaptive explanations based on difficulty level
- Context-aware quiz generation
- Personalized learning recommendations
- Real-time feedback and assessment

### Modern UX/UI
- Smooth page transitions and animations
- Responsive design across all devices
- Dark/light theme support
- Intuitive navigation and interactions

### Educational Tools
- Comprehensive lesson planning
- Student progress tracking
- Performance analytics
- Collaborative learning features

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── Auth/           # Authentication components
│   ├── Layout/         # Layout components (Header, Sidebar)
│   ├── Student/        # Student-specific components
│   └── Teacher/        # Teacher-specific components
├── contexts/           # React Context providers
├── services/           # API and external service integrations
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── styles/             # Global styles and Tailwind config
```

## 🚀 Deployment

The application is ready for deployment on platforms like:
- Vercel
- Netlify  
- AWS Amplify
- Firebase Hosting

Build the project:
```bash
npm run build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google Generative AI for powering the AI features
- Tailwind CSS for the design system
- Framer Motion for smooth animations
- The open-source community for amazing tools and libraries

---

**Built with ❤️ for the future of education**