-- Optional SEO overrides for blog posts. When unset, generateMetadata()
-- falls back to title/excerpt, so this is purely additive.
ALTER TABLE posts ADD COLUMN IF NOT EXISTS meta_title TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS meta_description TEXT;
