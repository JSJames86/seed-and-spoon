import { Resend } from 'resend';

export const runtime = 'edge';

export async function POST(request: Request) {
  if (!process.env.RESEND_API_KEY) {
    return Response.json({ error: 'Email service not configured' }, { status: 503 });
  }

  let body: { name?: string; email?: string; phone?: string; availability?: string; interests?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { name, email, phone, availability, interests } = body;

  if (!name?.trim() || !email?.trim()) {
    return Response.json({ error: 'name and email are required' }, { status: 422 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const rows = [
    `<p><strong>Name:</strong> ${name}</p>`,
    `<p><strong>Email:</strong> ${email}</p>`,
    phone ? `<p><strong>Phone:</strong> ${phone}</p>` : '',
    availability ? `<p><strong>Availability:</strong> ${availability}</p>` : '',
    interests ? `<p><strong>Interests:</strong> ${interests}</p>` : '',
  ].filter(Boolean).join('\n');

  const { error } = await resend.emails.send({
    from: 'Seed & Spoon <hello@seedandspoon.org>',
    to: 'hello@seedandspoon.org',
    replyTo: email,
    subject: `New volunteer application from ${name}`,
    html: rows,
  });

  if (error) {
    console.error('[email/volunteer] Resend error:', error);
    return Response.json({ error: 'Failed to send email' }, { status: 500 });
  }

  return Response.json({ success: true });
}
