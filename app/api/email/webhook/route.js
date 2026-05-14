import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Resend webhook events → update email_logs status
// Configure the webhook URL in the Resend dashboard:
// https://resend.com/webhooks → https://seedandspoon.org/api/email/webhook

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

const STATUS_MAP = {
  'email.delivered': 'delivered',
  'email.bounced': 'bounced',
  'email.opened': 'opened',
  'email.clicked': 'clicked',
  'email.complained': 'bounced',
};

export async function POST(req) {
  let payload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { type, data } = payload;
  const newStatus = STATUS_MAP[type];

  if (!newStatus || !data?.email_id) {
    return NextResponse.json({ received: true });
  }

  const supabase = getSupabase();
  if (supabase) {
    await supabase
      .from('email_logs')
      .update({ status: newStatus, metadata: data })
      .eq('resend_message_id', data.email_id);

    // Mark subscriber as bounced so we stop sending to them
    if (newStatus === 'bounced' && data.to?.[0]) {
      await supabase
        .from('email_subscribers')
        .update({ status: 'bounced' })
        .eq('email', data.to[0]);
    }
  }

  return NextResponse.json({ received: true });
}
