-- Fix unique constraint to allow multiple challenges per day/difficulty across different tracks
-- The current constraint prevents having beginner challenges from different tracks on the same day

-- Drop the old constraint
DROP INDEX IF EXISTS challenges_unique_day_difficulty;

-- Create new constraint that includes track_id
-- This allows: Prompt Engineering beginner + Automation beginner on same day
-- But prevents: Two Prompt Engineering beginner challenges on same day
CREATE UNIQUE INDEX challenges_unique_day_difficulty_track
ON challenges(day_date, difficulty, track_id)
WHERE is_published = true AND day_date IS NOT NULL;
