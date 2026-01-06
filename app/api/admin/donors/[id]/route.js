/**
 * Admin API - Individual Donor
 * Handles GET, PUT, DELETE for a specific donor
 */

import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { validateRequest, adminDonorSchema } from '@/lib/validation';
import { successResponse, errorResponse, validationErrorResponse, withErrorHandling } from '@/lib/api-helpers';

/**
 * GET /api/admin/donors/[id]
 * Get a specific donor by ID
 */
export const GET = withErrorHandling(async (request, { params }) => {
  const { id } = params;
  const supabase = getServiceSupabase();

  const { data: donor, error } = await supabase
    .from('donors')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !donor) {
    return errorResponse('Donor not found', 404);
  }

  return successResponse({ donor });
});

/**
 * PUT /api/admin/donors/[id]
 * Update a specific donor
 */
export const PUT = withErrorHandling(async (request, { params }) => {
  const { id } = params;
  const body = await request.json();

  // Validate request (use partial schema for updates)
  const partialSchema = adminDonorSchema.partial();
  const { success, data, errors } = validateRequest(body, partialSchema);
  if (!success) {
    return validationErrorResponse(errors);
  }

  const supabase = getServiceSupabase();

  // Check if donor exists
  const { data: existing } = await supabase
    .from('donors')
    .select('id')
    .eq('id', id)
    .single();

  if (!existing) {
    return errorResponse('Donor not found', 404);
  }

  // If email is being updated, check it's not already in use
  if (data.email) {
    const { data: emailExists } = await supabase
      .from('donors')
      .select('id')
      .eq('email', data.email)
      .neq('id', id)
      .single();

    if (emailExists) {
      return errorResponse('A donor with this email already exists', 409);
    }
  }

  // Update donor
  const { data: donor, error } = await supabase
    .from('donors')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return errorResponse(`Failed to update donor: ${error.message}`, 500);
  }

  return successResponse({ donor });
});

/**
 * DELETE /api/admin/donors/[id]
 * Delete a specific donor
 */
export const DELETE = withErrorHandling(async (request, { params }) => {
  const { id } = params;
  const supabase = getServiceSupabase();

  // Check if donor exists
  const { data: existing } = await supabase
    .from('donors')
    .select('id')
    .eq('id', id)
    .single();

  if (!existing) {
    return errorResponse('Donor not found', 404);
  }

  // Delete donor (CASCADE will handle related donations if configured)
  const { error } = await supabase
    .from('donors')
    .delete()
    .eq('id', id);

  if (error) {
    return errorResponse(`Failed to delete donor: ${error.message}`, 500);
  }

  return successResponse({ message: 'Donor deleted successfully' });
});
