-- Knowledge Center taxonomy for blog posts: pillar grouping, free-form tags,
-- and an optional author ORCID for research-backed posts. All additive and
-- nullable, so existing posts and queries are unaffected.
ALTER TABLE posts ADD COLUMN IF NOT EXISTS pillar TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS author_orcid TEXT;

ALTER TABLE posts ADD CONSTRAINT posts_pillar_check
  CHECK (pillar IS NULL OR pillar IN (
    'understanding',
    'nutrition',
    'economic-mobility',
    'social-determinants',
    'systems-change'
  ));

CREATE INDEX IF NOT EXISTS posts_pillar_idx ON posts (pillar);
CREATE INDEX IF NOT EXISTS posts_tags_idx ON posts USING GIN (tags);
