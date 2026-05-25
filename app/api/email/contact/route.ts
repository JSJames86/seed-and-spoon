import { Resend } from 'resend';

export const runtime = 'edge';

export async function POST(request: Request) {
  if (!process.env.RESEND_API_KEY) {
    return Response.json({ error: 'Email service not configured' }, { status: 503 });
  }

  let body: { name?: string; email?: string; message?: string; subject?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { name, email, message, subject } = body;

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return Response.json({ error: 'name, email, and message are required' }, { status: 422 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const emailSubject = subject?.trim() || `New inquiry from ${name}`;

  const { error } = await resend.emails.send({
    from: 'Seed & Spoon <hello@seedandspoon.org>',
    to: 'hello@seedandspoon.org',
    replyTo: email,
    subject: emailSubject,
    html: `
      <p><strong>From:</strong> ${name} (${email})</p>
      <p><strong>Subject:</strong> ${emailSubject}</p>
      <p><strong>Message:</strong></p>
      <p>${message.trim().replace(/\n/g, '<br/>')}</p>
    `,
  });

  if (error) {
    console.error('[email/contact] Resend error:', error);
    return Response.json({ error: 'Failed to send email' }, { status: 500 });
  }

  return Response.json({ success: true });
}
