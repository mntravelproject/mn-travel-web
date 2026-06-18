-- ============================================================
-- MN Travel — User Profiles (role management)
-- Execute no Supabase SQL Editor
-- ============================================================

CREATE TABLE user_profiles (
  id         UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role       TEXT        NOT NULL DEFAULT 'staff',  -- 'admin' | 'staff'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can read profiles
CREATE POLICY "auth_read_profiles"
  ON user_profiles FOR SELECT TO authenticated
  USING (true);

-- Only admin service role can write (handled via API route)
CREATE POLICY "admin_all_profiles"
  ON user_profiles FOR ALL TO service_role
  USING (true) WITH CHECK (true);
