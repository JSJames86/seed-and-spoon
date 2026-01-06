/**
 * Admin API - Donors
 * Handles CRUD operations for donors
 */

import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { validateRequest, adminDonorSchema } from '@/lib/validation';
import { successResponse, errorResponse, validationErrorResponse, withErrorHandling } from '@/lib/api-helpers';

/**
 * GET /api/admin/donors
 * List all donors with optional filtering
 */
export const GET = withErrorHandling(async (request) => {
  const supabase = getServiceSupabase();
  const { searchParams } = new URL(request.url);

  const status = searchParams.get('status');
  const donorType = searchParams.get('donorType');
  const search = searchParams.get('search');
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  let query = supabase
    .from('donors')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  // Filter by status
  if (status) {
    query = query.eq('status', status);
  }

  // Filter by donor type
  if (donorType) {
    query = query.eq('donorType', donorType);
  }

  // Search by name or email
  if (search) {
    query = query.or(`fullName.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    return errorResponse(`Failed to fetch donors: ${error.message}`, 500);
  }

  return successResponse({
    donors: data,
    pagination: {
      total: count,
      limit,
      offset,
      hasMore: offset + limit < count,
    },
  });
});

/**
 * POST /api/admin/donors
 * Create a new donor
 */
export const POST = withErrorHandling(async (request) => {
  const body = await request.json();

  // Validate request
  const { success, data, errors } = validateRequest(body, adminDonorSchema);
  if (!success) {
    return validationErrorResponse(errors);
  }

  const supabase = getServiceSupabase();

  // Check if donor with this email already exists
  const { data: existing } = await supabase
    .from('donors')
    .select('id')
    .eq('email', data.email)
    .single();

  if (existing) {
    return errorResponse('A donor with this email already exists', 409);
  }

  // Insert new donor
  const { data: donor, error } = await supabase
    .from('donors')
    .insert([{
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }])
    .select()
    .single();

  if (error) {
    return errorResponse(`Failed to create donor: ${error.message}`, 500);
  }

  return successResponse({ donor }, 201);
});
