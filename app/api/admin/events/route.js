/**
 * Admin API - Events
 * Handles CRUD operations for events
 */

import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { validateRequest, adminEventSchema } from '@/lib/validation';
import { successResponse, errorResponse, validationErrorResponse, withErrorHandling } from '@/lib/api-helpers';

/**
 * GET /api/admin/events
 * List all events with optional filtering
 */
export const GET = withErrorHandling(async (request) => {
  const supabase = getServiceSupabase();
  const { searchParams } = new URL(request.url);

  const status = searchParams.get('status');
  const eventType = searchParams.get('eventType');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const upcoming = searchParams.get('upcoming') === 'true';
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  let query = supabase
    .from('events')
    .select('*', { count: 'exact' })
    .order('startDate', { ascending: true })
    .range(offset, offset + limit - 1);

  // Filter by status
  if (status) {
    query = query.eq('status', status);
  }

  // Filter by event type
  if (eventType) {
    query = query.eq('eventType', eventType);
  }

  // Filter by date range
  if (startDate) {
    query = query.gte('startDate', startDate);
  }
  if (endDate) {
    query = query.lte('startDate', endDate);
  }

  // Filter upcoming events (events that haven't ended yet)
  if (upcoming) {
    const now = new Date().toISOString();
    query = query.gte('endDate', now);
  }

  const { data, error, count } = await query;

  if (error) {
    return errorResponse(`Failed to fetch events: ${error.message}`, 500);
  }

  return successResponse({
    events: data,
    pagination: {
      total: count,
      limit,
      offset,
      hasMore: offset + limit < count,
    },
  });
});

/**
 * POST /api/admin/events
 * Create a new event
 */
export const POST = withErrorHandling(async (request) => {
  const body = await request.json();

  // Validate request
  const { success, data, errors } = validateRequest(body, adminEventSchema);
  if (!success) {
    return validationErrorResponse(errors);
  }

  const supabase = getServiceSupabase();

  // If capacity is set, initialize spotsRemaining
  if (data.capacity && !data.spotsRemaining) {
    data.spotsRemaining = data.capacity;
  }

  // Insert new event
  const { data: event, error } = await supabase
    .from('events')
    .insert([{
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }])
    .select()
    .single();

  if (error) {
    return errorResponse(`Failed to create event: ${error.message}`, 500);
  }

  return successResponse({ event }, 201);
});
