/**
 * Admin API - Individual Donation
 * Handles GET, PUT, DELETE for a specific donation
 */

import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { validateRequest, adminDonationSchema } from '@/lib/validation';
import { successResponse, errorResponse, validationErrorResponse, withErrorHandling } from '@/lib/api-helpers';

/**
 * GET /api/admin/donations/[id]
 * Get a specific donation by ID
 */
export const GET = withErrorHandling(async (request, { params }) => {
  const { id } = params;
  const supabase = getServiceSupabase();

  const { data: donation, error } = await supabase
    .from('donations')
    .select(`
      *,
      donor:donors(id, fullName, email, phone)
    `)
    .eq('id', id)
    .single();

  if (error || !donation) {
    return errorResponse('Donation not found', 404);
  }

  return successResponse({ donation });
});

/**
 * PUT /api/admin/donations/[id]
 * Update a specific donation
 */
export const PUT = withErrorHandling(async (request, { params }) => {
  const { id } = params;
  const body = await request.json();

  // Validate request (use partial schema for updates)
  const partialSchema = adminDonationSchema.partial();
  const { success, data, errors } = validateRequest(body, partialSchema);
  if (!success) {
    return validationErrorResponse(errors);
  }

  const supabase = getServiceSupabase();

  // Check if donation exists
  const { data: existing, error: existingError } = await supabase
    .from('donations')
    .select('*, donor:donors(id, totalDonated)')
    .eq('id', id)
    .single();

  if (existingError || !existing) {
    return errorResponse('Donation not found', 404);
  }

  // Update donation
  const { data: donation, error } = await supabase
    .from('donations')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return errorResponse(`Failed to update donation: ${error.message}`, 500);
  }

  // If status changed to completed from another status, update donor totals
  if (data.status === 'completed' && existing.status !== 'completed') {
    const donor = existing.donor;
    await supabase
      .from('donors')
      .update({
        totalDonated: (donor.totalDonated || 0) + existing.amount,
        lastDonationDate: existing.donationDate,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.donorId);
  }
  // If status changed from completed to another status, subtract from donor totals
  else if (existing.status === 'completed' && data.status && data.status !== 'completed') {
    const donor = existing.donor;
    await supabase
      .from('donors')
      .update({
        totalDonated: Math.max(0, (donor.totalDonated || 0) - existing.amount),
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.donorId);
  }

  return successResponse({ donation });
});

/**
 * DELETE /api/admin/donations/[id]
 * Delete a specific donation
 */
export const DELETE = withErrorHandling(async (request, { params }) => {
  const { id } = params;
  const supabase = getServiceSupabase();

  // Check if donation exists
  const { data: existing, error: existingError } = await supabase
    .from('donations')
    .select('*, donor:donors(id, totalDonated)')
    .eq('id', id)
    .single();

  if (existingError || !existing) {
    return errorResponse('Donation not found', 404);
  }

  // Delete donation
  const { error } = await supabase
    .from('donations')
    .delete()
    .eq('id', id);

  if (error) {
    return errorResponse(`Failed to delete donation: ${error.message}`, 500);
  }

  // If donation was completed, subtract from donor totals
  if (existing.status === 'completed') {
    const donor = existing.donor;
    await supabase
      .from('donors')
      .update({
        totalDonated: Math.max(0, (donor.totalDonated || 0) - existing.amount),
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.donorId);
  }

  return successResponse({ message: 'Donation deleted successfully' });
});
