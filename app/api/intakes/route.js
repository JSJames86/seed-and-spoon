/**
 * POST /api/intakes
 *
 * Handle client and referral intake submissions
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
  clientIntakeSchema,
  referralIntakeSchema,
  validateRequest,
} from '@/lib/validation';
import { createIntake, findFoodResources } from '@/lib/models';

async function handler(request, context, logger) {
  // Only allow POST requests
  if (request.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  // Rate limiting - stricter for intake forms (3 per hour)
  const clientIp = getClientIp(request);
  const rateLimit = checkRateLimit(`intake:${clientIp}`, 3, 3600000);

  if (!rateLimit.allowed) {
    logger.warn('Rate limit exceeded for intake submission', { clientIp });
    return errorResponse('Too many requests. Please try again later.', 429);
  }

  // Parse request body
  const body = await parseRequestBody(request);

  if (!body.kind) {
    return errorResponse('kind is required (client or referral)', 400);
  }

  const { kind } = body;

  logger.info('Processing intake submission', { kind });

  // Validate based on intake kind
  let validation;

  switch (kind) {
    case 'client':
      validation = validateRequest(body, clientIntakeSchema);
      break;

    case 'referral':
      validation = validateRequest(body, referralIntakeSchema);
      break;

    default:
      logger.warn('Invalid intake kind', { kind });
      return errorResponse(`Invalid intake kind: ${kind}. Must be 'client' or 'referral'`, 400);
  }

  if (!validation.success) {
    logger.warn('Validation failed', {
      kind,
      errors: validation.errors,
    });
    return validationErrorResponse(validation.errors);
  }

  try {
    // Derive suggested resources based on ZIP code and needs
    let suggestedResources = [];

    try {
      const { address, hasChildrenUnder2, infantNeeds, dietaryRestrictions } = validation.data;

      if (address?.zip) {
        const filters = { zip: address.zip, limit: 3 };

        // If they have infants, prioritize resources with formula/baby food
        if (hasChildrenUnder2 && infantNeeds?.length > 0) {
          filters.service = infantNeeds[0]; // formula, baby_food, or diapers
        }

        const nearbyResources = await findFoodResources(filters);
        suggestedResources = nearbyResources.map(r => r._id.toString());
      }
    } catch (resourceError) {
      // Don't fail the intake if resource lookup fails
      logger.warn('Failed to find suggested resources', resourceError);
    }

    // Create intake in database
    const intake = await createIntake({
      ...validation.data,
      suggestedResources,
      channel: 'web',
      status: 'new',
    });

    logger.info('Intake created successfully', {
      kind,
      intakeId: intake._id,
      suggestedResourcesCount: suggestedResources.length,
    });

    // TODO: Send email notification to staff
    // TODO: Send confirmation email/SMS to applicant

    return successResponse(
      {
        message: 'Application received successfully',
        id: intake._id,
        status: intake.status,
        suggestedResourcesCount: suggestedResources.length,
      },
      201
    );
  } catch (error) {
    logger.error('Failed to create intake', error, { kind });

    return errorResponse('Failed to process application. Please try again.', 500);
  }
}

export const POST = withErrorHandling(handler);
