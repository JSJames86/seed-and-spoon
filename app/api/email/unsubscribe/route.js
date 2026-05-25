import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function GET(request) {
  const email = new URL(request.url).searchParams.get('email')?.trim().toLowerCase();

  if (!email) {
    return new Response('Missing email parameter', { status: 400 });
  }

  const supabase = getSupabase();
  if (supabase) {
    await supabase
      .from('email_subscribers')
      .update({ status: 'unsubscribed', updated_at: new Date().toISOString() })
      .eq('email', email);
  }

  return new Response(
    `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Unsubscribed</title>
    <style>body{font-family:Georgia,serif;max-width:480px;margin:80px auto;text-align:center;color:#1A1A1A}
    h1{color:#226214}a{color:#226214}</style></head>
    <body><h1>You've been unsubscribed</h1>
    <p>You've been removed from the Seed &amp; Spoon mailing list.</p>
    <p><a href="https://seedandspoon.org">Return to Seed &amp; Spoon</a></p></body></html>`,
    { headers: { 'Content-Type': 'text/html' } }
  );
}
