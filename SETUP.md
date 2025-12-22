# CortexAmp Setup Guide

This guide will walk you through setting up CortexAmp from scratch.

## Step 1: Supabase Setup

### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in project details:
   - Name: CortexAmp
   - Database Password: (save this securely)
   - Region: Choose closest to your users
4. Wait for project to be created (~2 minutes)

### Get Your API Keys

1. In your Supabase project dashboard, go to Settings → API
2. Copy the following values:
   - **Project URL** → This is your `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → This is your `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

### Run Database Migrations

1. In Supabase dashboard, go to SQL Editor
2. Click "New Query"
3. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
4. Click "Run"
5. Repeat for `supabase/migrations/002_rls_policies.sql`
6. Finally, run `supabase/seed.sql` to populate tracks and challenges

### Verify Database Setup

1. Go to Table Editor in Supabase
2. You should see tables: profiles, tracks, challenges, challenge_submissions, ai_feedback, user_progress
3. The `tracks` table should have 5 rows
4. The `challenges` table should have 21 rows

## Step 2: OpenAI Setup

### Get Your API Key

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up or login
3. Go to API Keys section
4. Click "Create new secret key"
5. Copy the key (you won't see it again!)
6. This is your `OPENAI_API_KEY`

### Add Credits

Make sure your OpenAI account has credits. The app uses GPT-4o-mini which is very affordable (~$0.15 per 1M input tokens).

## Step 3: Local Development Setup

### Install Dependencies

```bash
npm install
```

### Create Environment File

Create `.env.local` in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI
OPENAI_API_KEY=sk-your-openai-key

# Feature Flags
AI_ENABLED=true
```

### Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Step 4: Test the Application

### Create a Test Account

1. Go to http://localhost:3000/signup
2. Sign up with an email and password
3. You'll be redirected to the dashboard

### Complete Your First Challenge

1. Click "Start Today's Challenge" or go to "Today" in the nav
2. Read the challenge
3. Write your submission
4. Click "Submit for Feedback"
5. Wait ~5-10 seconds for AI feedback
6. Review your feedback and score

### Check Your Progress

1. Go back to Dashboard
2. You should see:
   - Completed: 1
   - Current Streak: 1
   - Your score displayed

## Step 5: Deploy to Vercel

### Connect to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will auto-detect Next.js

### Add Environment Variables

In Vercel project settings → Environment Variables, add:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `AI_ENABLED`

### Deploy

Click "Deploy" and wait for build to complete.

### Configure Custom Domain (Optional)

1. Go to Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

## Troubleshooting

### "No challenge available for today"

- Check that you ran the seed file
- Verify challenges exist in Supabase Table Editor
- Check that `is_published` is `true`
- Ensure `day_date` matches today's date in your timezone

### "Failed to generate feedback"

- Verify `OPENAI_API_KEY` is set correctly
- Check OpenAI account has credits
- Look at browser console and terminal for error messages
- Ensure `AI_ENABLED=true`

### Authentication Issues

- Verify Supabase URL and keys are correct
- Check Supabase Auth settings allow email/password signup
- Confirm RLS policies were applied correctly

### Database Errors

- Ensure all migrations ran successfully
- Check Supabase logs for detailed error messages
- Verify user has a profile (should auto-create on signup)

## Next Steps

### Customize Challenges

Edit `supabase/seed.sql` to add your own challenges, then re-run the seed file.

### Adjust Skill Levels

Users can change their skill level in Profile settings to get different difficulty challenges.

### Monitor Usage

- Check Supabase dashboard for database usage
- Monitor OpenAI usage in their dashboard
- Set up alerts for rate limits

### Add More Features

The codebase is structured to easily add:
- More AI providers (Anthropic, DeepSeek)
- Team/workspace features
- Paid tiers with Stripe
- Advanced analytics
- Social features (leaderboards, sharing)

## Support

If you encounter issues:

1. Check the error messages in browser console and terminal
2. Review Supabase logs
3. Verify all environment variables are set
4. Ensure database migrations completed successfully

For additional help, open an issue on GitHub.
