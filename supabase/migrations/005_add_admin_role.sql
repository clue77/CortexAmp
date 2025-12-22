-- Migration: Add admin role to profiles
-- Required for admin-only challenge generator access

-- Add is_admin column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- Create index for admin lookups
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin) WHERE is_admin = true;

-- Add comment
COMMENT ON COLUMN profiles.is_admin IS 'True if user has admin privileges for challenge generation and management';

-- Note: You'll need to manually set is_admin = true for your admin user(s)
-- Example: UPDATE profiles SET is_admin = true WHERE user_id = 'your-user-id';
