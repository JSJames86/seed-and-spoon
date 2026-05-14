import { getResendClient } from './resend';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function sendEmail({ to, subject, html, react, subscriberId, sequenceStepId }) {
  const resend = getResendClient();
  if (!resend) {
    console.warn('RESEND_API_KEY not set — skipping email send');
    return null;
  }

  const from = `${process.env.RESEND_FROM_NAME || 'Seed & Spoon'} <${process.env.RESEND_FROM_EMAIL || 'noreply@seedandspoon.org'}>`;

  const { data, error } = await resend.emails.send({ from, to, subject, html, react });

  if (error) {
    console.error('Resend error:', error);
    throw error;
  }

  if (subscriberId) {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.from('email_logs').insert({
        subscriber_id: subscriberId,
        sequence_step_id: sequenceStepId ?? null,
        resend_message_id: data?.id,
        to_email: to,
        subject,
        status: 'sent',
      });
    }
  }

  return data;
}
