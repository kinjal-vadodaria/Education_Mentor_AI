# 🚀 EduMentor AI – Production-Ready Personalized Learning Platform

A comprehensive full-stack web application that provides **AI-powered tutoring for students** and **teaching assistance for educators**. Built with React 18, TypeScript, Mantine UI v7, and integrated with Google's Generative AI and Supabase.

## ✨ Features

### 👩‍🎓 Student Features
- **Personal AI Tutor**: Interactive chat interface with explanations adapted to learning level
- **Instant Quizzes**: Auto-generated quizzes with immediate feedback and grading
- **Smart Learning Mode**: Adaptive responses based on student performance
- **Gamified Progress**: Levels, XP, streaks, and badges to motivate learning
- **Multilingual Support**: Available in 10 languages with RTL support
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
- **UI Framework**: Mantine UI v7.13.2 with custom theming and design system
- **Animations**: Framer Motion for smooth interactions
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Authentication**: Supabase Auth with email/password
- **AI Integration**: Google Generative AI (@google/generative-ai)
- **Charts**: Recharts for analytics and progress visualization
- **Icons**: Tabler Icons
- **Routing**: React Router DOM
- **State Management**: React Context API
- **Notifications**: Mantine Notifications
- **Internationalization**: React-i18next (10 languages supported)
- **Forms**: Mantine Forms with validation
- **Error Handling**: Comprehensive error boundaries and reporting
- **Performance**: Code splitting, caching, and optimization

## 🌍 Internationalization

The platform supports the following languages with full localization:
- 🇺🇸 English
- 🇪🇸 Spanish  
- 🇫🇷 French
- 🇩🇪 German
- 🇮🇳 Hindi
- 🇨🇳 Chinese (Simplified)
- 🇸🇦 Arabic
- 🇧🇷 Portuguese
- 🇷🇺 Russian
- 🇯🇵 Japanese

**Features**:
- Automatic browser language detection
- Manual language switcher with search
- RTL support for Arabic
- Localized number and date formatting
- Persistent language preference

## 🎨 Design System

### Themes
- **Student Theme**: Custom indigo color palette with engaging gradients
- **Teacher Theme**: Professional blue color palette with clean aesthetics
- **Dark/Light Mode**: Persistent theme switching with smooth transitions
- **Typography**: Inter font family for optimal readability
- **Spacing**: Consistent 8px grid system
- **Components**: Unified design tokens and component variants

### Accessibility
- WCAG 2.1 AA compliant
- Keyboard navigation support
- Screen reader optimized
- High contrast color ratios
- Focus indicators and semantic HTML
- ARIA labels and descriptions
- Skip navigation links

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- Google AI API key

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd mentorquest
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Copy .env.example to .env and fill in your keys
cp .env.example .env
```

Edit `.env` with your actual keys:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_AI_API_KEY=your_google_ai_api_key
```

4. Set up Supabase database:
```bash
# Run the automated setup script
bash scripts/setup-supabase.sh
```

