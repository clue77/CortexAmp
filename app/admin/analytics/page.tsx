import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, TrendingUp, Award, Activity, Target, Flame } from 'lucide-react';
import { AdminNav } from '@/components/admin-nav';

export const metadata = {
  title: 'Analytics - CortexAmp Admin',
};

async function getAnalytics() {
  const supabase = await createClient();

  const [
    engagementResult,
    dailyActivityResult,
    trackAnalyticsResult,
    difficultyResult,
    challengePerformanceResult,
    recentActivityResult
  ] = await Promise.all([
    supabase.from('user_engagement_summary').select('*').single(),
    supabase.from('daily_user_activity').select('*').limit(30).order('date', { ascending: false }),
    supabase.from('track_analytics').select('*'),
    supabase.from('difficulty_distribution').select('*'),
    supabase.from('challenge_performance').select('*').limit(10).order('total_attempts', { ascending: false }),
    supabase.from('recent_activity').select('*').limit(20)
  ]);

  return {
    engagement: engagementResult.data,
    dailyActivity: dailyActivityResult.data || [],
    trackAnalytics: trackAnalyticsResult.data || [],
    difficulty: difficultyResult.data || [],
    topChallenges: challengePerformanceResult.data || [],
    recentActivity: recentActivityResult.data || []
  };
}

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Only allow keysreggie@gmail.com to access admin analytics
  if (user.email !== 'keysreggie@gmail.com') {
    redirect('/app');
  }

  const analytics = await getAnalytics();

  return (
    <>
      <AdminNav />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Monitor CortexAmp performance and user engagement</p>
        </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Users
            </CardDescription>
            <CardTitle className="text-3xl">{analytics.engagement?.total_users || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Active (7d): {analytics.engagement?.active_last_7_days || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Total Submissions
            </CardDescription>
            <CardTitle className="text-3xl">{analytics.engagement?.total_submissions || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Active (30d): {analytics.engagement?.active_last_30_days || 0} users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Avg Feedback Score
            </CardDescription>
            <CardTitle className="text-3xl">
              {analytics.engagement?.avg_feedback_score?.toFixed(1) || '0.0'}/10
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Avg Streak: {analytics.engagement?.avg_streak?.toFixed(1) || '0.0'} days
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Track Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Track Performance
            </CardTitle>
            <CardDescription>Popularity and engagement by track</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.trackAnalytics.map((track: any) => (
                <div key={track.slug} className="border-b pb-3 last:border-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{track.track}</span>
                    <span className="text-sm text-muted-foreground">
                      {track.total_attempts || 0} attempts
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{track.total_challenges || 0} challenges</span>
                    <span>{track.unique_users || 0} users</span>
                    <span>Avg: {track.avg_score?.toFixed(1) || 'N/A'}/10</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Difficulty Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Difficulty Distribution
            </CardTitle>
            <CardDescription>Performance across skill levels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.difficulty.map((diff: any) => (
                <div key={diff.difficulty} className="border-b pb-3 last:border-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium capitalize">{diff.difficulty}</span>
                    <span className="text-sm text-muted-foreground">
                      {diff.total_attempts || 0} attempts
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{diff.total_challenges || 0} challenges</span>
                    <span>Completion: {diff.completion_rate?.toFixed(1) || '0'}%</span>
                    <span>Avg: {diff.avg_score?.toFixed(1) || 'N/A'}/10</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Challenges */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Top Performing Challenges</CardTitle>
          <CardDescription>Most attempted challenges and their performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.topChallenges.slice(0, 10).map((challenge: any) => (
              <div key={challenge.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                <div className="flex-1">
                  <p className="font-medium text-sm">{challenge.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {challenge.track} • {challenge.difficulty}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">{challenge.total_attempts} attempts</span>
                  <span className="text-muted-foreground">
                    {challenge.completion_rate?.toFixed(0) || 0}% complete
                  </span>
                  <span className="font-medium text-primary">
                    {challenge.avg_score?.toFixed(1) || 'N/A'}/10
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Daily Activity */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5" />
            Daily Activity (Last 30 Days)
          </CardTitle>
          <CardDescription>User engagement trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analytics.dailyActivity.slice(0, 10).map((day: any) => (
              <div key={day.date} className="flex items-center justify-between text-sm border-b pb-2 last:border-0">
                <span className="text-muted-foreground">
                  {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <div className="flex items-center gap-4">
                  <span>{day.active_users} users</span>
                  <span>{day.total_submissions} submissions</span>
                  <span className="text-primary font-medium">
                    {day.completion_rate?.toFixed(0) || 0}% complete
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest challenge submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.recentActivity.map((activity: any, i: number) => (
              <div key={i} className="flex items-center justify-between text-sm border-b pb-2 last:border-0">
                <div className="flex-1">
                  <p className="font-medium">{activity.display_name || 'Anonymous'}</p>
                  <p className="text-xs text-muted-foreground">
                    {activity.challenge_title} • {activity.track}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground capitalize">{activity.difficulty}</span>
                  {activity.score && (
                    <span className="text-xs font-medium text-primary">{activity.score}/10</span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {new Date(activity.created_at).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      </div>
    </>
  );
}
