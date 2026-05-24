import { Resend } from 'resend';

export const runtime = 'edge';

export async function POST(request: Request) {
  const token = request.headers.get('x-service-token');
  if (!token || token !== process.env.ADMIN_SERVICE_TOKEN) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.RESEND_API_KEY) {
    return Response.json({ error: 'Email service not configured' }, { status: 503 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  let body: { name?: string; email?: string; amount?: number };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { name, email, amount } = body;

  if (!email || !amount) {
    return Response.json({ error: 'Missing required fields' }, { status: 422 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const displayName = name || 'Friend';
  const formattedAmount = (amount / 100).toFixed(2);

  const { error } = await resend.emails.send({
    from: 'Janelle | Seed & Spoon <hello@seedandspoon.org>',
    to: email,
    subject: 'Thank you for your donation 🌱',
    html: `
      <p>Hi ${displayName},</p>
      <p>Thank you so much for your generous donation of $${formattedAmount} to Seed & Spoon. Your support means the world to us.</p>
      <p>Here in Newark, access to fresh, affordable food is something too many families struggle with every day. Your gift goes directly toward changing that — helping us provide real meals, real resources, and real hope to our community.</p>
      <p>Because of people like you, we can keep showing up. Thank you for believing in this mission.</p>
      <p>With gratitude,<br/>Janelle<br/>Founder, Seed & Spoon</p>
    `,
  });

  if (error) {
    console.error('[thank-you] Resend error:', error);
    return Response.json({ error: 'Failed to send email' }, { status: 500 });
  }

  return Response.json({ success: true }, { status: 200 });
}
