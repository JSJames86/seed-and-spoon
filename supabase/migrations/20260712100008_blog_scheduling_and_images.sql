-- Scheduled publishing: a draft with scheduled_at in the past gets flipped
-- to published automatically by a pg_cron job running every minute.
ALTER TABLE posts ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS posts_scheduled_at_idx ON posts (scheduled_at)
  WHERE status = 'draft' AND scheduled_at IS NOT NULL;

CREATE OR REPLACE FUNCTION publish_scheduled_posts()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE posts
  SET status = 'published',
      published_at = COALESCE(published_at, scheduled_at),
      scheduled_at = NULL
  WHERE status = 'draft'
    AND scheduled_at IS NOT NULL
    AND scheduled_at <= now();
END;
$$;

CREATE SCHEMA IF NOT EXISTS cron;
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA cron;

SELECT cron.unschedule(jobid) FROM cron.job WHERE jobname = 'publish-scheduled-posts';
SELECT cron.schedule('publish-scheduled-posts', '* * * * *', 'SELECT publish_scheduled_posts();');

-- Public storage bucket for blog images (cover + in-body), uploaded via the
-- service-role-backed /api/blog/upload-image route.
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;
