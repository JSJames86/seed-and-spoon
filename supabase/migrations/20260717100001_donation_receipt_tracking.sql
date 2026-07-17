-- Donor thank-you/receipt email: idempotent send tracking + human-readable receipt numbers.
-- `donations` predates this migration (created directly against the live project, no
-- CREATE TABLE on file), so every change here is additive and defensive.

ALTER TABLE donations ADD COLUMN IF NOT EXISTS receipt_id TEXT;
ALTER TABLE donations ADD COLUMN IF NOT EXISTS receipt_email_sent_at TIMESTAMPTZ;

CREATE SEQUENCE IF NOT EXISTS donation_receipt_seq START 1;

-- Generated in the DB (not app code) so concurrent webhook deliveries for different
-- donations can't race each other onto the same receipt number.
CREATE OR REPLACE FUNCTION set_donation_receipt_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.receipt_id IS NULL THEN
    NEW.receipt_id := 'SS-' || EXTRACT(YEAR FROM COALESCE(NEW.donated_at, now()))::text
      || '-' || LPAD(nextval('donation_receipt_seq')::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS donation_receipt_id_trigger ON donations;
CREATE TRIGGER donation_receipt_id_trigger
  BEFORE INSERT ON donations
  FOR EACH ROW
  EXECUTE FUNCTION set_donation_receipt_id();

-- Backfill any pre-existing rows (e.g. donors recorded before this automation existed)
-- in chronological order so receipt numbers still read as sequential.
DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN SELECT id, donated_at FROM donations WHERE receipt_id IS NULL ORDER BY donated_at ASC NULLS LAST LOOP
    UPDATE donations
    SET receipt_id = 'SS-' || EXTRACT(YEAR FROM COALESCE(rec.donated_at, now()))::text
      || '-' || LPAD(nextval('donation_receipt_seq')::text, 4, '0')
    WHERE id = rec.id;
  END LOOP;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS donations_receipt_id_unique ON donations (receipt_id) WHERE receipt_id IS NOT NULL;
