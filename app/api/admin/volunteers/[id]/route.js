/**
 * Admin API - Individual Volunteer
 * Handles GET, PUT, DELETE for a specific volunteer
 */

import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { validateRequest, adminVolunteerSchema } from '@/lib/validation';
import { successResponse, errorResponse, validationErrorResponse, withErrorHandling } from '@/lib/api-helpers';

/**
 * GET /api/admin/volunteers/[id]
 * Get a specific volunteer by ID
 */
export const GET = withErrorHandling(async (request, { params }) => {
  const { id } = params;
  const supabase = getServiceSupabase();

  const { data: volunteer, error } = await supabase
    .from('volunteers')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !volunteer) {
    return errorResponse('Volunteer not found', 404);
  }

  return successResponse({ volunteer });
});

/**
 * PUT /api/admin/volunteers/[id]
 * Update a specific volunteer
 */
export const PUT = withErrorHandling(async (request, { params }) => {
  const { id } = params;
  const body = await request.json();

  // Validate request (use partial schema for updates)
  const partialSchema = adminVolunteerSchema.partial();
  const { success, data, errors } = validateRequest(body, partialSchema);
  if (!success) {
    return validationErrorResponse(errors);
  }

  const supabase = getServiceSupabase();

  // Check if volunteer exists
  const { data: existing } = await supabase
    .from('volunteers')
    .select('id')
    .eq('id', id)
    .single();

  if (!existing) {
    return errorResponse('Volunteer not found', 404);
  }

  // If email is being updated, check it's not already in use
  if (data.email) {
    const { data: emailExists } = await supabase
      .from('volunteers')
      .select('id')
      .eq('email', data.email)
      .neq('id', id)
      .single();

    if (emailExists) {
      return errorResponse('A volunteer with this email already exists', 409);
    }
  }

  // Update volunteer
  const { data: volunteer, error } = await supabase
    .from('volunteers')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return errorResponse(`Failed to update volunteer: ${error.message}`, 500);
  }

  return successResponse({ volunteer });
});

/**
 * DELETE /api/admin/volunteers/[id]
 * Delete a specific volunteer
 */
export const DELETE = withErrorHandling(async (request, { params }) => {
  const { id } = params;
  const supabase = getServiceSupabase();

  // Check if volunteer exists
  const { data: existing } = await supabase
    .from('volunteers')
    .select('id')
    .eq('id', id)
    .single();

  if (!existing) {
    return errorResponse('Volunteer not found', 404);
  }

  // Delete volunteer
  const { error } = await supabase
    .from('volunteers')
    .delete()
    .eq('id', id);

  if (error) {
    return errorResponse(`Failed to delete volunteer: ${error.message}`, 500);
  }

  return successResponse({ message: 'Volunteer deleted successfully' });
});
