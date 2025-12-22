-- Advanced Analytics Views
-- Funnel metrics, time-based metrics, feedback quality, and cohort analysis

-- User Funnel Analysis
CREATE OR REPLACE VIEW user_funnel AS
SELECT 
  COUNT(DISTINCT p.user_id) as total_signups,
  COUNT(DISTINCT CASE WHEN cs.id IS NOT NULL THEN p.user_id END) as users_who_submitted,
  COUNT(DISTINCT CASE WHEN f.id IS NOT NULL THEN p.user_id END) as users_who_got_feedback,
  COUNT(DISTINCT CASE WHEN up.current_streak > 0 THEN p.user_id END) as users_with_streak,
  ROUND(COUNT(DISTINCT CASE WHEN cs.id IS NOT NULL THEN p.user_id END)::numeric / 
    NULLIF(COUNT(DISTINCT p.user_id), 0) * 100, 2) as signup_to_submission_rate,
  ROUND(COUNT(DISTINCT CASE WHEN up.current_streak > 1 THEN p.user_id END)::numeric / 
    NULLIF(COUNT(DISTINCT CASE WHEN cs.id IS NOT NULL THEN p.user_id END), 0) * 100, 2) as submission_to_return_rate
FROM profiles p
LEFT JOIN challenge_submissions cs ON p.user_id = cs.user_id
LEFT JOIN ai_feedback f ON cs.id = f.submission_id
LEFT JOIN user_progress up ON p.user_id = up.user_id;

-- Daily Funnel Breakdown
CREATE OR REPLACE VIEW daily_funnel AS
SELECT 
  DATE(p.created_at) as signup_date,
  COUNT(DISTINCT p.user_id) as signups,
  COUNT(DISTINCT CASE 
    WHEN cs.created_at::date = p.created_at::date 
    THEN p.user_id 
  END) as same_day_submissions,
  COUNT(DISTINCT CASE 
    WHEN cs.created_at::date = p.created_at::date + 1 
    THEN p.user_id 
  END) as next_day_submissions,
  ROUND(COUNT(DISTINCT CASE WHEN cs.created_at::date = p.created_at::date THEN p.user_id END)::numeric / 
    NULLIF(COUNT(DISTINCT p.user_id), 0) * 100, 2) as same_day_activation_rate
FROM profiles p
LEFT JOIN challenge_submissions cs ON p.user_id = cs.user_id
GROUP BY DATE(p.created_at)
ORDER BY signup_date DESC;

-- Time-Based Engagement Metrics
CREATE OR REPLACE VIEW engagement_timing AS
SELECT 
  EXTRACT(HOUR FROM cs.created_at) as hour_of_day,
  EXTRACT(DOW FROM cs.created_at) as day_of_week,
  COUNT(*) as submission_count,
  COUNT(DISTINCT cs.user_id) as unique_users,
  ROUND(AVG(f.score), 2) as avg_score
FROM challenge_submissions cs
LEFT JOIN ai_feedback f ON cs.id = f.submission_id
WHERE cs.created_at >= NOW() - INTERVAL '30 days'
GROUP BY EXTRACT(HOUR FROM cs.created_at), EXTRACT(DOW FROM cs.created_at)
ORDER BY submission_count DESC;

-- Average Time Between Submissions
CREATE OR REPLACE VIEW submission_frequency AS
SELECT 
  user_id,
  COUNT(*) as total_submissions,
  MIN(created_at) as first_submission,
  MAX(created_at) as last_submission,
  CASE 
    WHEN COUNT(*) > 1 THEN 
      EXTRACT(EPOCH FROM (MAX(created_at) - MIN(created_at))) / (COUNT(*) - 1) / 3600
    ELSE NULL 
  END as avg_hours_between_submissions
FROM challenge_submissions
GROUP BY user_id
HAVING COUNT(*) > 1;

-- Feedback Score Distribution
CREATE OR REPLACE VIEW feedback_score_distribution AS
SELECT 
  CASE 
    WHEN score BETWEEN 1 AND 3 THEN '1-3 (Needs Work)'
    WHEN score BETWEEN 4 AND 7 THEN '4-7 (Good)'
    WHEN score BETWEEN 8 AND 10 THEN '8-10 (Excellent)'
  END as score_range,
  COUNT(*) as feedback_count,
  ROUND(COUNT(*)::numeric / (SELECT COUNT(*) FROM ai_feedback) * 100, 2) as percentage,
  ROUND(AVG(score), 2) as avg_score_in_range
FROM ai_feedback
GROUP BY 
  CASE 
    WHEN score BETWEEN 1 AND 3 THEN '1-3 (Needs Work)'
    WHEN score BETWEEN 4 AND 7 THEN '4-7 (Good)'
    WHEN score BETWEEN 8 AND 10 THEN '8-10 (Excellent)'
  END
ORDER BY avg_score_in_range;

-- Skill Level Distribution
CREATE OR REPLACE VIEW skill_level_distribution AS
SELECT 
  p.skill_level,
  COUNT(DISTINCT p.user_id) as user_count,
  COUNT(DISTINCT cs.id) as total_submissions,
  ROUND(AVG(f.score), 2) as avg_score,
  ROUND(AVG(up.current_streak), 2) as avg_streak,
  ROUND(COUNT(DISTINCT cs.id)::numeric / NULLIF(COUNT(DISTINCT p.user_id), 0), 2) as avg_submissions_per_user
