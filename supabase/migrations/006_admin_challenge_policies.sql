-- Migration: Add RLS policies for admin challenge management
-- Allows admins to insert, update, and delete challenges

-- Policy: Admins can insert challenges
CREATE POLICY "Admins can insert challenges"
ON challenges FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- Policy: Admins can update challenges
CREATE POLICY "Admins can update challenges"
ON challenges FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- Policy: Admins can delete challenges
CREATE POLICY "Admins can delete challenges"
ON challenges FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- Policy: Admins can read all challenges (including unpublished)
CREATE POLICY "Admins can read all challenges"
ON challenges FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.is_admin = true
  )
);
