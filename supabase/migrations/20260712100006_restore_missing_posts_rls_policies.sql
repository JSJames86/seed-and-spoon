-- Four of the six original RLS policies on posts (from
-- 20260506000004_create_posts_table.sql) are missing from production —
-- editor_read_all, editor_insert, editor_update_own, admin_delete. Only
-- public_read_published and service_role_all remain, which is why the
-- dashboard/admin blog editor's client-side post list (queried with the
-- logged-in user's own session, not the service role) shows nothing:
-- editors/admins have no SELECT policy covering unpublished posts.
-- Restoring the original four, unchanged.
DROP POLICY IF EXISTS "editor_read_all" ON posts;
CREATE POLICY "editor_read_all"
  ON posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('editor', 'admin')
    )
  );

DROP POLICY IF EXISTS "editor_insert" ON posts;
CREATE POLICY "editor_insert"
  ON posts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('editor', 'admin')
    )
  );

DROP POLICY IF EXISTS "editor_update_own" ON posts;
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

DROP POLICY IF EXISTS "admin_delete" ON posts;
CREATE POLICY "admin_delete"
  ON posts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
