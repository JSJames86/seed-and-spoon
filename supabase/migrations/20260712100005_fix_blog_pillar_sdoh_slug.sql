-- The "Social Determinants of Health" pillar is authored as pillar: "sdoh"
-- in content, not the "social-determinants" guess from the original
-- taxonomy migration. Match the value actually in use.
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_pillar_check;

ALTER TABLE posts ADD CONSTRAINT posts_pillar_check
  CHECK (pillar IS NULL OR pillar IN (
    'understanding',
    'nutrition',
    'economics',
    'sdoh',
    'solutions'
  ));
