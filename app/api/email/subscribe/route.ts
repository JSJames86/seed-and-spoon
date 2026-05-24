import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_SEGMENTS = new Set(['general', 'donor', 'volunteer']);

function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
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

  return Response.json({ success: true }, { status: 200 });
}
