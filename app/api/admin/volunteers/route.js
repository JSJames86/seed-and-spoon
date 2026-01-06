/**
 * Admin API - Volunteers
 * Handles CRUD operations for volunteers
 */

import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { validateRequest, adminVolunteerSchema } from '@/lib/validation';
import { successResponse, errorResponse, validationErrorResponse, withErrorHandling } from '@/lib/api-helpers';

/**
 * GET /api/admin/volunteers
 * List all volunteers with optional filtering
 */
export const GET = withErrorHandling(async (request) => {
  const supabase = getServiceSupabase();
  const { searchParams } = new URL(request.url);

  const status = searchParams.get('status');
  const search = searchParams.get('search');
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  let query = supabase
    .from('volunteers')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  // Filter by status
  if (status) {
    query = query.eq('status', status);
  }

  // Search by name or email
  if (search) {
    query = query.or(`fullName.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    return errorResponse(`Failed to fetch volunteers: ${error.message}`, 500);
  }

  return successResponse({
    volunteers: data,
    pagination: {
      total: count,
      limit,
      offset,
      hasMore: offset + limit < count,
    },
  });
});

/**
 * POST /api/admin/volunteers
 * Create a new volunteer
 */
export const POST = withErrorHandling(async (request) => {
  const body = await request.json();

  // Validate request
  const { success, data, errors } = validateRequest(body, adminVolunteerSchema);
  if (!success) {
    return validationErrorResponse(errors);
  }

  const supabase = getServiceSupabase();

  // Check if volunteer with this email already exists
  const { data: existing } = await supabase
    .from('volunteers')
    .select('id')
    .eq('email', data.email)
    .single();

  if (existing) {
    return errorResponse('A volunteer with this email already exists', 409);
  }

  // Insert new volunteer
  const { data: volunteer, error } = await supabase
    .from('volunteers')
    .insert([{
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }])
    .select()
    .single();

  if (error) {
    return errorResponse(`Failed to create volunteer: ${error.message}`, 500);
  }

  return successResponse({ volunteer }, 201);
});
