import Stripe from 'stripe';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';

const ELIGIBLE_AMOUNTS = new Set([2500, 5000]);

export async function POST(request: Request) {
  // Accept either service token OR authenticated admin session
  const token = request.headers.get('x-service-token');
  const serviceToken = process.env.ADMIN_SERVICE_TOKEN;

  let authorized = token && token === serviceToken;

  if (!authorized) {
    // Check if request is from an authenticated admin
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(list) {
            try { list.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {}
          },
        },
      }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const service = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
      );
      const { data: profile } = await service.from('profiles').select('role').eq('id', user.id).single();
      if (profile?.role === 'admin') authorized = true;
    }
  }

  if (!authorized) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return Response.json({ error: 'Stripe not configured' }, { status: 503 });
  }

  if (!process.env.RESEND_API_KEY) {
    return Response.json({ error: 'Email service not configured' }, { status: 503 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const { Resend } = await import('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);

  const paymentIntents = await stripe.paymentIntents.list({ limit: 100 });

  const eligible = paymentIntents.data.filter(
    (pi) => pi.status === 'succeeded' && ELIGIBLE_AMOUNTS.has(pi.amount)
  );

  const results: { email: string; success: boolean; error?: string }[] = [];

  await Promise.all(
    eligible.map(async (pi) => {
      const email = pi.receipt_email;
      if (!email) return;

      const name = (pi.metadata?.name as string | undefined) || (pi.metadata?.donorName as string | undefined) || 'Friend';
      const formattedAmount = (pi.amount / 100).toFixed(2);

      try {
        const { error } = await resend.emails.send({
          from: 'Janelle | Seed & Spoon <hello@seedandspoon.org>',
          to: email,
          subject: 'Thank you for your donation to Seed & Spoon 🌱',
          html: `
            <p>Hi ${name},</p>
            <p>Thank you so much for your generous donation of $${formattedAmount} to Seed & Spoon. Your support means the world to us and to the Newark community we serve.</p>
            <p>Here in Newark, access to fresh, affordable food is something too many families struggle with every day. Your gift goes directly toward changing that — helping us provide real meals, real resources, and real hope.</p>
            <p>Because of people like you, we can keep showing up. Thank you for believing in this mission.</p>
            <p>With gratitude,<br/>Janelle<br/>Founder, Seed & Spoon NJ<br/><a href="https://seedandspoon.org">seedandspoon.org</a></p>
          `,
        });

        if (error) {
          results.push({ email, success: false, error: error.message });
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
