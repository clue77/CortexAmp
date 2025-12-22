import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { format } from 'date-fns';
import { CheckCircle2, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Challenge Detail - CortexAmp',
};

async function getChallengeDetail(challengeId: string, userId: string) {
  const supabase = await createClient();

  const { data: challenge } = await supabase
    .from('challenges')
    .select('*, track:tracks(title)')
    .eq('id', challengeId)
    .single();

  if (!challenge) return null;

  const { data: submission } = await supabase
    .from('challenge_submissions')
    .select('*')
    .eq('challenge_id', challengeId)
    .eq('user_id', userId)
    .maybeSingle();

  if (!submission) return { challenge, submission: null, feedback: null };

  const { data: feedback } = await supabase
    .from('ai_feedback')
    .select('*')
    .eq('submission_id', submission.id)
    .maybeSingle();

  return { challenge, submission, feedback };
}

export default async function ChallengeDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const data = await getChallengeDetail(params.id, user.id);

  if (!data || !data.challenge) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Challenge Not Found</CardTitle>
            <CardDescription>This challenge doesn't exist or you don't have access to it.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/app/history">
              <Button>Back to History</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { challenge, submission, feedback } = data;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/app/history">
          <Button variant="ghost" className="gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to History
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mb-2">{challenge.title}</h1>
        <p className="text-muted-foreground">
          {(challenge.track as any)?.title} • {format(new Date(challenge.day_date), 'MMMM d, yyyy')}
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Challenge Details</CardTitle>
          <CardDescription className="capitalize">Difficulty: {challenge.difficulty}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Scenario</h3>
            <p className="text-muted-foreground">{challenge.scenario}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Instructions</h3>
            <p className="text-muted-foreground">{challenge.instructions}</p>
          </div>

          {challenge.success_criteria && (
            <div>
              <h3 className="font-semibold mb-2">Success Criteria</h3>
              <p className="text-muted-foreground">{challenge.success_criteria}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {submission && feedback && (
        <>
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Your Feedback</CardTitle>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">{feedback.score}/10</div>
                  <div className="text-xs text-muted-foreground">Score</div>
                </div>
              </div>
              <CardDescription>Submitted {format(new Date(submission.submitted_at), 'MMM d, yyyy')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                  Strengths
                </h3>
                <ul className="space-y-2">
                  {(Array.isArray(feedback.strengths) ? feedback.strengths : 
                    typeof feedback.strengths === 'string' ? JSON.parse(feedback.strengths) : 
                    [feedback.strengths]).map((strength: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span className="text-muted-foreground">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">Areas for Improvement</h3>
                <ul className="space-y-2">
                  {(Array.isArray(feedback.improvements) ? feedback.improvements : 
                    typeof feedback.improvements === 'string' ? JSON.parse(feedback.improvements) : 
                    [feedback.improvements]).map((improvement: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span className="text-muted-foreground">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">Suggested Revision</h3>
                <div className="bg-secondary/50 border border-primary/20 rounded-lg p-4">
                  <p className="text-sm text-foreground">{feedback.suggested_revision}</p>
                </div>
              </div>

              {feedback.next_challenge_tip && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <h3 className="font-semibold text-sm mb-2 text-primary">💡 Next Challenge Tip</h3>
                  <p className="text-sm text-muted-foreground">{feedback.next_challenge_tip}</p>
                </div>
              )}

              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground italic">
                  ⚠️ AI-generated feedback. Review before relying.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Submission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">{submission.submission_text}</p>
            </CardContent>
          </Card>
        </>
      )}

      {!submission && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">You haven't submitted this challenge yet.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
