import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

const REQUIRED = ['name', 'email', 'organization', 'role', 'researchArea', 'message'];

export async function POST(request) {
  let body;
  try { body = await request.json(); } catch {
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
    organization: String(body.organization).trim().slice(0, 200),
    role: String(body.role).trim().slice(0, 200),
    research_area: String(body.researchArea).trim().slice(0, 300),
    timeline: body.timeline ? String(body.timeline).trim().slice(0, 200) : null,
    message: String(body.message).trim().slice(0, 3000),
    submitted_at: new Date().toISOString(),
  };

  const supabase = getSupabase();
  if (supabase) {
    const { error } = await supabase.from('research_inquiries').insert([row]);
    if (error && error.code !== '42P01') {
      console.error('Supabase error:', error);
      return Response.json({ error: 'Database error' }, { status: 500 });
    }
  }

  return Response.json({ ok: true });
}
