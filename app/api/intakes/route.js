/**
 * Intakes API Route
 *
 * Handles form submissions for client applications and partner referrals
 * Stores data in Supabase or sends to backend
 */

import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(request) {
  try {
    const data = await request.json();

    console.log('[Intakes API] Received intake submission:', data.kind);

    // Validate required fields
    if (!data.kind || !['client', 'referral'].includes(data.kind)) {
      return NextResponse.json(
        { error: 'Invalid intake type', message: 'kind must be "client" or "referral"' },
        { status: 400 }
      );
    }

    // Validate client intake required fields
    if (data.kind === 'client') {
      if (!data.applicant?.name?.trim()) {
        return NextResponse.json(
          { error: 'Validation failed', message: 'Applicant name is required' },
          { status: 400 }
        );
      }
      if (!data.applicant?.phone?.trim()) {
        return NextResponse.json(
          { error: 'Validation failed', message: 'Phone number is required' },
          { status: 400 }
        );
      }
      if (!data.address?.zip?.trim()) {
        return NextResponse.json(
          { error: 'Validation failed', message: 'ZIP code is required' },
          { status: 400 }
        );
      }
      if (!data.consent) {
        return NextResponse.json(
          { error: 'Validation failed', message: 'Consent is required' },
          { status: 400 }
        );
      }
    }

    // If Supabase is configured, store in database
    if (supabaseUrl && supabaseServiceKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Store the intake in the intakes table
        const { data: insertedData, error: dbError } = await supabase
          .from('intakes')
          .insert([{
            kind: data.kind,
            applicant_name: data.applicant?.name || data.referrer?.name,
            applicant_phone: data.applicant?.phone || data.referrer?.phone,
            applicant_email: data.applicant?.email || data.referrer?.email,
            address_street: data.address?.street,
            address_city: data.address?.city,
            address_state: data.address?.state || 'NJ',
            address_zip: data.address?.zip,
            household_size: data.householdSize,
            has_children_under_2: data.hasChildrenUnder2,
            infant_needs: data.infantNeeds,
            has_seniors_or_disability: data.hasSeniorsOrDisability,
            allergies: data.allergies,
            dietary_restrictions: data.dietaryRestrictions,
            kitchen_access: data.kitchenAccess,
            on_snap: data.onSNAP,
            on_wic: data.onWIC,
            transportation: data.transportation,
            notes: data.notes,
            consent: data.consent,
            // Referral-specific fields
            client_name: data.client?.name,
            client_phone: data.client?.phone,
            referrer_organization: data.referrer?.organization,
            status: 'pending',
            created_at: new Date().toISOString(),
          }])
          .select();

        if (dbError) {
          console.error('[Intakes API] Supabase error:', dbError);
          // Continue anyway - don't fail the submission
        } else {
          console.log('[Intakes API] Stored intake in Supabase:', insertedData?.[0]?.id);
        }
      } catch (supabaseError) {
        console.error('[Intakes API] Supabase connection error:', supabaseError);
        // Continue anyway - log but don't fail
      }
    } else {
      console.log('[Intakes API] Supabase not configured, skipping database storage');
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: data.kind === 'client'
        ? 'Your application has been received. We will contact you within 48 hours.'
        : 'Referral submitted successfully. We will follow up soon.',
      id: `intake_${Date.now()}`,
    }, { status: 201 });

  } catch (error) {
    console.error('[Intakes API] Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to process your submission. Please try again.'
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
