/**
 * GET /api/resources
 *
 * Get food resources with optional filters and geospatial search
 */

import {
  successResponse,
  errorResponse,
  withErrorHandling,
  checkRateLimit,
  getClientIp,
} from '@/lib/api-helpers';
import { resourceQuerySchema, validateRequest } from '@/lib/validation';
import { findFoodResources } from '@/lib/models';
import { isOpenNow } from '@/lib/hours-utils';

async function handler(request, context, logger) {
  // Only allow GET requests
  if (request.method !== 'GET') {
    return errorResponse('Method not allowed', 405);
  }

  // Rate limiting - more permissive for read operations (30 per minute)
  const clientIp = getClientIp(request);
  const rateLimit = checkRateLimit(`resources:${clientIp}`, 30, 60000);

  if (!rateLimit.allowed) {
    logger.warn('Rate limit exceeded for resources query', { clientIp });
    return errorResponse('Too many requests. Please try again later.', 429);
  }

  // Parse query parameters from URL
  const { searchParams } = new URL(request.url);
  const queryParams = Object.fromEntries(searchParams.entries());

  logger.info('Querying resources', { queryParams });

  // Validate query parameters
  const validation = validateRequest(queryParams, resourceQuerySchema);

  if (!validation.success) {
    logger.warn('Invalid query parameters', {
      errors: validation.errors,
    });
    return errorResponse('Invalid query parameters', 400);
  }

  try {
    // Build filters from validated query params
    const filters = {};

    if (validation.data.county) {
      filters.county = validation.data.county;
    }

    if (validation.data.type) {
      filters.type = validation.data.type;
    }

    if (validation.data.service) {
      filters.service = validation.data.service;
    }

    if (validation.data.zip) {
      filters.zip = validation.data.zip;
    }

    if (validation.data.lat && validation.data.lng) {
      filters.lat = parseFloat(validation.data.lat);
      filters.lng = parseFloat(validation.data.lng);

      if (validation.data.radiusKm) {
        filters.radiusKm = parseFloat(validation.data.radiusKm);
      }
    }

    if (validation.data.limit) {
      filters.limit = parseInt(validation.data.limit, 10);
    }

    // Fetch resources from database
    let resources = await findFoodResources(filters);

    // Filter by "open now" if requested
    if (validation.data.openNow === 'true') {
      resources = resources.filter(resource => isOpenNow(resource.hours));
    }

    // Format response - include distance if geospatial search was used
    const formattedResources = resources.map(resource => {
      const formatted = {
        id: resource._id.toString(),
        name: resource.name,
        type: resource.type,
        county: resource.county,
        address: resource.address,
        hours: resource.hours,
        services: resource.services,
        languages: resource.languages,
        contact: resource.contact,
        eligibility: resource.eligibility,
        notes: resource.notes,
      };

      // Include distance if it was calculated
      if (resource.distanceMeters !== undefined) {
        formatted.distanceMeters = Math.round(resource.distanceMeters);
        formatted.distanceKm = (resource.distanceMeters / 1000).toFixed(1);
        formatted.distanceMiles = (resource.distanceMeters / 1609.34).toFixed(1);
      }

      return formatted;
    });

    logger.info('Resources query successful', {
      count: formattedResources.length,
      filters,
    });

    return successResponse({
      resources: formattedResources,
      count: formattedResources.length,
      filters: validation.data,
    });
  } catch (error) {
    logger.error('Failed to fetch resources', error);

    return errorResponse('Failed to fetch resources. Please try again.', 500);
  }
}

export const GET = withErrorHandling(handler);
