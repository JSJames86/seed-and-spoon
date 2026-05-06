import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

const REQUIRED = ['name', 'email', 'driveType', 'expectedDate', 'location', 'collectionType'];

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  for (const field of REQUIRED) {
    if (!body[field] || String(body[field]).trim() === '') {
      return Response.json({ error: `Missing required field: ${field}` }, { status: 400 });
    }
  }

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(body.email)) {
    return Response.json({ error: 'Invalid email address' }, { status: 400 });
  }

  const row = {
    name: String(body.name).trim().slice(0, 200),
    email: String(body.email).trim().toLowerCase().slice(0, 200),
    phone: body.phone ? String(body.phone).trim().slice(0, 30) : null,
    drive_type: String(body.driveType).trim().slice(0, 100),
    expected_date: String(body.expectedDate).trim(),
    location: String(body.location).trim().slice(0, 300),
    collection_type: String(body.collectionType).trim().slice(0, 100),
    needs_support: Boolean(body.needsSupport),
    notes: body.notes ? String(body.notes).trim().slice(0, 2000) : null,
    status: 'pending',
    submitted_at: new Date().toISOString(),
  };

  const supabase = getSupabase();
  if (supabase) {
    const { error } = await supabase.from('food_drives').insert([row]);
    if (error) {
      if (error.code === '42P01') {
        // Table doesn't exist yet — accept gracefully
        return Response.json({ ok: true, stored: false });
      }
      console.error('Supabase insert error:', error);
      return Response.json({ error: 'Database error' }, { status: 500 });
    }
    return Response.json({ ok: true, stored: true });
  }

  // No Supabase configured — still accept the form gracefully
  return Response.json({ ok: true, stored: false });
}
