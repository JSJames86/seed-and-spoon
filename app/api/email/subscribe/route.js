import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email-service';
import { renderWelcomeEmail } from '@/emails/templates/welcome';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { email, first_name, segment = 'general', source } = body;

  if (!email || !emailRe.test(email)) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const { data: subscriber, error } = await supabase
    .from('email_subscribers')
    .upsert(
      {
        email: email.trim().toLowerCase(),
        first_name: first_name ? String(first_name).trim().slice(0, 100) : null,
        segment,
        source: source ?? 'website',
        status: 'active',
      },
      { onConflict: 'email' }
    )
    .select()
    .single();

  if (error) {
    console.error('Supabase error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }

  try {
    const html = await renderWelcomeEmail({ first_name: first_name ?? 'Friend' });
    await sendEmail({
      to: email,
      subject: 'Welcome to Seed & Spoon',
      html,
      subscriberId: subscriber.id,
    });
  } catch (err) {
    // Log but don't fail the subscription if email send fails
    console.error('Welcome email error:', err);
  }

  return NextResponse.json({ success: true, id: subscriber.id });
}
