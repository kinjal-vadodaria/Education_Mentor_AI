# 🚀 EduMentor AI – Production-Ready Personalized Learning Platform

A comprehensive full-stack web application that provides **AI-powered tutoring for students** and **teaching assistance for educators**. Built with React 18, TypeScript, Mantine UI, and integrated with Google's Generative AI and Supabase.

## ✨ Features

### 👩‍🎓 Student Features
- **Personal AI Tutor**: Interactive chat interface with explanations adapted to learning level
- **Instant Quizzes**: Auto-generated quizzes with immediate feedback and grading
- **Smart Learning Mode**: Adaptive responses based on student performance
- **Gamified Progress**: Levels, XP, streaks, and badges to motivate learning
- **Multilingual Support**: Available in English, Spanish, Hindi, Chinese, Arabic, and French
- **Voice Integration**: Text-to-speech and speech-to-text capabilities
- **Real-time Progress Tracking**: XP system, streaks, badges, and level progression
- **Performance Analytics**: Detailed charts and insights

### 🧑‍🏫 Teacher Features
- **AI Lesson Planner**: Generate comprehensive, curriculum-aligned lesson plans
- **Auto-Grading System**: Consistent evaluation with detailed rubrics
- **Student Analytics**: Performance dashboards with insights and recommendations
- **Classroom Management**: Tools for managing students and tracking progress
- **Export Capabilities**: PDF lesson plans and performance reports

## 🛠 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Mantine UI v7.x with custom theming
- **Animations**: Framer Motion for smooth interactions
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Authentication**: Supabase Auth with email/password
- **AI Integration**: Google Generative AI (@google/generative-ai)
- **Charts**: Recharts for analytics and progress visualization
- **Icons**: Tabler Icons
- **Routing**: React Router DOM
- **State Management**: React Context API
- **Notifications**: Mantine Notifications
- **Internationalization**: React-i18next (6 languages supported)
- **Forms**: Mantine Forms with validation

## 🌍 Internationalization

The platform supports the following languages:
- 🇺🇸 English
- 🇪🇸 Spanish  
- 🇮🇳 Hindi
- 🇨🇳 Chinese (Simplified)
- 🇸🇦 Arabic
- 🇫🇷 French

## 🎨 Design System

