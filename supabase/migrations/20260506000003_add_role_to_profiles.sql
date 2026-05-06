ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';

COMMENT ON COLUMN profiles.role IS 'user | editor | admin';

-- Index for quick role lookups
CREATE INDEX IF NOT EXISTS profiles_role_idx ON profiles (role);
