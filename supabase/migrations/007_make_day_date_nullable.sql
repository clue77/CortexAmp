-- Migration: Make day_date nullable for draft challenges
-- Allows saving AI-generated challenges without assigning a date immediately

-- Remove NOT NULL constraint from day_date
ALTER TABLE challenges ALTER COLUMN day_date DROP NOT NULL;

-- Add check constraint: published challenges must have a day_date
ALTER TABLE challenges ADD CONSTRAINT published_challenges_must_have_date 
  CHECK (is_published = false OR day_date IS NOT NULL);

-- Update the unique index to handle NULL day_dates
DROP INDEX IF EXISTS challenges_unique_day_difficulty;

-- Recreate index: only enforce uniqueness for published challenges with dates
CREATE UNIQUE INDEX challenges_unique_day_difficulty
ON challenges(day_date, difficulty)
WHERE is_published = true AND day_date IS NOT NULL;

-- Add comment
COMMENT ON COLUMN challenges.day_date IS 'Date when challenge is scheduled. NULL for drafts, required for published challenges.';
