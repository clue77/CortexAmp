import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { format } from 'date-fns';
import { ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'History - CortexAmp',
};

async function getHistory(userId: string) {
  const supabase = await createClient();

  const { data: submissions } = await supabase
    .from('challenge_submissions')
    .select(
      `
      *,
      challenge:challenges(
        *,
        track:tracks(title)
      ),
      feedback:ai_feedback(*)
    `
    )
    .eq('user_id', userId)
    .order('submitted_at', { ascending: false });

  return submissions || [];
}

export default async function HistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const submissions = await getHistory(user.id);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Challenge History</h1>
        <p className="text-muted-foreground">Review your past submissions and feedback</p>
      </div>

      {submissions.length > 0 ? (
        <div className="space-y-4">
          {submissions.map((submission: any) => {
            const challenge = submission.challenge;
            const feedback = submission.feedback?.[0];

            return (
              <Link key={submission.id} href={`/app/challenge/${challenge.id}`}>
                <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          {challenge.title}
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {challenge.track?.title} • {format(new Date(submission.submitted_at), 'MMM d, yyyy')}
                        </CardDescription>
                      </div>
                      {feedback && (
                        <div className="text-right ml-4">
                          <div className="text-2xl font-bold text-primary">{feedback.score}/10</div>
                          <div className="text-xs text-muted-foreground">Score</div>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">{submission.submission_text}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No submissions yet.</p>
            <p className="text-sm text-muted-foreground">
              Complete your first challenge to start building your history!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
