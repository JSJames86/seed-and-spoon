CREATE TABLE IF NOT EXISTS posts (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  title           TEXT        NOT NULL,
  slug            TEXT        NOT NULL UNIQUE,
  cover_image_url TEXT,
  body            TEXT,
  excerpt         TEXT,
  status          TEXT        NOT NULL DEFAULT 'draft',  -- draft | published
  author_id       UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name     TEXT,
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS posts_slug_idx       ON posts (slug);
CREATE INDEX IF NOT EXISTS posts_status_idx     ON posts (status, published_at DESC);
CREATE INDEX IF NOT EXISTS posts_author_idx     ON posts (author_id);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Public can read published posts
CREATE POLICY "public_read_published"
  ON posts FOR SELECT
  USING (status = 'published');

-- Editors and admins can read all posts (including drafts)
CREATE POLICY "editor_read_all"
  ON posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('editor', 'admin')
    )
  );

-- Editors can insert their own posts
CREATE POLICY "editor_insert"
  ON posts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('editor', 'admin')
    )
  );

-- Editors can update their own posts; admins can update any
CREATE POLICY "editor_update_own"
  ON posts FOR UPDATE
  USING (
    author_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Only admins can delete
CREATE POLICY "admin_delete"
  ON posts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Service role bypasses RLS (used by API key routes)
CREATE POLICY "service_role_all"
  ON posts FOR ALL
  USING (auth.role() = 'service_role');

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION set_posts_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION set_posts_updated_at();
