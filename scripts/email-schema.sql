-- Email Infrastructure Schema for Seed & Spoon
-- Run this in the Supabase SQL editor to enable email automation.

-- Email subscribers / contact list
CREATE TABLE IF NOT EXISTS email_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  segment TEXT DEFAULT 'general', -- general | volunteer | donor | partner | school
  status TEXT DEFAULT 'active',   -- active | unsubscribed | bounced
  source TEXT,                     -- website | event | manual | import
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'
);

-- Email automation sequences
CREATE TABLE IF NOT EXISTS email_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  trigger_event TEXT NOT NULL,    -- volunteer_signup | donor_action | newsletter_signup | event_rsvp
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual emails within a sequence
CREATE TABLE IF NOT EXISTS email_sequence_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id UUID REFERENCES email_sequences(id) ON DELETE CASCADE,
  step_number INT NOT NULL,
  subject TEXT NOT NULL,
  template_key TEXT NOT NULL,     -- maps to a template in /emails/templates/
  delay_hours INT DEFAULT 0,      -- hours after previous step (0 = immediate)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enrollment: which subscriber is in which sequence
CREATE TABLE IF NOT EXISTS email_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id UUID REFERENCES email_subscribers(id) ON DELETE CASCADE,
  sequence_id UUID REFERENCES email_sequences(id) ON DELETE CASCADE,
  current_step INT DEFAULT 1,
  status TEXT DEFAULT 'active',   -- active | completed | paused | cancelled
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  next_send_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Full send log
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id UUID REFERENCES email_subscribers(id),
  sequence_step_id UUID REFERENCES email_sequence_steps(id),
  resend_message_id TEXT,
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT DEFAULT 'sent',     -- sent | delivered | bounced | failed | opened | clicked
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON email_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_segment ON email_subscribers(segment);
CREATE INDEX IF NOT EXISTS idx_enrollments_next_send ON email_enrollments(next_send_at) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_logs_subscriber ON email_logs(subscriber_id);

-- Seed data: automation sequences
INSERT INTO email_sequences (name, trigger_event, description) VALUES
  ('Community Welcome',     'newsletter_signup', 'Onboards new newsletter subscribers over 7 days'),
  ('Volunteer Onboarding',  'volunteer_signup',  'Prepares new volunteers for their first shift'),
  ('Donor Impact Flow',     'donor_action',      'Thanks donors and shares impact over 30 days'),
  ('Event Sequence',        'event_rsvp',        'Confirms, reminds, and follows up on event RSVPs'),
  ('Partner Pipeline',      'partnership_form',  'Auto-responds and follows up with partner inquiries')
ON CONFLICT DO NOTHING;
