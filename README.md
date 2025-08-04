
# Hashim - AI-Powered Personal Fitness Trainer

Hashim is a comprehensive fitness tracking application that combines AI-powered personalized training with nutrition monitoring and progress tracking. Get customized workout plans, automated meal analysis, and intelligent coaching through our AI assistant.

## 🌟 Features

- **🏋️ Personalized Workouts**: AI-generated workout plans based on your fitness assessment
- **📸 Smart Nutrition Tracking**: Photo-based meal analysis with automatic calorie counting
- **🤖 AI Fitness Assistant**: Conversational AI coach for guidance and motivation
- **📊 Progress Tracking**: Comprehensive analytics for workouts, nutrition, and body metrics
- **📱 Mobile-First Design**: Responsive interface optimized for mobile devices
- **🌙 Dark Mode**: Beautiful dark and light themes

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account
- OpenAI API key
- AWS account (for Rekognition)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hashim-fitness-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project
   - Run the SQL schema from `src/lib/supabase/schema.sql`
   - Configure authentication settings

4. **Configure environment variables**
   - Set up Supabase secrets (see Environment Variables section)
   - Configure AWS credentials for Rekognition
   - Add OpenAI API key

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## 🔧 Environment Variables

The following secrets need to be configured in your Supabase project:

### Required Secrets
- `OPENAI_API_KEY` - Your OpenAI API key for AI features
- `AWS_ACCESS_KEY_ID` - AWS access key for Rekognition
- `AWS_SECRET_ACCESS_KEY` - AWS secret key for Rekognition
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key

### Setting Up Secrets

1. Go to your Supabase project dashboard
2. Navigate to Settings > Edge Functions
3. Add each secret in the "Environment Variables" section

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   └── ...             # Feature-specific components
├── hooks/              # Custom React hooks
├── lib/                # Utilities and services
│   └── supabase/       # Supabase configuration and services
├── pages/              # Page components
├── context/            # React context providers
└── integrations/       # External service integrations
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🗄️ Database Setup

1. **Run the schema migration**
   ```sql
   -- Copy and run the contents of src/lib/supabase/schema.sql
   ```

2. **Set up Row Level Security (RLS)**
   ```sql
   -- Enable RLS on all tables
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;
   -- Continue for all tables...
   ```

3. **Configure storage buckets**
   ```sql
   -- Create storage bucket for meal images
   INSERT INTO storage.buckets (id, name, public)
   VALUES ('meal-images', 'meal-images', true);
   ```

## 🚀 Deployment

### Deploy to Vercel

1. **Connect your repository to Vercel**
2. **Set environment variables** in Vercel dashboard
3. **Deploy** - Vercel will automatically build and deploy

### Deploy to Netlify

1. **Connect your repository to Netlify**
2. **Configure build settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. **Set environment variables** in Netlify dashboard
4. **Deploy**

### Deploy Edge Functions

1. **Install Supabase CLI**
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**
   ```bash
   supabase login
   ```

3. **Deploy functions**
   ```bash
   supabase functions deploy
   ```

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](docs/CONTRIBUTING.md) for guidelines.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📖 [Documentation](docs/)
- 🐛 [Issue Tracker](issues/)
- 💬 [Community Discord](#)
- 📧 Email: support@hashim-fitness.com

## 🏗️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **AI Services**: OpenAI GPT-4, AWS Rekognition
- **State Management**: TanStack Query, React Context
- **Build Tool**: Vite
- **UI Components**: shadcn/ui

## 📊 Project Status

- ✅ Core authentication and user management
- ✅ Fitness assessment and AI workout generation
- ✅ Workout tracking and progress logging
- ✅ Meal photo analysis and nutrition tracking
- ✅ AI chat assistant
- 🚧 Advanced analytics and reporting
- 🚧 Social features and workout sharing
- 🚧 Wearable device integration

---

Built with ❤️ by the Hashim team
