/**
 * POST /api/donations/checkout
 *
 * Create a Stripe Checkout Session for one-time or monthly donations
 */

import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  withErrorHandling,
  parseRequestBody,
  checkRateLimit,
  getClientIp,
} from '@/lib/api-helpers';
import {
  createOneTimeCheckoutSession,
  createMonthlyCheckoutSession,
  generateIdempotencyKey,
  getDonationUrls,
} from '@/lib/stripe-helpers';
import { donationCheckoutSchema, validateRequest } from '@/lib/validation';
import { createDonation, findDonationBySessionId } from '@/lib/models';

// Force this route to be dynamic (not evaluated at build time)
export const dynamic = 'force-dynamic';

async function handler(request, context, logger) {
  // Only allow POST requests
  if (request.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  // Rate limiting
  const clientIp = getClientIp(request);
  const rateLimit = checkRateLimit(`checkout:${clientIp}`, 10, 60000);

  if (!rateLimit.allowed) {
    logger.warn('Rate limit exceeded', { clientIp });
    return errorResponse('Too many requests. Please try again later.', 429);
  }

  // Parse and validate request body
  const body = await parseRequestBody(request);
  const validation = validateRequest(body, donationCheckoutSchema);

  if (!validation.success) {
    logger.warn('Validation failed', { errors: validation.errors });
    return validationErrorResponse(validation.errors);
  }

  const { amount, currency, interval, email, name, source } = validation.data;

  // Generate idempotency key
  const idempotencyKey =
    request.headers.get('idempotency-key') || generateIdempotencyKey('checkout');

  logger.info('Creating Stripe Checkout Session', {
    amount,
    currency,
    interval,
    source,
    idempotencyKey,
  });

  try {
    // Get success and cancel URLs
    const { successUrl, cancelUrl } = getDonationUrls();

    // Create Stripe Checkout Session
    let session;

    if (interval === 'one_time') {
      session = await createOneTimeCheckoutSession({
        amount,
        currency,
        email,
        name,
        metadata: {
          source,
          site_env: process.env.SITE_ENV || 'production',
        },
        successUrl,
        cancelUrl,
        idempotencyKey,
      });
    } else if (interval === 'month') {
      session = await createMonthlyCheckoutSession({
        amount,
        currency,
        email,
        name,
        metadata: {
          source,
          site_env: process.env.SITE_ENV || 'production',
        },
        successUrl,
        cancelUrl,
        idempotencyKey,
      });
    } else {
      return errorResponse('Invalid interval', 400);
    }

    logger.info('Stripe Checkout Session created', {
      sessionId: session.id,
      amount,
      interval,
    });

    // Check if donation record already exists (idempotency)
    const existingDonation = await findDonationBySessionId(session.id);

    if (!existingDonation) {
      // Create donation record in database
      await createDonation({
        stripeSessionId: session.id,
        amount,
        currency,
        interval,
        status: 'created',
        donorEmail: email || null,
        name: name || null,
        metadata: {
          source,
          idempotencyKey,
        },
      });

      logger.info('Donation record created', { sessionId: session.id });
    } else {
      logger.info('Donation record already exists (idempotent)', {
        sessionId: session.id,
      });
    }

    // Return checkout URL
    return successResponse(
      {
        checkoutUrl: session.url,
        sessionId: session.id,
      },
      200
    );
  } catch (error) {
    logger.error('Checkout creation failed', error, {
      amount,
      interval,
      source,
    });

    // Handle specific Stripe errors
    if (error.type === 'StripeCardError') {
      return errorResponse('Card error. Please check your payment details.', 400);
    }

    if (error.type === 'StripeInvalidRequestError') {
      return errorResponse('Invalid request. Please check your input.', 400);
    }

    return errorResponse('Failed to create checkout session. Please try again.', 500);
  }
}

export const POST = withErrorHandling(handler);
