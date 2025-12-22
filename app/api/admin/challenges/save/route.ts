import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('user_id', user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    const body = await request.json();
    const { challenge, publish } = body;

    if (!challenge) {
      return NextResponse.json({ error: 'Missing challenge data' }, { status: 400 });
    }

    // Prepare challenge for insertion
    const challengeData = {
      track_id: challenge.track_id,
      difficulty: challenge.difficulty,
      title: challenge.title,
      scenario: challenge.scenario,
      instructions: challenge.instructions,
      success_criteria: challenge.success_criteria,
      canonical_goal: challenge.canonical_goal,
      challenge_fingerprint: challenge.challenge_fingerprint,
      generated_by_ai: challenge.generated_by_ai || false,
      reviewed_by_human: true, // Human is saving it
      is_published: publish || false,
      day_date: challenge.day_date || null,
    };

    // Insert challenge
    const { data, error } = await supabase
      .from('challenges')
      .insert(challengeData)
      .select()
      .single();

    if (error) {
      console.error('Challenge save error:', error);
      
      // Check if it's a duplicate fingerprint error
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Duplicate challenge detected - this challenge already exists in the database' },
          { status: 409 }
        );
      }
      
      // Check if it's a NOT NULL constraint on day_date
      if (error.code === '23502' && error.message?.includes('day_date')) {
        return NextResponse.json(
          { error: 'Published challenges require a date. Please select a date or save as draft.' },
          { status: 400 }
        );
      }
      
      // Check if it's the published_challenges_must_have_date constraint
      if (error.code === '23514' && error.message?.includes('published_challenges_must_have_date')) {
        return NextResponse.json(
          { error: 'Published challenges require a date. Please select a date.' },
          { status: 400 }
        );
      }
      
      // Check if it's an RLS policy violation
      if (error.code === '42501') {
        return NextResponse.json(
          { error: 'Permission denied. Make sure you are logged in as an admin.' },
          { status: 403 }
        );
      }
      
      throw error;
    }

    return NextResponse.json({
      success: true,
      challenge: data,
      message: publish ? 'Challenge published successfully' : 'Challenge saved as draft',
    });
  } catch (error: any) {
    console.error('Challenge save error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save challenge' },
      { status: 500 }
    );
  }
}