### Themes
- **Student Theme**: Indigo (#4F46E5) primary with engaging gradients
- **Teacher Theme**: Blue (#3B82F6) primary with professional aesthetics
- **Dark/Light Mode**: Automatic theme switching with Mantine ColorScheme

### Accessibility
- WCAG 2.1 AA compliant
- Keyboard navigation support
- Screen reader optimized
- High contrast color ratios
- Focus indicators and semantic HTML

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- Google AI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/edumentor-ai.git
cd edumentor-ai
```

2. Install dependencies:
```bash
npm install
```

3. Set up Supabase:
   - Create a new Supabase project
   - Run the SQL schema from `supabase-schema.sql`
   - Get your project URL and anon key

4. Set up Google AI:
   - Get your Google Generative AI API key
   - Enable the Gemini Pro model

5. Set up environment variables:
```bash
# Copy .env.example to .env and fill in your keys
cp .env.example .env

# Add your actual keys:
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_AI_API_KEY=your_api_key_here
```

6. Start the development server:
```bash
npm run dev
```

7. Open [http://localhost:5173](http://localhost:5173) in your browser

## 🗄️ Database Schema

The application uses Supabase with the following core tables:

- **users**: User profiles with role-based access (student/teacher)
- **student_progress**: XP tracking, streaks, levels, and badges
- **quiz_results**: Quiz performance and scoring history
- **chat_messages**: AI tutor conversation history

All tables include Row Level Security (RLS) policies for data protection.

## 📱 Demo Flow

### Student Experience
1. **Registration**: Create student account with email/password
2. **Dashboard**: View personalized learning dashboard with progress
3. **AI Tutor**: Ask "Explain Newton's Laws like I'm 12 years old"
4. **Interactive Learning**: Receive adaptive explanations with voice support
5. **Quiz Generation**: Request AI-generated quiz on the topic
6. **Assessment**: Complete quiz with instant feedback and XP rewards
7. **Progress Tracking**: View updated level, streaks, and badges

### Teacher Experience
1. **Teacher Login**: Access educator dashboard
2. **Analytics Review**: View class performance metrics and trends
3. **Lesson Planning**: Generate AI-powered lesson plan for "Photosynthesis"
4. **Student Management**: Monitor individual student progress
5. **Performance Insights**: Analyze learning patterns and recommendations

## 🎯 Key Features Demonstrated

### AI-Powered Learning
- **Adaptive Explanations**: Content adjusted to grade level and learning style
- **Context-Aware Quizzes**: Generated based on lesson content and difficulty
- **Personalized Feedback**: Detailed explanations for correct and incorrect answers
- **Learning Path Optimization**: AI recommendations based on performance

### Gamification System
- **XP Points**: 10 points per correct answer, 50 bonus for high scores
- **Level Progression**: Beginner → Intermediate → Advanced → Expert
- **Achievement Badges**: Quiz Master, Week Warrior, Subject Expert
- **Learning Streaks**: Daily activity tracking with visual progress

### Analytics & Insights
- **Performance Trends**: Visual charts showing improvement over time
- **Subject Analysis**: Comparative performance across different topics
- **Engagement Metrics**: Time spent, completion rates, activity patterns
- **Predictive Insights**: Early identification of struggling students

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build optimized production bundle
- `npm run preview` - Preview production build locally
- `npm run type-check` - Run TypeScript type checking

### Code Quality
- **TypeScript Strict Mode**: Full type safety and IntelliSense
- **ESLint + Prettier**: Automated code formatting and linting
- **Component Architecture**: Modular, reusable components
- **Custom Hooks**: Shared logic and state management
- **Error Boundaries**: Graceful error handling and recovery

### Performance Optimizations
- **Code Splitting**: Lazy loading for optimal bundle sizes
- **Image Optimization**: WebP format with fallbacks
- **Caching Strategy**: Efficient API response caching
- **Bundle Analysis**: Webpack bundle analyzer integration

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── Auth/           # Authentication forms and flows
│   ├── Layout/         # Header, navigation, and layout
│   ├── Student/        # Student-specific components
│   └── Teacher/        # Teacher-specific components
├── contexts/           # React Context providers
├── services/           # API integrations (Supabase, Google AI)
├── i18n/              # Internationalization configuration
│   └── locales/       # Translation files for each language
└── hooks/             # Custom React hooks
```

## 🚀 Deployment

### Supported Platforms
- **Vercel** (Recommended): Automatic deployments with GitHub integration
- **Netlify**: Static site hosting with form handling
- **AWS Amplify**: Full-stack deployment with backend services
- **Firebase Hosting**: Google Cloud integration

### Build Process
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Test production build locally
npm run preview
```

### Environment Variables Setup
Ensure all required environment variables are configured in your deployment platform:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_GOOGLE_AI_API_KEY`

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration and authentication flows
- [ ] AI tutor conversations in multiple languages
- [ ] Quiz generation and completion
- [ ] Progress tracking and XP system
- [ ] Teacher lesson plan generation
- [ ] Analytics dashboard functionality
- [ ] Mobile responsiveness
- [ ] Dark/light theme switching
- [ ] Accessibility with screen readers

### Browser Compatibility
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript strict mode requirements
- Use Mantine components for consistent UI
- Implement proper error handling
- Add internationalization for new features
- Include accessibility considerations
- Write meaningful commit messages

## 📊 Performance Metrics

### Target Benchmarks
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.0s
- **Cumulative Layout Shift**: < 0.1
- **Lighthouse Score**: 90+ across all categories

## 🔒 Security

### Data Protection
- **Row Level Security**: Database-level access control
- **Authentication**: Secure JWT-based auth with Supabase
- **API Security**: Rate limiting and input validation
- **Privacy**: GDPR-compliant data handling
- **Encryption**: All data encrypted in transit and at rest

## 📈 Analytics & Monitoring

### Built-in Analytics
- Student engagement metrics
- Learning progress tracking
- Quiz performance analysis
- Teacher activity monitoring
- System usage statistics

### Monitoring Setup
- Error tracking with Sentry integration
- Performance monitoring with Web Vitals
- User behavior analytics
- API response time monitoring

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Generative AI** for powering intelligent tutoring
- **Supabase** for backend infrastructure and real-time features
- **Mantine** for the comprehensive UI component library
- Framer Motion for smooth animations
- **React-i18next** for internationalization support
- The open-source community for amazing tools and libraries

## 📞 Support

For support, email support@edumentor-ai.com or join our Discord community.

## 🗺️ Roadmap

### Upcoming Features
- [ ] Video call integration for live tutoring
- [ ] Collaborative study rooms
- [ ] Advanced analytics with ML insights
- [ ] Mobile app development
- [ ] Integration with popular LMS platforms
- [ ] Offline mode support
- [ ] Advanced accessibility features

---

**Built with ❤️ for the future of education • Production-ready • Hackathon-optimized**