/**
 * Admin API - Individual Event
 * Handles GET, PUT, DELETE for a specific event
 */

import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { validateRequest, adminEventSchema } from '@/lib/validation';
import { successResponse, errorResponse, validationErrorResponse, withErrorHandling } from '@/lib/api-helpers';

/**
 * GET /api/admin/events/[id]
 * Get a specific event by ID
 */
export const GET = withErrorHandling(async (request, { params }) => {
  const { id } = params;
  const supabase = getServiceSupabase();

  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !event) {
    return errorResponse('Event not found', 404);
  }

  return successResponse({ event });
});

/**
 * PUT /api/admin/events/[id]
 * Update a specific event
 */
export const PUT = withErrorHandling(async (request, { params }) => {
  const { id } = params;
  const body = await request.json();

  // Validate request (use partial schema for updates)
  const partialSchema = adminEventSchema.partial();
  const { success, data, errors } = validateRequest(body, partialSchema);
  if (!success) {
    return validationErrorResponse(errors);
  }

  const supabase = getServiceSupabase();

  // Check if event exists
  const { data: existing } = await supabase
    .from('events')
    .select('id')
    .eq('id', id)
    .single();

  if (!existing) {
    return errorResponse('Event not found', 404);
  }

  // If capacity is being updated, also update spotsRemaining if not explicitly set
  if (data.capacity !== undefined && data.spotsRemaining === undefined) {
    const { data: currentEvent } = await supabase
      .from('events')
      .select('capacity, spotsRemaining')
      .eq('id', id)
      .single();

    if (currentEvent) {
      const registeredCount = (currentEvent.capacity || 0) - (currentEvent.spotsRemaining || 0);
      data.spotsRemaining = Math.max(0, data.capacity - registeredCount);
    }
  }

  // Update event
  const { data: event, error } = await supabase
    .from('events')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return errorResponse(`Failed to update event: ${error.message}`, 500);
  }

  return successResponse({ event });
});

/**
 * DELETE /api/admin/events/[id]
 * Delete a specific event
 */
export const DELETE = withErrorHandling(async (request, { params }) => {
  const { id } = params;
  const supabase = getServiceSupabase();

  // Check if event exists
  const { data: existing } = await supabase
    .from('events')
    .select('id')
    .eq('id', id)
    .single();

  if (!existing) {
    return errorResponse('Event not found', 404);
  }

  // Delete event
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id);

  if (error) {
    return errorResponse(`Failed to delete event: ${error.message}`, 500);
  }

  return successResponse({ message: 'Event deleted successfully' });
});
