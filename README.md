# CortexAmp

**Learn AI by doing.**

CortexAmp is a daily AI micro-learning challenge platform where users complete daily challenges, submit answers, receive AI feedback, and track progress and streaks.

## Features

- 🎯 **Daily AI Challenges** - Get a new challenge every day tailored to your skill level
- 🤖 **Instant AI Feedback** - Receive personalized feedback on your submissions
- 📊 **Progress Tracking** - Monitor your streak, completion rate, and average scores
- 🎓 **Multiple Tracks** - Prompt Engineering, Automation, Business, Creativity, and Data Analysis
- 🔒 **Secure & Private** - Built with Supabase RLS policies and secure authentication

## Tech Stack

- **Framework**: Next.js 14+ (App Router, TypeScript)
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (Auth, Postgres, Storage)
- **AI**: OpenAI (swappable architecture for Anthropic/DeepSeek)
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ 
- A Supabase account
- An OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd CortexAmp
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

OPENAI_API_KEY=your_openai_api_key

AI_ENABLED=true
```

4. Set up Supabase:

- Create a new Supabase project
- Run the migrations in order:
  - `supabase/migrations/001_initial_schema.sql`
  - `supabase/migrations/002_rls_policies.sql`
- Run the seed file: `supabase/seed.sql`

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
CortexAmp/
├── app/                      # Next.js app directory
│   ├── (public pages)        # Landing, pricing, login, signup, terms, privacy
│   ├── app/                  # Authenticated app pages
│   │   ├── page.tsx          # Dashboard
│   │   ├── today/            # Today's challenge
│   │   ├── history/          # Challenge history
│   │   ├── challenge/[id]/   # Challenge detail
│   │   └── profile/          # User profile settings
│   └── api/
│       └── ai/feedback/      # AI feedback generation endpoint
├── components/
│   ├── ui/                   # shadcn/ui components
│   ├── navbar.tsx            # Public navbar
│   ├── app-navbar.tsx        # App navbar
│   └── footer.tsx            # Footer
├── lib/
│   ├── ai/                   # AI provider abstraction
│   ├── supabase/             # Supabase client utilities
│   ├── types/                # TypeScript types
│   └── utils.ts              # Utility functions
├── supabase/
│   ├── migrations/           # Database migrations
│   └── seed.sql              # Seed data
└── middleware.ts             # Auth middleware

```

## Database Schema

### Tables

- **profiles** - User settings (skill level, timezone, display name)
- **tracks** - Challenge categories (Prompt Engineering, Automation, etc.)
- **challenges** - Challenge content and scheduling
- **challenge_submissions** - User submissions (one per challenge)
- **ai_feedback** - AI-generated feedback (immutable)
- **user_progress** - Denormalized progress metrics (streaks, scores)

### Security

- Row Level Security (RLS) enabled on all tables
- Users can only read/write their own data
- Server-side operations use service role key
- No API keys exposed to client

## Key Features

### Daily Challenges

Challenges are assigned based on:
- User's skill level (beginner/intermediate/advanced)
- User's timezone
- Current date

### AI Feedback

- Powered by OpenAI GPT-4o-mini
- Rate limited to 5 submissions per day
- Provides: score (1-10), strengths, improvements, suggested revision
- Includes AI disclaimer on all feedback

### Progress Tracking

Automatically calculates:
- Total challenges completed
- Current streak (consecutive days)
- Longest streak
- Average score across all submissions

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production

Make sure to set all variables from `.env.local.example` in your Vercel project settings.

## Development

### Adding New Challenges

Add challenges via Supabase SQL editor or seed file:

```sql
INSERT INTO challenges (track_id, difficulty, title, scenario, instructions, success_criteria, day_date, is_published)
VALUES (...);
```

### Swapping AI Providers

The AI provider is abstracted in `lib/ai/`. To add a new provider:

1. Create a new provider class implementing `AIProvider` interface
2. Update `lib/ai/index.ts` to use the new provider
3. Add necessary environment variables

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
