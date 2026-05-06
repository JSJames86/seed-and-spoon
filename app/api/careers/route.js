import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

const REQUIRED = ['name', 'email', 'position', 'message'];

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
    phone: body.phone ? String(body.phone).trim().slice(0, 50) : null,
    position: String(body.position).trim().slice(0, 200),
    portfolio_url: body.portfolioUrl ? String(body.portfolioUrl).trim().slice(0, 500) : null,
    message: String(body.message).trim().slice(0, 3000),
    submitted_at: new Date().toISOString(),
  };

  const supabase = getSupabase();
  if (supabase) {
    const { error } = await supabase.from('career_applications').insert([row]);
    if (error && error.code !== '42P01') {
      console.error('Supabase error:', error);
      return Response.json({ error: 'Database error' }, { status: 500 });
    }
  }

  return Response.json({ ok: true });
}
