/**
 * GET /api/donations/session/[id]
 *
 * Retrieve donation session details for thank-you page
 * Returns safe, masked data suitable for public display
 */

import {
  successResponse,
  errorResponse,
  withErrorHandling,
} from '@/lib/api-helpers';
import { findDonationBySessionId, getSafeDonationData } from '@/lib/models';

// Force this route to be dynamic (not evaluated at build time)
export const dynamic = 'force-dynamic';

async function handler(request, { params }, logger) {
  // Only allow GET requests
  if (request.method !== 'GET') {
    return errorResponse('Method not allowed', 405);
  }

  const { id: sessionId } = params;

  if (!sessionId) {
    return errorResponse('Session ID is required', 400);
  }

  logger.info('Retrieving donation session', { sessionId });

  try {
    // Find donation by session ID
    const donation = await findDonationBySessionId(sessionId);

    if (!donation) {
      logger.warn('Donation not found', { sessionId });
      return errorResponse('Donation not found', 404);
    }

    // Return safe data (masked email, no sensitive info)
    const safeData = getSafeDonationData(donation);

    logger.info('Donation session retrieved', {
      sessionId,
      status: safeData.status,
    });

    return successResponse(safeData, 200);
  } catch (error) {
    logger.error('Failed to retrieve donation session', error, { sessionId });
    return errorResponse('Failed to retrieve donation details', 500);
  }
}

export const GET = withErrorHandling(handler);
