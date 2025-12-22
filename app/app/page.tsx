import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Calendar, TrendingUp, Award, Flame, ArrowRight } from 'lucide-react';
import { redirect } from 'next/navigation';
import { format } from 'date-fns';

export const metadata = {
  title: 'Dashboard - CortexAmp',
};

async function getDashboardData(userId: string) {
  const supabase = await createClient();

  const [progressResult, profileResult, recentFeedbackResult, todayChallengeResult] = await Promise.all([
    supabase.from('user_progress').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle(),
    supabase
      .from('ai_feedback')
      .select('*, challenge_submissions(challenge_id, challenges(title, track:tracks(title)))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(3),
    supabase
      .from('challenges')
      .select('*, track:tracks(title)')
      .eq('is_published', true)
      .eq('day_date', format(new Date(), 'yyyy-MM-dd'))
      .limit(1)
      .maybeSingle(),
  ]);

  const todaySubmission = todayChallengeResult.data
    ? await supabase
        .from('challenge_submissions')
        .select('*')
        .eq('user_id', userId)
        .eq('challenge_id', todayChallengeResult.data.id)
        .maybeSingle()
    : null;

  return {
    progress: progressResult.data,
    profile: profileResult.data,
    recentFeedback: recentFeedbackResult.data || [],
    todayChallenge: todayChallengeResult.data,
    todaySubmission: todaySubmission?.data,
  };
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { progress, profile, recentFeedback, todayChallenge, todaySubmission } = await getDashboardData(user.id);

  const hasCompletedToday = !!todaySubmission;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back{profile?.display_name ? `, ${profile.display_name}` : ''}!
        </h1>
        <p className="text-muted-foreground">
          {hasCompletedToday ? "You&apos;ve completed today&apos;s challenge!" : "Ready for today&apos;s challenge?"}
        </p>
      </div>

      {(progress?.challenges_completed || 0) === 0 ? (
        <Card className="mb-8 bg-primary/5 border-primary/20">
          <CardContent className="py-8 text-center">
            <div className="max-w-md mx-auto">
              <h2 className="text-2xl font-bold mb-2">Welcome to CortexAmp! 🎉</h2>
              <p className="text-muted-foreground mb-6">
                You&apos;re about to start building practical AI skills. Complete your first challenge to see your progress here.
              </p>
              <Link href="/app/today">
                <Button size="lg" className="gap-2">
                  Start Your First Challenge
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                Completed
              </CardDescription>
              <CardTitle className="text-3xl">{progress?.challenges_completed || 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Flame className="h-4 w-4" />
                Current Streak
              </CardDescription>
              <CardTitle className="text-3xl">{progress?.current_streak || 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Avg Score
              </CardDescription>
              <CardTitle className="text-3xl">
                {progress?.avg_score ? Number(progress.avg_score).toFixed(1) : '0.0'}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                Best Streak
              </CardDescription>
              <CardTitle className="text-3xl">{progress?.longest_streak || 0}</CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Today&apos;s Challenge
                </CardTitle>
                <CardDescription className="mt-2">
                  {todayChallenge ? (todayChallenge.track as any)?.title : 'No challenge available'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {todayChallenge ? (
              <>
                <h3 className="font-semibold text-lg mb-2">{todayChallenge.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{todayChallenge.scenario}</p>
                {hasCompletedToday ? (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                    <p className="text-sm font-medium text-green-600">Challenge attempted ✔</p>
                    <p className="text-xs text-muted-foreground mt-1">Come back tomorrow for a new challenge</p>
                  </div>
                ) : (
                  <Link href="/app/today">
                    <Button className="w-full gap-2">
                      Start Challenge
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </>
            ) : (
              <p className="text-muted-foreground">No challenge available for today. Check back soon!</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Feedback</CardTitle>
            <CardDescription>Your latest challenge results</CardDescription>
          </CardHeader>
          <CardContent>
            {recentFeedback.length > 0 ? (
              <div className="space-y-4">
                {recentFeedback[0]?.next_challenge_tip && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-4">
                    <h4 className="font-semibold text-xs mb-1 text-primary">💡 Next Action</h4>
                    <p className="text-xs text-muted-foreground">{recentFeedback[0].next_challenge_tip}</p>
                  </div>
                )}
                {recentFeedback.map((feedback: any) => (
                  <div key={feedback.id} className="border-l-2 border-primary/50 pl-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm line-clamp-1">
                        {feedback.challenge_submissions?.challenges?.title || 'Challenge'}
                      </p>
                      <span className="text-sm font-semibold text-primary">{feedback.score}/10</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {feedback.challenge_submissions?.challenges?.track?.title || 'Track'}
                    </p>
                  </div>
                ))}
                <Link href="/app/history">
                  <Button variant="outline" className="w-full mt-2">
                    View All History
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No feedback yet.</p>
                <p className="text-sm mt-2">Complete your first challenge to get started!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
