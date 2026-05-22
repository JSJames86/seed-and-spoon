import Stripe from 'stripe';

export const runtime = 'edge';

const ELIGIBLE_AMOUNTS = new Set([2500, 5000]);

export async function POST(request: Request) {
  const token = request.headers.get('x-service-token');
  if (!token || token !== process.env.ADMIN_SERVICE_TOKEN) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  const paymentIntents = await stripe.paymentIntents.list({
    limit: 100,
  });

  const eligible = paymentIntents.data.filter(
    (pi) => pi.status === 'succeeded' && ELIGIBLE_AMOUNTS.has(pi.amount)
  );

  const baseUrl = process.env.BACKEND_URL || '';
  const results: { email: string; success: boolean; error?: string }[] = [];

  await Promise.all(
    eligible.map(async (pi) => {
      const email = pi.receipt_email;
      if (!email) return;

      const name = (pi.metadata?.name as string | undefined) || 'Friend';

      try {
        const res = await fetch(`${baseUrl}/api/email/thank-you`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-service-token': token,
          },
          body: JSON.stringify({ name, email, amount: pi.amount }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          results.push({ email, success: false, error: (data as { error?: string }).error || `HTTP ${res.status}` });
        } else {
          results.push({ email, success: true });
        }
      } catch (err) {
        results.push({ email, success: false, error: String(err) });
      }
    })
  );

  const sent = results.filter((r) => r.success).length;
  const failures = results.filter((r) => !r.success);

  return Response.json({ sent, failures }, { status: 200 });
}
