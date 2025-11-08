/**
 * POST /api/submissions
 *
 * Handle form submissions (volunteer, contact, newsletter, help requests)
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
  volunteerSubmissionSchema,
  contactSubmissionSchema,
  newsletterSubscriptionSchema,
  validateRequest,
} from '@/lib/validation';
import { createSubmission } from '@/lib/models';

// Force this route to be dynamic (not evaluated at build time)
export const dynamic = 'force-dynamic';

async function handler(request, context, logger) {
  // Only allow POST requests
  if (request.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  // Rate limiting
  const clientIp = getClientIp(request);
  const rateLimit = checkRateLimit(`submission:${clientIp}`, 5, 60000);

  if (!rateLimit.allowed) {
    logger.warn('Rate limit exceeded', { clientIp });
    return errorResponse('Too many requests. Please try again later.', 429);
  }

  // Parse request body
  const body = await parseRequestBody(request);

  if (!body.formType) {
    return errorResponse('formType is required', 400);
  }

  const { formType, ...payload } = body;

  logger.info('Processing form submission', { formType });

  // Validate based on form type
  let validation;

  switch (formType) {
    case 'volunteer':
      validation = validateRequest(payload, volunteerSubmissionSchema);
      break;

    case 'contact':
      validation = validateRequest(payload, contactSubmissionSchema);
      break;

    case 'newsletter':
      validation = validateRequest(payload, newsletterSubscriptionSchema);
      break;

    case 'help_request':
      // For now, allow any payload for help requests
      // You can add a specific schema later
      validation = { success: true, data: payload };
      break;

    default:
      logger.warn('Invalid form type', { formType });
      return errorResponse(`Invalid form type: ${formType}`, 400);
  }

  if (!validation.success) {
    logger.warn('Validation failed', {
      formType,
      errors: validation.errors,
    });
    return validationErrorResponse(validation.errors);
  }

  try {
    // Create submission in database
    const submission = await createSubmission({
      formType,
      payload: validation.data,
    });

    logger.info('Form submission created', {
      formType,
      submissionId: submission._id,
    });

    // TODO: Send email notifications for volunteer and contact forms
    // This would be a good place to integrate SendGrid or similar

    return successResponse(
      {
        message: 'Submission received successfully',
        submissionId: submission._id,
      },
      201
    );
  } catch (error) {
    logger.error('Failed to create submission', error, { formType });

    // Check for duplicate key error (if applicable)
    if (error.code === 11000) {
      return errorResponse('This submission already exists', 409);
    }

    return errorResponse('Failed to process submission. Please try again.', 500);
  }
}

export const POST = withErrorHandling(handler);
