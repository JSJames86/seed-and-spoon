/**
 * Admin API - Donations
 * Handles CRUD operations for donations
 */

import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { validateRequest, adminDonationSchema } from '@/lib/validation';
import { successResponse, errorResponse, validationErrorResponse, withErrorHandling } from '@/lib/api-helpers';

/**
 * GET /api/admin/donations
 * List all donations with optional filtering
 */
export const GET = withErrorHandling(async (request) => {
  const supabase = getServiceSupabase();
  const { searchParams } = new URL(request.url);

  const donorId = searchParams.get('donorId');
  const status = searchParams.get('status');
  const donationType = searchParams.get('donationType');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  let query = supabase
    .from('donations')
    .select(`
      *,
      donor:donors(id, fullName, email)
    `, { count: 'exact' })
    .order('donationDate', { ascending: false })
    .range(offset, offset + limit - 1);

  // Filter by donor ID
  if (donorId) {
    query = query.eq('donorId', donorId);
  }

  // Filter by status
  if (status) {
    query = query.eq('status', status);
  }

  // Filter by donation type
  if (donationType) {
    query = query.eq('donationType', donationType);
  }

  // Filter by date range
  if (startDate) {
    query = query.gte('donationDate', startDate);
  }
  if (endDate) {
    query = query.lte('donationDate', endDate);
  }

  const { data, error, count } = await query;

  if (error) {
    return errorResponse(`Failed to fetch donations: ${error.message}`, 500);
  }

  // Calculate total amount
  const totalAmount = data?.reduce((sum, donation) => sum + (donation.amount || 0), 0) || 0;

  return successResponse({
    donations: data,
    pagination: {
      total: count,
      limit,
      offset,
      hasMore: offset + limit < count,
    },
    summary: {
      totalAmount,
      totalCount: count,
    },
  });
});

/**
 * POST /api/admin/donations
 * Create a new donation
 */
export const POST = withErrorHandling(async (request) => {
  const body = await request.json();

  // Validate request
  const { success, data, errors } = validateRequest(body, adminDonationSchema);
  if (!success) {
    return validationErrorResponse(errors);
  }

  const supabase = getServiceSupabase();

  // Verify donor exists
  const { data: donor, error: donorError } = await supabase
    .from('donors')
    .select('id, totalDonated')
    .eq('id', data.donorId)
    .single();

  if (donorError || !donor) {
    return errorResponse('Donor not found', 404);
  }

  // Insert new donation
  const { data: donation, error } = await supabase
    .from('donations')
    .insert([{
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }])
    .select()
    .single();

  if (error) {
    return errorResponse(`Failed to create donation: ${error.message}`, 500);
  }

  // Update donor's total donated and last donation date if status is completed
  if (data.status === 'completed') {
    await supabase
      .from('donors')
      .update({
        totalDonated: (donor.totalDonated || 0) + data.amount,
        lastDonationDate: data.donationDate,
        updated_at: new Date().toISOString(),
      })
      .eq('id', data.donorId);
  }

  return successResponse({ donation }, 201);
});
