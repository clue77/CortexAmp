-- Fix ai_feedback table schema to match API expectations
-- The table has user_id as NOT NULL but we can derive it from submission_id
-- Also remove next_challenge_tip if it exists (not in original schema)

-- Drop the column if it exists (from a previous attempt)
ALTER TABLE ai_feedback DROP COLUMN IF EXISTS next_challenge_tip;

-- The user_id is actually redundant since we can get it from the submission
-- But since it's already there and has an index, we'll keep it
-- The API should be providing it, so let's check why it's null

-- For now, let's just ensure the schema matches what we're inserting
-- No changes needed to the core schema, just need to fix the API
