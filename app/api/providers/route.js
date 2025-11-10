/**
 * POST /api/providers
 *
 * Handle provider submission requests (for being listed in the directory)
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
import { providerSubmissionSchema, validateRequest } from '@/lib/validation';
import { createProviderSubmission } from '@/lib/models';

async function handler(request, context, logger) {
  // Only allow POST requests
  if (request.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  // Rate limiting - very strict for provider submissions (1 per hour per IP)
  const clientIp = getClientIp(request);
  const rateLimit = checkRateLimit(`provider:${clientIp}`, 1, 3600000);

  if (!rateLimit.allowed) {
    logger.warn('Rate limit exceeded for provider submission', { clientIp });
    return errorResponse('You can only submit one provider listing per hour. Please try again later.', 429);
  }

  // Parse request body
  const body = await parseRequestBody(request);

  logger.info('Processing provider submission', {
    orgName: body.orgName,
    county: body.county,
  });

  // Validate request
  const validation = validateRequest(body, providerSubmissionSchema);

  if (!validation.success) {
    logger.warn('Validation failed for provider submission', {
      errors: validation.errors,
    });
    return validationErrorResponse(validation.errors);
  }

  try {
    // If location coordinates weren't provided, we could geocode the address here
    // For now, we'll store it as-is and let admins add coordinates when approving

    // Create provider submission in database with "pending" status
    const submission = await createProviderSubmission(validation.data);

    logger.info('Provider submission created successfully', {
      submissionId: submission._id,
      orgName: submission.orgName,
      county: submission.county,
    });

    // TODO: Send email notification to staff for review
    // TODO: Send confirmation email to submitter

    return successResponse(
      {
        status: 'received',
        message: 'Thank you! Your submission has been received and will be reviewed within 3-5 business days.',
        submissionId: submission._id,
      },
      201
    );
  } catch (error) {
    logger.error('Failed to create provider submission', error);

    // Check for duplicate submissions (if we add unique constraints later)
    if (error.code === 11000) {
      return errorResponse('A submission for this location already exists', 409);
    }

    return errorResponse('Failed to process submission. Please try again.', 500);
  }
}

export const POST = withErrorHandling(handler);
