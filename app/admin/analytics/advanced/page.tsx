import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminNav } from '@/components/admin-nav';
import { TrendingUp, Users, Clock, Award, AlertTriangle, Zap, Target, Calendar } from 'lucide-react';

export const metadata = {
  title: 'Advanced Analytics - CortexAmp Admin',
};

async function getAdvancedAnalytics() {
  const supabase = await createClient();

  const [
    funnelResult,
    dailyFunnelResult,
    engagementTimingResult,
    scoreDistributionResult,
    skillDistributionResult,
    weeklyGrowthResult,
    powerUsersResult,
    streakAnalysisResult,
    churnRiskResult
  ] = await Promise.all([
    supabase.from('user_funnel').select('*').single(),
    supabase.from('daily_funnel').select('*').limit(14).order('signup_date', { ascending: false }),
    supabase.from('engagement_timing').select('*').limit(24).order('submission_count', { ascending: false }),
    supabase.from('feedback_score_distribution').select('*'),
    supabase.from('skill_level_distribution').select('*'),
    supabase.from('weekly_growth').select('*').limit(12).order('week_start', { ascending: false }),
    supabase.from('power_users').select('*').limit(20),
    supabase.from('streak_analysis').select('*'),
    supabase.from('churn_risk').select('*').limit(15)
  ]);

  return {
    funnel: funnelResult.data,
    dailyFunnel: dailyFunnelResult.data || [],
    engagementTiming: engagementTimingResult.data || [],
    scoreDistribution: scoreDistributionResult.data || [],
    skillDistribution: skillDistributionResult.data || [],
    weeklyGrowth: weeklyGrowthResult.data || [],
    powerUsers: powerUsersResult.data || [],
    streakAnalysis: streakAnalysisResult.data || [],
    churnRisk: churnRiskResult.data || []
  };
}

export default async function AdvancedAnalyticsPage() {
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

  const analytics = await getAdvancedAnalytics();

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <>
      <AdminNav />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Advanced Analytics</h1>
          <p className="text-muted-foreground">Deep insights into user behavior and engagement</p>
        </div>

        {/* User Funnel */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              User Funnel
            </CardTitle>
            <CardDescription>Conversion rates through the user journey</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl font-bold text-primary">{analytics.funnel?.total_signups || 0}</div>
                <div className="text-sm text-muted-foreground mt-1">Total Signups</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl font-bold text-primary">{analytics.funnel?.users_who_submitted || 0}</div>
                <div className="text-sm text-muted-foreground mt-1">Submitted Challenge</div>
                <div className="text-xs text-primary font-medium mt-2">
                  {analytics.funnel?.signup_to_submission_rate || 0}% conversion
                </div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl font-bold text-primary">{analytics.funnel?.users_who_got_feedback || 0}</div>
                <div className="text-sm text-muted-foreground mt-1">Got Feedback</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl font-bold text-primary">{analytics.funnel?.users_with_streak || 0}</div>
                <div className="text-sm text-muted-foreground mt-1">Active Streak</div>
                <div className="text-xs text-primary font-medium mt-2">
                  {analytics.funnel?.submission_to_return_rate || 0}% return rate
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Weekly Growth */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Weekly Growth
              </CardTitle>
              <CardDescription>Week-over-week signup trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.weeklyGrowth.slice(0, 8).map((week: any) => (
                  <div key={week.week_start} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div>
                      <div className="text-sm font-medium">
                        {new Date(week.week_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {week.cumulative_users} total users
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{week.new_signups} signups</div>
                      {week.week_over_week_growth_pct !== null && (
                        <div className={`text-xs ${week.week_over_week_growth_pct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {week.week_over_week_growth_pct >= 0 ? '+' : ''}{week.week_over_week_growth_pct}%
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Feedback Score Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Feedback Score Distribution
              </CardTitle>
              <CardDescription>Quality of user submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.scoreDistribution.map((range: any) => (
                  <div key={range.score_range} className="border-b pb-3 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{range.score_range}</span>
                      <span className="text-sm text-muted-foreground">{range.feedback_count} submissions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-secondary rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${range.percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-12 text-right">{range.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Skill Level Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Skill Level Distribution
              </CardTitle>
              <CardDescription>User distribution and performance by skill level</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.skillDistribution.map((skill: any) => (
                  <div key={skill.skill_level} className="border-b pb-3 last:border-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium capitalize">{skill.skill_level}</span>
                      <span className="text-sm text-muted-foreground">{skill.user_count} users</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                      <div>{skill.total_submissions} submissions</div>
                      <div>Avg: {skill.avg_score?.toFixed(1) || 'N/A'}/10</div>
                      <div>{skill.avg_submissions_per_user?.toFixed(1) || 0} per user</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Streak Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Streak Analysis
              </CardTitle>
              <CardDescription>User engagement consistency</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.streakAnalysis.map((streak: any) => (
                  <div key={streak.streak_range} className="border-b pb-3 last:border-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{streak.streak_range}</span>
                      <span className="text-sm text-muted-foreground">{streak.user_count} users</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div>Avg: {streak.avg_challenges_completed?.toFixed(1) || 0} challenges</div>
                      <div>Score: {streak.avg_score?.toFixed(1) || 'N/A'}/10</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Engagement Timing */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Peak Engagement Times
            </CardTitle>
            <CardDescription>When users are most active (last 30 days)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {analytics.engagementTiming.slice(0, 12).map((time: any) => (
                <div key={`${time.day_of_week}-${time.hour_of_day}`} className="border rounded-lg p-3">
                  <div className="text-sm font-medium">
                    {dayNames[time.day_of_week]} {time.hour_of_day}:00
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {time.submission_count} submissions
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {time.unique_users} users
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Power Users */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Power Users (3+ challenges this week)
            </CardTitle>
            <CardDescription>Most engaged users - potential advocates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.powerUsers.map((user: any) => (
                <div key={user.user_id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{user.display_name || 'Anonymous'}</div>
                    <div className="text-xs text-muted-foreground capitalize">{user.skill_level}</div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span>{user.total_submissions} this week</span>
                    <span className="text-muted-foreground">🔥 {user.current_streak}</span>
                    <span className="text-primary font-medium">{user.avg_score?.toFixed(1) || 'N/A'}/10</span>
                  </div>
                </div>
              ))}
              {analytics.powerUsers.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No power users yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Churn Risk */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Churn Risk (Inactive 7+ days)
            </CardTitle>
            <CardDescription>Previously active users who may need re-engagement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.churnRisk.map((user: any) => (
                <div key={user.user_id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{user.display_name || 'Anonymous'}</div>
                    <div className="text-xs text-muted-foreground">
                      {user.challenges_completed} challenges • Best streak: {user.longest_streak}
                    </div>
                  </div>
                  <div className="text-sm text-orange-600">
                    {Math.floor(user.days_since_last_submission)} days ago
                  </div>
                </div>
              ))}
              {analytics.churnRisk.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No at-risk users - great retention! 🎉</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Daily Activation */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Daily Activation Rate
            </CardTitle>
            <CardDescription>Same-day submission rate by signup date</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.dailyFunnel.map((day: any) => (
                <div key={day.signup_date} className="flex items-center justify-between text-sm border-b pb-2 last:border-0">
                  <span className="text-muted-foreground">
                    {new Date(day.signup_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <div className="flex items-center gap-4">
                    <span>{day.signups} signups</span>
                    <span>{day.same_day_submissions} same-day</span>
                    <span className="text-primary font-medium">{day.same_day_activation_rate || 0}%</span>
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
