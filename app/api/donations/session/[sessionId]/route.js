import { NextResponse } from 'next/server';
import { retrieveCheckoutSession } from '@/lib/stripe-helpers';

export async function GET(request, { params }) {
  const { sessionId } = await params;

  if (!sessionId) {
    return NextResponse.json({ ok: false, error: 'Session ID is required' }, { status: 400 });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ ok: false, error: 'Payment processing is not configured' }, { status: 503 });
  }

  try {
    const session = await retrieveCheckoutSession(sessionId);

    let amount;
    let interval = 'one_time';

    if (session.mode === 'subscription') {
      const lineItem = session.line_items?.data?.[0];
      amount = lineItem?.price?.unit_amount ?? session.amount_total;
      interval = 'month';
    } else {
      amount = session.amount_total;
    }

    return NextResponse.json({
      ok: true,
      data: {
        amount,
        currency: session.currency,
        status: session.payment_status,
        interval,
        customerEmail: session.customer_details?.email || null,
        customerName: session.customer_details?.name || null,
      },
    });
  } catch (error) {
    console.error('[Donations Session API] Error:', error);
    return NextResponse.json(
      { ok: false, error: 'Could not retrieve donation details' },
      { status: 500 }
    );
  }
}
