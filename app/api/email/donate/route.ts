import { Resend } from 'resend';

export const runtime = 'edge';

export async function POST(request: Request) {
  if (!process.env.RESEND_API_KEY) {
    return Response.json({ error: 'Email service not configured' }, { status: 503 });
  }

  let body: { name?: string; email?: string; amount?: number; message?: string; recurring?: boolean };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { name, email, amount, message, recurring } = body;

  if (!email?.trim()) {
    return Response.json({ error: 'email is required' }, { status: 422 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const displayName = name?.trim() || 'Friend';
  const formattedAmount = typeof amount === 'number'
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
    : 'your generous contribution';

  const { error } = await resend.emails.send({
    from: 'Janelle | Seed & Spoon <hello@seedandspoon.org>',
    to: email,
    subject: 'Thank you for your donation 🌱',
    html: `
      <p>Hi ${displayName},</p>
      <p>Thank you so much for your ${recurring ? 'monthly ' : ''}donation of ${formattedAmount} to Seed & Spoon. Your support means the world to us.</p>
      <p>Here in Newark, access to fresh, affordable food is something too many families struggle with every day. Your gift goes directly toward changing that — helping us provide real meals, real resources, and real hope to our community.</p>
      ${message ? `<p>${message}</p>` : ''}
      <p>Because of people like you, we can keep showing up. Thank you for believing in this mission.</p>
      <p>With gratitude,<br/>Janelle<br/>Founder, Seed & Spoon</p>
    `,
  });

  if (error) {
    console.error('[email/donate] Resend error:', error);
    return Response.json({ error: 'Failed to send email' }, { status: 500 });
  }

  return Response.json({ success: true });
}
