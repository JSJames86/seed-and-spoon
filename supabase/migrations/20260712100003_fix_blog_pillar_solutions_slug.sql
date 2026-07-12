-- The "Solutions & Systems Change" pillar is authored as pillar: "solutions"
-- in content, not the "systems-change" guess from the original taxonomy
-- migration. Match the value actually in use.
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_pillar_check;

ALTER TABLE posts ADD CONSTRAINT posts_pillar_check
  CHECK (pillar IS NULL OR pillar IN (
    'understanding',
    'nutrition',
    'economic-mobility',
    'social-determinants',
    'solutions'
  ));