FROM profiles p
LEFT JOIN challenge_submissions cs ON p.user_id = cs.user_id
LEFT JOIN ai_feedback f ON cs.id = f.submission_id
LEFT JOIN user_progress up ON p.user_id = up.user_id
GROUP BY p.skill_level
ORDER BY 
  CASE p.skill_level 
    WHEN 'beginner' THEN 1 
    WHEN 'intermediate' THEN 2 
    WHEN 'advanced' THEN 3 
  END;

-- Weekly Growth Rate
CREATE OR REPLACE VIEW weekly_growth AS
SELECT 
  DATE_TRUNC('week', created_at) as week_start,
  COUNT(*) as new_signups,
  SUM(COUNT(*)) OVER (ORDER BY DATE_TRUNC('week', created_at)) as cumulative_users,
  LAG(COUNT(*)) OVER (ORDER BY DATE_TRUNC('week', created_at)) as previous_week_signups,
  CASE 
    WHEN LAG(COUNT(*)) OVER (ORDER BY DATE_TRUNC('week', created_at)) > 0 THEN
      ROUND((COUNT(*) - LAG(COUNT(*)) OVER (ORDER BY DATE_TRUNC('week', created_at)))::numeric / 
        LAG(COUNT(*)) OVER (ORDER BY DATE_TRUNC('week', created_at)) * 100, 2)
    ELSE NULL
  END as week_over_week_growth_pct
FROM profiles
GROUP BY DATE_TRUNC('week', created_at)
ORDER BY week_start DESC;

-- Power Users (3+ submissions per week)
CREATE OR REPLACE VIEW power_users AS
SELECT 
  p.user_id,
  p.display_name,
  p.skill_level,
  COUNT(cs.id) as total_submissions,
  up.current_streak,
  up.longest_streak,
  ROUND(AVG(f.score), 2) as avg_score,
  MAX(cs.created_at) as last_active
FROM profiles p
JOIN challenge_submissions cs ON p.user_id = cs.user_id
LEFT JOIN ai_feedback f ON cs.id = f.submission_id
LEFT JOIN user_progress up ON p.user_id = up.user_id
WHERE cs.created_at >= NOW() - INTERVAL '7 days'
GROUP BY p.user_id, p.display_name, p.skill_level, up.current_streak, up.longest_streak
HAVING COUNT(cs.id) >= 3
ORDER BY total_submissions DESC, avg_score DESC;

-- Challenge Completion Time (when we have timestamps)
CREATE OR REPLACE VIEW challenge_timing AS
SELECT 
  c.id,
  c.title,
  c.difficulty,
  t.title as track,
  COUNT(cs.id) as attempts,
  ROUND(AVG(EXTRACT(EPOCH FROM (cs.submitted_at - cs.created_at)) / 60), 2) as avg_minutes_to_complete
FROM challenges c
JOIN challenge_submissions cs ON c.id = cs.challenge_id
JOIN tracks t ON c.track_id = t.id
WHERE cs.submitted_at IS NOT NULL AND cs.created_at IS NOT NULL
GROUP BY c.id, c.title, c.difficulty, t.title
HAVING COUNT(cs.id) >= 3
ORDER BY avg_minutes_to_complete DESC;

-- Streak Analysis
CREATE OR REPLACE VIEW streak_analysis AS
SELECT 
  streak_range,
  COUNT(*) as user_count,
  ROUND(AVG(challenges_completed), 2) as avg_challenges_completed,
  ROUND(AVG(avg_score), 2) as avg_score,
  CASE streak_range
    WHEN '0 (Inactive)' THEN 1
    WHEN '1-2 days' THEN 2
    WHEN '3-6 days' THEN 3
    WHEN '7+ days' THEN 4
  END as sort_order
FROM (
  SELECT 
    CASE 
      WHEN current_streak = 0 THEN '0 (Inactive)'
      WHEN current_streak BETWEEN 1 AND 2 THEN '1-2 days'
      WHEN current_streak BETWEEN 3 AND 6 THEN '3-6 days'
      WHEN current_streak >= 7 THEN '7+ days'
    END as streak_range,
    challenges_completed,
    avg_score
  FROM user_progress
) subquery
GROUP BY streak_range
ORDER BY sort_order;

-- Churn Risk (users who haven't submitted in 7+ days but were active)
CREATE OR REPLACE VIEW churn_risk AS
SELECT 
  p.user_id,
  p.display_name,
  up.current_streak,
  up.longest_streak,
  up.challenges_completed,
  MAX(cs.created_at) as last_submission,
  EXTRACT(DAY FROM NOW() - MAX(cs.created_at)) as days_since_last_submission
FROM profiles p
JOIN challenge_submissions cs ON p.user_id = cs.user_id
LEFT JOIN user_progress up ON p.user_id = up.user_id
GROUP BY p.user_id, p.display_name, up.current_streak, up.longest_streak, up.challenges_completed
HAVING MAX(cs.created_at) < NOW() - INTERVAL '7 days'
  AND COUNT(cs.id) >= 2
ORDER BY days_since_last_submission DESC, up.challenges_completed DESC;

-- Grant access to authenticated users
GRANT SELECT ON user_funnel TO authenticated;
GRANT SELECT ON daily_funnel TO authenticated;
GRANT SELECT ON engagement_timing TO authenticated;
GRANT SELECT ON submission_frequency TO authenticated;
GRANT SELECT ON feedback_score_distribution TO authenticated;
GRANT SELECT ON skill_level_distribution TO authenticated;
GRANT SELECT ON weekly_growth TO authenticated;
GRANT SELECT ON power_users TO authenticated;
GRANT SELECT ON challenge_timing TO authenticated;
GRANT SELECT ON streak_analysis TO authenticated;
GRANT SELECT ON churn_risk TO authenticated;
