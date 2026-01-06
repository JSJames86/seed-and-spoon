// app/api/donations/session/[sessionId]/route.js
// Retrieve donation session details from Stripe

import { NextResponse } from "next/server";
import { retrieveCheckoutSession, formatAmount } from "@/lib/stripe-helpers";
import { createServerSupabaseClient, handleSupabaseError } from "@/lib/supabase";

export async function GET(request, { params }) {
  try {
    const { sessionId } = params;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    console.log('[API] Retrieving checkout session:', sessionId);

    // Retrieve session from Stripe
    const session = await retrieveCheckoutSession(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Update session status in Supabase if payment was successful
    if (session.payment_status === 'paid') {
      const supabase = createServerSupabaseClient();
      const { error: updateError } = await supabase
        .from('donation_sessions')
        .update({
          status: 'completed',
          payment_status: session.payment_status,
          customer_email: session.customer_details?.email || null,
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_session_id', sessionId);

      if (updateError) {
        console.error('[API] Failed to update session status:', updateError);
        // Don't fail the request, just log the error
      }
    }

    // Return formatted session data
    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        amount: session.amount_total,
        amountFormatted: formatAmount(session.amount_total, session.currency),
        currency: session.currency,
        paymentStatus: session.payment_status,
        customerEmail: session.customer_details?.email,
        metadata: session.metadata,
      },
    });

  } catch (error) {
    console.error('[API] Error retrieving session:', error);
    return NextResponse.json(
      {
        error: 'Failed to retrieve session',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
