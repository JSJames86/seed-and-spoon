import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }

  const email = (body.email ?? '').trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: 'Valid email address required' }, { status: 400 });
  }

  const firstName = (body.first_name ?? '').trim() || null;
  const segment = body.segment ?? 'general';
  const source = (body.source ?? 'website').replace(/-/g, '_');

  // Save subscriber to Supabase
  const supabase = getSupabase();
  if (supabase) {
    const { error: dbError } = await supabase
      .from('email_subscribers')
      .upsert(
        { email, first_name: firstName, segment, source, status: 'active', updated_at: new Date().toISOString() },
        { onConflict: 'email' }
      );
    if (dbError && dbError.code !== '42P01') {
      console.error('Subscriber upsert error:', dbError);
    }
  }

  // Send welcome email via Resend
  const resendKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'hello@seedandspoon.org';
  const fromName = process.env.RESEND_FROM_NAME ?? 'Seed & Spoon';

  if (resendKey) {
    const resend = new Resend(resendKey);
    const greeting = firstName ? `Hi ${firstName},` : 'Hi there,';

    const { error: emailError } = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: email,
      subject: `Welcome to the Seed & Spoon community 🌱`,
      html: `
        <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#1A1A1A">
          <div style="background:#226214;padding:32px 24px;border-radius:12px 12px 0 0;text-align:center">
            <h1 style="color:#F8F6F0;margin:0;font-size:24px;font-weight:bold">Seed &amp; Spoon</h1>
            <p style="color:#a3e6a0;margin:8px 0 0;font-size:14px">Nourishing Essex County with dignity</p>
          </div>
          <div style="background:#ffffff;padding:32px 24px;border:1px solid #e5e7eb;border-top:none">
            <p style="font-size:16px;line-height:1.6">${greeting}</p>
            <p style="font-size:16px;line-height:1.6">
              Thank you for joining the Seed &amp; Spoon community. You'll receive monthly updates on our
              work fighting food insecurity in Essex County — real stories, impact numbers, and ways to get involved.
            </p>
            <div style="background:#f0fdf4;border-left:4px solid #226214;padding:16px 20px;border-radius:0 8px 8px 0;margin:24px 0">
              <p style="margin:0;font-size:15px;color:#14532d;font-weight:600">What to expect:</p>
              <ul style="margin:8px 0 0;padding-left:20px;color:#166534;font-size:14px;line-height:1.8">
                <li>Monthly impact reports — families served, meals delivered</li>
                <li>Upcoming volunteer shifts and events</li>
                <li>Community stories from neighbors we serve alongside</li>
              </ul>
            </div>
            <p style="font-size:14px;color:#6b7280;margin-top:32px">
              You can <a href="https://seedandspoon.org/api/email/unsubscribe?email=${encodeURIComponent(email)}" style="color:#226214">unsubscribe</a> at any time.
            </p>
          </div>
          <div style="background:#f9fafb;padding:16px 24px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;border-top:none;text-align:center">
            <p style="margin:0;font-size:12px;color:#9ca3af">Seed &amp; Spoon · Essex County, NJ · <a href="https://seedandspoon.org" style="color:#226214">seedandspoon.org</a></p>
          </div>
        </div>
      `,
      text: `${greeting}\n\nThank you for joining the Seed & Spoon community!\n\nYou'll receive monthly updates on our work fighting food insecurity in Essex County.\n\nTo unsubscribe: https://seedandspoon.org/api/email/unsubscribe?email=${encodeURIComponent(email)}\n\nSeed & Spoon · Essex County, NJ`,
    });

    if (emailError) {
      console.error('Welcome email error:', emailError);
    }
  } else {
    console.warn('RESEND_API_KEY not set — subscriber saved but no welcome email sent');
  }

  return Response.json({ ok: true });
}