Or manually:
```bash
# Run migrations
psql "your_supabase_db_url" -f supabase/migrations/001_fix_auth_and_schema.sql

# Run seed data
psql "your_supabase_db_url" -f supabase/seed.sql
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:5173](http://localhost:5173) in your browser

### 🧪 Testing the Setup

Run the test script to verify everything is working:
```bash
bash scripts/test-auth.sh
```

### 🔧 Database Migration for Auth Fix

If you're experiencing role assignment issues, run this migration:
```bash
# Connect to your Supabase database and run:
psql "your_supabase_db_url" -f supabase/migrations/fix_auth_trigger.sql
```

### 🎯 Demo Accounts

Use these pre-configured accounts to test the app:

**Teacher Account:**
- Email: `teacher@demo.com`
- Password: `demo123`
- Features: Lesson planning, student analytics, course management
- **Expected Behavior**: After login, should redirect to `/teacher/dashboard`

**Student Account:**
- Email: `student@demo.com`  
- Password: `demo123`
- Features: AI tutoring, quizzes, progress tracking  
- **Expected Behavior**: After login, should redirect to `/student/dashboard`

### 🐛 Debugging Authentication Issues

If you're experiencing login/redirect issues:

1. **Check Browser Console**: Look for authentication debug logs:
   ```
   🔑 Attempting sign in for: user@example.com
   🔐 Auth state changed: SIGNED_IN
   👤 Current user data: { role: 'student', ... }
   🚀 Redirecting user based on role: student
   ```

2. **Verify Database Trigger**: Ensure the `handle_new_user()` trigger is working:
   ```sql
   SELECT * FROM users WHERE email = 'your-test-email@example.com';
   ```

3. **Test Role Assignment**: Create a new account and verify the role is set correctly.

4. **Check Network Tab**: Verify Supabase API calls are successful.

## 🔧 Development

### Database Schema

The app uses the following main tables:
- `users` - User profiles with role-based access (student/teacher)
- `student_progress` - XP tracking, streaks, levels, badges
- `quiz_results` - Quiz performance history
- `chat_messages` - AI tutor conversations
- `courses` - Teacher course management
- `lesson_plans` - AI-generated lesson plans

### Authentication Flow

1. User signs up with email/password and selects role (student/teacher)
2. Supabase Auth creates the auth user with metadata
3. Database trigger automatically creates user profile in `users` table
4. RLS policies ensure users can only access their own data
5. Teachers get additional permissions to view student data

### API Keys Required

- **Supabase URL & Anon Key**: For database and authentication
- **Google AI API Key**: For AI tutoring and content generation

Get these from:
- Supabase: [https://supabase.com](https://supabase.com)
- Google AI: [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build optimized production bundle
- `npm run preview` - Preview production build locally
- `npm run type-check` - Run TypeScript type checking

### Code Quality
- **TypeScript Strict Mode**: Full type safety and IntelliSense
- **Error Boundaries**: Comprehensive error handling and recovery
- **Component Architecture**: Modular, reusable components
- **Custom Hooks**: Shared logic and state management
- **Performance Optimization**: Code splitting and caching

## 🗄️ Database Schema

The application uses Supabase with the following core tables:

- **users**: User profiles with role-based access (student/teacher)
- **student_progress**: XP tracking, streaks, levels, and badges
- **quiz_results**: Quiz performance and scoring history
- **chat_messages**: AI tutor conversation history

**Security Features**:
- Row Level Security (RLS) policies for data protection
- Real-time subscriptions for live updates
- Automatic data validation and sanitization
- Secure authentication flow

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
- **Rate Limiting**: Intelligent request management and caching
- **Fallback Systems**: Graceful degradation when AI services are unavailable

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

### Performance Optimizations
- **Code Splitting**: Lazy loading for optimal bundle sizes
- **AI Response Caching**: 5-minute cache for repeated requests
- **Rate Limiting**: 10 requests per minute to prevent abuse
- **Error Recovery**: Automatic fallback to cached or default responses
- **Real-time Updates**: Efficient Supabase subscriptions

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── Auth/           # Authentication forms and flows
│   ├── common/         # Shared components (ErrorBoundary, LoadingSpinner)
│   ├── Layout/         # Header, navigation, and layout
│   ├── Student/        # Student-specific components
│   └── Teacher/        # Teacher-specific components
├── contexts/           # React Context providers
├── hooks/              # Custom React hooks
├── services/           # API integrations (Supabase, Google AI)
│   ├── aiService.ts    # AI integration with caching and rate limiting
│   ├── supabase.ts     # Database operations with error handling
│   └── errorReporting.ts # Error tracking and reporting
├── i18n/              # Internationalization configuration
│   └── locales/       # Translation files for each language
└── utils/             # Utility functions and helpers
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
- `VITE_ERROR_REPORTING_ENDPOINT` (optional)

## 🔒 Security

### Data Protection
- **Row Level Security**: Database-level access control
- **Authentication**: Secure JWT-based auth with Supabase
- **API Security**: Rate limiting and input validation
- **Privacy**: GDPR-compliant data handling
- **Encryption**: All data encrypted in transit and at rest
- **Error Handling**: Secure error messages without data leakage
- **Session Management**: Automatic token refresh and secure logout

### Input Validation
- Client-side form validation with Mantine Forms
- Server-side validation through Supabase RLS
- SQL injection prevention
- XSS protection through React's built-in sanitization

## 📊 Performance Metrics

### Target Benchmarks
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.0s
- **Cumulative Layout Shift**: < 0.1
- **Lighthouse Score**: 90+ across all categories

### Monitoring
- Real-time error tracking and reporting
- Performance monitoring with Web Vitals
- User behavior analytics
- API response time monitoring
- Database query optimization

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration and authentication flows
- [ ] AI tutor conversations in multiple languages
- [ ] Quiz generation and completion with error handling
- [ ] Progress tracking and XP system
- [ ] Teacher lesson plan generation
- [ ] Analytics dashboard functionality
- [ ] Mobile responsiveness across devices
- [ ] Dark/light theme switching
- [ ] Accessibility with screen readers
- [ ] Error boundary functionality
- [ ] Rate limiting and caching behavior
- [ ] Real-time data synchronization

### Browser Compatibility
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript strict mode requirements
- Use Mantine components for consistent UI
- Implement proper error handling with boundaries
- Add internationalization for new features
- Include accessibility considerations
- Write meaningful commit messages
- Test across multiple browsers and devices

## 📈 Analytics & Monitoring

### Built-in Analytics
- Student engagement metrics
- Learning progress tracking
- Quiz performance analysis
- Teacher activity monitoring
- System usage statistics
- Error tracking and reporting
- Performance monitoring

### Health Checks
- Database connectivity monitoring
- AI service availability checks
- Real-time subscription status
- Authentication service health

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Generative AI** for powering intelligent tutoring
- **Supabase** for backend infrastructure and real-time features
- **Mantine** for the comprehensive UI component library
- **Framer Motion** for smooth animations and micro-interactions
- **React-i18next** for internationalization support
- **Tabler Icons** for the comprehensive icon library
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
- [ ] Multi-tenant support for schools
- [ ] Parent dashboard and reporting
- [ ] Gamification leaderboards
- [ ] AI-powered study recommendations

---

**Built with ❤️ for the future of education • Production-ready • Enterprise-grade • Fully accessible**