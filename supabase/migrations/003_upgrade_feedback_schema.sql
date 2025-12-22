-- Migration: Upgrade AI feedback schema to use structured arrays
-- This migration converts text fields to jsonb arrays and adds next_challenge_tip

-- Step 1: Add new column for next_challenge_tip
ALTER TABLE ai_feedback ADD COLUMN IF NOT EXISTS next_challenge_tip text DEFAULT 'Keep practicing to build your AI skills.';

-- Step 2: Check if we need to migrate (columns are text type)
DO $$
BEGIN
  -- Only proceed if strengths is still text type (not yet migrated)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ai_feedback' 
    AND column_name = 'strengths' 
    AND data_type = 'text'
  ) THEN
    
    -- Rename old columns temporarily
    ALTER TABLE ai_feedback RENAME COLUMN strengths TO strengths_old;
    ALTER TABLE ai_feedback RENAME COLUMN improvements TO improvements_old;
    
    -- Add new jsonb columns
    ALTER TABLE ai_feedback ADD COLUMN strengths jsonb DEFAULT '["Clear effort and relevant direction."]'::jsonb;
    ALTER TABLE ai_feedback ADD COLUMN improvements jsonb DEFAULT '["Add more structure and make the output more actionable."]'::jsonb;
    
    -- Migrate existing data with safe defaults
    UPDATE ai_feedback
    SET strengths = CASE 
      WHEN strengths_old IS NOT NULL AND strengths_old != '' THEN
        to_jsonb(ARRAY[strengths_old])
      ELSE
        '["Clear effort and relevant direction."]'::jsonb
    END;
    
    UPDATE ai_feedback
    SET improvements = CASE 
      WHEN improvements_old IS NOT NULL AND improvements_old != '' THEN
        to_jsonb(ARRAY[improvements_old])
      ELSE
        '["Add more structure and make the output more actionable."]'::jsonb
    END;
    
    -- Drop old columns
    ALTER TABLE ai_feedback DROP COLUMN strengths_old;
    ALTER TABLE ai_feedback DROP COLUMN improvements_old;
    
  END IF;
END $$;

-- Add constraints (drop first if they exist from previous attempts)
ALTER TABLE ai_feedback DROP CONSTRAINT IF EXISTS strengths_max_2;
ALTER TABLE ai_feedback DROP CONSTRAINT IF EXISTS improvements_max_2;
ALTER TABLE ai_feedback DROP CONSTRAINT IF EXISTS next_challenge_tip_length;

-- Set NOT NULL constraints
DO $$
BEGIN
  -- Only set NOT NULL if column exists and is jsonb
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ai_feedback' 
    AND column_name = 'strengths' 
    AND data_type = 'jsonb'
  ) THEN
    ALTER TABLE ai_feedback ALTER COLUMN strengths SET NOT NULL;
    ALTER TABLE ai_feedback ALTER COLUMN improvements SET NOT NULL;
  END IF;
  
  ALTER TABLE ai_feedback ALTER COLUMN next_challenge_tip SET NOT NULL;
END $$;

-- Add check constraints to ensure arrays have max 2 items
ALTER TABLE ai_feedback ADD CONSTRAINT strengths_max_2 
  CHECK (jsonb_array_length(strengths) <= 2);

ALTER TABLE ai_feedback ADD CONSTRAINT improvements_max_2 
  CHECK (jsonb_array_length(improvements) <= 2);

-- Add check constraint for next_challenge_tip length
ALTER TABLE ai_feedback ADD CONSTRAINT next_challenge_tip_length 
  CHECK (char_length(next_challenge_tip) <= 200);
