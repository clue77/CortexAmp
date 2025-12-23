import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { generateChallenges, checkSemanticSimilarity } from '@/lib/ai/deepseek-provider';
import { generateChallengeFingerprint } from '@/lib/challenge-utils';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin (you'll need to add admin role to profiles)
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('user_id', user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    const body = await request.json();
    const { track_id, difficulty, count } = body;

    if (!track_id || !difficulty || !count) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (count < 1 || count > 10) {
      return NextResponse.json({ error: 'Count must be between 1 and 10' }, { status: 400 });
    }

    // Get track name
    const { data: track } = await supabase
      .from('tracks')
      .select('title')
      .eq('id', track_id)
      .single();

    if (!track) {
      return NextResponse.json({ error: 'Track not found' }, { status: 404 });
    }

    // Generate challenges using DeepSeek
    const generatedChallenges = await generateChallenges({
      track: track.title,
      difficulty,
      count,
    });

    // Get existing canonical goals for similarity check
    const { data: existingChallenges } = await supabase
      .from('challenges')
      .select('canonical_goal')
      .not('canonical_goal', 'is', null);

    const existingGoals = existingChallenges?.map(c => c.canonical_goal) || [];

    // Process each challenge
    const processedChallenges = await Promise.all(
      generatedChallenges.map(async (challenge) => {
        const fingerprint = generateChallengeFingerprint(challenge.canonical_goal);
        

        // Check for exact duplicate (Layer 1)
        const { data: duplicate } = await supabase
          .from('challenges')
          .select('id')
          .eq('challenge_fingerprint', fingerprint)
          .single();

        let similarityStatus: 'duplicate' | 'very_similar' | 'sufficiently_different' = 'sufficiently_different';

        if (duplicate) {
          similarityStatus = 'duplicate';
        } else {
          // Check semantic similarity (Layer 2)
          similarityStatus = await checkSemanticSimilarity(
            challenge.canonical_goal,
            existingGoals
          );
        }

        return {
          ...challenge,
          track_id,
          difficulty,
          challenge_fingerprint: fingerprint,
          similarity_status: similarityStatus,
          generated_by_ai: true,
          reviewed_by_human: false,
          is_published: false,
        };
      })
    );

    return NextResponse.json({
      challenges: processedChallenges,
      track: track.title,
    });
  } catch (error: any) {
    console.error('Challenge generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate challenges' },
      { status: 500 }
    );
  }
}
