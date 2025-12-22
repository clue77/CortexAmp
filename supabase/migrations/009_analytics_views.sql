-- Analytics Views for Admin Dashboard
-- These views provide aggregated metrics for monitoring app performance

-- Daily User Activity
CREATE OR REPLACE VIEW daily_user_activity AS
SELECT 
  DATE(cs.created_at) as date,
  COUNT(DISTINCT cs.user_id) as active_users,
  COUNT(*) as total_submissions,
  COUNT(DISTINCT f.id)::float / NULLIF(COUNT(*), 0) * 100 as completion_rate
FROM challenge_submissions cs
LEFT JOIN ai_feedback f ON cs.id = f.submission_id
GROUP BY DATE(cs.created_at)
ORDER BY date DESC;

-- User Retention Cohorts
CREATE OR REPLACE VIEW user_retention AS
SELECT 
  DATE(p.created_at) as signup_date,
  COUNT(DISTINCT p.user_id) as total_signups,
  COUNT(DISTINCT CASE 
    WHEN cs.created_at >= p.created_at + INTERVAL '1 day' 
    AND cs.created_at < p.created_at + INTERVAL '2 days' 
    THEN cs.user_id 
  END) as day_1_retention,
  COUNT(DISTINCT CASE 
    WHEN cs.created_at >= p.created_at + INTERVAL '7 days' 
    AND cs.created_at < p.created_at + INTERVAL '8 days' 
    THEN cs.user_id 
  END) as day_7_retention,
  COUNT(DISTINCT CASE 
    WHEN cs.created_at >= p.created_at + INTERVAL '30 days' 
    AND cs.created_at < p.created_at + INTERVAL '31 days' 
    THEN cs.user_id 
  END) as day_30_retention
FROM profiles p
LEFT JOIN challenge_submissions cs ON p.user_id = cs.user_id
GROUP BY DATE(p.created_at)
ORDER BY signup_date DESC;

-- Challenge Performance
CREATE OR REPLACE VIEW challenge_performance AS
SELECT 
  c.id,
  c.title,
  c.difficulty,
  t.title as track,
  COUNT(cs.id) as total_attempts,
  COUNT(DISTINCT f.id) as completions,
  ROUND(AVG(f.score), 2) as avg_score,
  COUNT(DISTINCT f.id)::float / 
    NULLIF(COUNT(cs.id), 0) * 100 as completion_rate
FROM challenges c
LEFT JOIN challenge_submissions cs ON c.id = cs.challenge_id
LEFT JOIN ai_feedback f ON cs.id = f.submission_id
LEFT JOIN tracks t ON c.track_id = t.id
WHERE c.is_published = true
GROUP BY c.id, c.title, c.difficulty, t.title
ORDER BY total_attempts DESC;

-- Track Popularity
CREATE OR REPLACE VIEW track_analytics AS
SELECT 
  t.title as track,
  t.slug,
  COUNT(DISTINCT c.id) as total_challenges,
  COUNT(DISTINCT cs.id) as total_attempts,
  COUNT(DISTINCT cs.user_id) as unique_users,
  ROUND(AVG(f.score), 2) as avg_score
FROM tracks t
LEFT JOIN challenges c ON t.id = c.track_id AND c.is_published = true
LEFT JOIN challenge_submissions cs ON c.id = cs.challenge_id
LEFT JOIN ai_feedback f ON cs.id = f.submission_id
GROUP BY t.id, t.title, t.slug
ORDER BY total_attempts DESC;

-- User Engagement Summary
CREATE OR REPLACE VIEW user_engagement_summary AS
SELECT 
  COUNT(DISTINCT p.user_id) as total_users,
  COUNT(DISTINCT CASE 
    WHEN cs.created_at >= NOW() - INTERVAL '7 days' 
    THEN cs.user_id 
  END) as active_last_7_days,
  COUNT(DISTINCT CASE 
    WHEN cs.created_at >= NOW() - INTERVAL '30 days' 
    THEN cs.user_id 
  END) as active_last_30_days,
  COUNT(DISTINCT cs.id) as total_submissions,
  ROUND(AVG(up.current_streak), 2) as avg_streak,
  ROUND(AVG(f.score), 2) as avg_feedback_score
FROM profiles p
LEFT JOIN challenge_submissions cs ON p.user_id = cs.user_id
LEFT JOIN user_progress up ON p.user_id = up.user_id
LEFT JOIN ai_feedback f ON cs.id = f.submission_id;

-- Daily Growth Metrics
CREATE OR REPLACE VIEW daily_growth_metrics AS
SELECT 
  date,
  new_signups,
  SUM(new_signups) OVER (ORDER BY date) as cumulative_users,
  total_submissions,
  active_users,
  ROUND((total_submissions::numeric / NULLIF(active_users, 0))::numeric, 2) as avg_submissions_per_user
FROM (
  SELECT 
    DATE(created_at) as date,
    COUNT(*) as new_signups,
    0 as total_submissions,
    0 as active_users
  FROM profiles
  GROUP BY DATE(created_at)
  
  UNION ALL
  
  SELECT 
    DATE(created_at) as date,
    0 as new_signups,
    COUNT(*) as total_submissions,
    COUNT(DISTINCT user_id) as active_users
  FROM challenge_submissions
  GROUP BY DATE(created_at)
) combined
GROUP BY date, new_signups, total_submissions, active_users
ORDER BY date DESC;

-- Difficulty Distribution
CREATE OR REPLACE VIEW difficulty_distribution AS
SELECT 
  c.difficulty,
  COUNT(DISTINCT c.id) as total_challenges,
  COUNT(cs.id) as total_attempts,
  ROUND(AVG(f.score), 2) as avg_score,
  COUNT(DISTINCT f.id)::float / 
    NULLIF(COUNT(cs.id), 0) * 100 as completion_rate
FROM challenges c
LEFT JOIN challenge_submissions cs ON c.id = cs.challenge_id
LEFT JOIN ai_feedback f ON cs.id = f.submission_id
WHERE c.is_published = true
GROUP BY c.difficulty
ORDER BY 
  CASE c.difficulty 
    WHEN 'beginner' THEN 1 
    WHEN 'intermediate' THEN 2 
    WHEN 'advanced' THEN 3 
  END;

-- Recent Activity Feed
CREATE OR REPLACE VIEW recent_activity AS
SELECT 
  cs.created_at,
  p.display_name,
  c.title as challenge_title,
  c.difficulty,
  t.title as track,
  CASE WHEN f.id IS NOT NULL THEN true ELSE false END as has_feedback,
  f.score
FROM challenge_submissions cs
JOIN profiles p ON cs.user_id = p.user_id
JOIN challenges c ON cs.challenge_id = c.id
JOIN tracks t ON c.track_id = t.id
LEFT JOIN ai_feedback f ON cs.id = f.submission_id
ORDER BY cs.created_at DESC
LIMIT 50;

-- Grant access to admin users
GRANT SELECT ON daily_user_activity TO authenticated;
GRANT SELECT ON user_retention TO authenticated;
GRANT SELECT ON challenge_performance TO authenticated;
GRANT SELECT ON track_analytics TO authenticated;
GRANT SELECT ON user_engagement_summary TO authenticated;
GRANT SELECT ON daily_growth_metrics TO authenticated;
GRANT SELECT ON difficulty_distribution TO authenticated;
GRANT SELECT ON recent_activity TO authenticated;
