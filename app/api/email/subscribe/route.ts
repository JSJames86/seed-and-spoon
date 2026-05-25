import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

export const runtime = 'edge';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_SEGMENTS = new Set(['general', 'donor', 'volunteer']);

function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

async function sendWelcomeEmail(email: string, firstName: string | null) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const resend = new Resend(apiKey);
  const name = firstName || 'Friend';

  await resend.emails.send({
    from: 'Janelle | Seed & Spoon <hello@seedandspoon.org>',
    to: email,
    subject: 'Welcome to the Seed & Spoon community 🌱',
    html: `
      <p>Hi ${name},</p>
      <p>Thank you for joining the Seed & Spoon community! We're so glad you're here.</p>
      <p>Every month we'll share updates on our mission to end food insecurity in Newark, NJ — including stories from the families we serve, volunteer opportunities, and ways you can help.</p>
      <p>In the meantime, feel free to explore our work at <a href="https://seedandspoon.org">seedandspoon.org</a>.</p>
      <p>With gratitude,<br/>Janelle<br/>Founder, Seed & Spoon</p>
    `,
  });
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!email || !EMAIL_RE.test(email)) {
    return Response.json({ error: 'A valid email address is required.' }, { status: 422 });
  }

  const firstName = typeof body.first_name === 'string' ? body.first_name.trim().slice(0, 100) : null;
  const segment = VALID_SEGMENTS.has(String(body.segment)) ? String(body.segment) : 'general';
  const source = typeof body.source === 'string' ? body.source.trim().slice(0, 100) : 'website';

  const supabase = getSupabase();
  if (!supabase) {
    return Response.json({ error: 'Service temporarily unavailable.' }, { status: 503 });
  }

  const { error } = await supabase.from('subscribers').upsert(
    {
      email,
      first_name: firstName || null,
      segment,
      source,
      subscribed_at: new Date().toISOString(),
      unsubscribed_at: null,
    },
    { onConflict: 'email', ignoreDuplicates: false }
  );

  if (error) {
    console.error('Subscriber upsert error:', error.message);
    return Response.json({ error: 'Could not save your subscription. Please try again.' }, { status: 500 });
  }

  // Send welcome email — best effort, don't fail the subscription if this errors
  try {
    await sendWelcomeEmail(email, firstName);
  } catch (err) {
    console.error('Welcome email error:', err);
  }

  return Response.json({ success: true }, { status: 200 });
}
