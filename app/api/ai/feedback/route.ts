import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getAIProvider, AI_ENABLED } from '@/lib/ai';
import { format, parseISO, differenceInCalendarDays } from 'date-fns';
import { AIFeedbackResponse } from '@/lib/ai/types';

const FALLBACK_FEEDBACK: AIFeedbackResponse = {
  score: 7,
  strengths: ['Clear effort and relevant direction.'],
  improvements: ['Add more structure and make the output more actionable.'],
  suggested_revision: 'Try rewriting your answer with clear steps and specific examples.',
  next_challenge_tip: 'Focus on making your output easier to apply.',
};

async function generateFeedbackWithRetry(
  aiProvider: any,
  challenge: any,
  submissionText: string,
  maxRetries = 1
): Promise<AIFeedbackResponse> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const feedbackResponse = await aiProvider.generateFeedback(
        challenge.title,
        submissionText.trim(),
        {
          title: challenge.title,
          difficulty: challenge.difficulty,
          track: challenge.track?.title || 'General',
          scenario: challenge.scenario,
          instructions: challenge.instructions,
          successCriteria: challenge.success_criteria || 'Follow instructions, be clear, be actionable.',
        }
      );

      // Validate response structure
      if (!feedbackResponse || typeof feedbackResponse.score !== 'number') {
        throw new Error('Invalid AI response structure');
      }

      return feedbackResponse;
    } catch (error: any) {
      lastError = error;
      console.error(`AI feedback attempt ${attempt + 1} failed:`, error);
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  }

  console.error('All AI feedback attempts failed, using fallback');
  return FALLBACK_FEEDBACK;
}

export async function POST(request: NextRequest) {
  try {
    if (!AI_ENABLED) {
      return NextResponse.json(
        { error: 'AI feedback is currently disabled' },
        { status: 503 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { challengeId, submissionText } = body;

    if (!challengeId || !submissionText?.trim()) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data: challenge, error: challengeError } = await supabase
      .from('challenges')
      .select('*, track:tracks(title)')
      .eq('id', challengeId)
      .eq('is_published', true)
      .single();

    if (challengeError || !challenge) {
      return NextResponse.json(
        { error: 'Challenge not found' },
        { status: 404 }
      );
    }

    // Check if user already submitted this challenge
    const { data: existingSubmission } = await supabase
      .from('challenge_submissions')
      .select('id, ai_feedback(*)')
      .eq('user_id', user.id)
      .eq('challenge_id', challengeId)
      .maybeSingle();

    if (existingSubmission) {
      // Return existing submission and feedback instead of error
      return NextResponse.json({
        submission: existingSubmission,
        feedback: (existingSubmission as any).ai_feedback?.[0] || null,
        message: 'You have already submitted this challenge',
      });
    }

    // Rate limiting: 5 submissions per day
    const today = format(new Date(), 'yyyy-MM-dd');
    const { data: todaySubmissions } = await supabase
      .from('challenge_submissions')
      .select('id')
      .eq('user_id', user.id)
      .gte('created_at', `${today}T00:00:00`)
      .lte('created_at', `${today}T23:59:59`);

    if (todaySubmissions && todaySubmissions.length >= 5) {
      return NextResponse.json(
        { error: 'Daily rate limit reached (5 submissions per day)' },
        { status: 429 }
      );
    }

    const userId = user.id; // Store user ID before using service client
    const serviceSupabase = await createServiceClient();

    // Insert submission
    const { data: submission, error: submissionError } = await serviceSupabase
      .from('challenge_submissions')
      .insert({
        user_id: userId,
        challenge_id: challengeId,
        submission_text: submissionText.trim(),
      })
      .select()
      .single();

    if (submissionError || !submission) {
      throw new Error('Failed to save submission');
    }

    // Generate AI feedback with retry and fallback
    const aiProvider = getAIProvider();
    const feedbackResponse = await generateFeedbackWithRetry(
      aiProvider,
      challenge,
      submissionText
    );

    // Insert feedback - pass arrays directly to match database schema
    const feedbackData = {
      submission_id: submission.id,
      user_id: userId,
      model: 'gpt-4o-mini',
      score: feedbackResponse.score,
      strengths: feedbackResponse.strengths,
      improvements: feedbackResponse.improvements,
      suggested_revision: feedbackResponse.suggested_revision,
    };

    const { data: feedback, error: feedbackInsertError } = await serviceSupabase
      .from('ai_feedback')
      .insert(feedbackData)
      .select()
      .single();

    if (feedbackInsertError || !feedback) {
      console.error('Feedback insert error:', feedbackInsertError);
      throw new Error('Failed to save feedback');
    }

    // Update user progress
    const { data: progress } = await serviceSupabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    const newCompletedCount = (progress?.challenges_completed || 0) + 1;
    
    let newStreak = 1;
    if (progress?.last_completed_date) {
      const lastDate = parseISO(progress.last_completed_date);
      const daysDiff = differenceInCalendarDays(new Date(), lastDate);
      
      if (daysDiff === 1) {
        newStreak = (progress.current_streak || 0) + 1;
      } else if (daysDiff === 0) {
        newStreak = progress.current_streak || 1;
      }
    }

    const newLongestStreak = Math.max(newStreak, progress?.longest_streak || 0);
    
    const totalScore = (progress?.avg_score || 0) * (progress?.challenges_completed || 0) + feedbackResponse.score;
    const newAvgScore = Math.round((totalScore / newCompletedCount) * 10) / 10;

    await serviceSupabase
      .from('user_progress')
      .upsert({
        user_id: userId,
        challenges_completed: newCompletedCount,
        current_streak: newStreak,
        longest_streak: newLongestStreak,
        last_completed_date: format(new Date(), 'yyyy-MM-dd'),
        avg_score: newAvgScore,
      });

    return NextResponse.json({
      submission,
      feedback,
    });
  } catch (error: any) {
    console.error('AI feedback error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate feedback' },
      { status: 500 }
    );
  }
}
