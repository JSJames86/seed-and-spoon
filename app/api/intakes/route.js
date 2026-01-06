// app/api/intakes/route.js
// API route to handle client intake form submissions

import { NextResponse } from "next/server";
import { createServerSupabaseClient, handleSupabaseError } from "@/lib/supabase";

export async function POST(request) {
  try {
    console.log('[API] Processing intake submission...');

    const body = await request.json();

    // Validate required fields
    if (!body.applicant?.name || !body.applicant?.phone) {
      return NextResponse.json(
        { error: 'Missing required fields: name and phone are required' },
        { status: 400 }
      );
    }

    if (!body.address?.zip) {
      return NextResponse.json(
        { error: 'Missing required field: ZIP code is required' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = createServerSupabaseClient();

    // Prepare the intake record
    const intakeRecord = {
      kind: body.kind || 'client',
      applicant_name: body.applicant.name,
      applicant_phone: body.applicant.phone,
      applicant_email: body.applicant.email || null,
      preferred_contact: body.applicant.preferredContact || 'phone',
      preferred_language: body.applicant.preferredLanguage || 'English',
      street: body.address.street || '',
      city: body.address.city || '',
      state: body.address.state || 'NJ',
      zip: body.address.zip,
      household_size: body.householdSize || 1,
      has_children_under_2: body.hasChildrenUnder2 || false,
      infant_needs: body.infantNeeds || [],
      has_seniors_or_disability: body.hasSeniorsOrDisability || false,
      allergies: body.allergies || [],
      dietary_restrictions: body.dietaryRestrictions || [],
      kitchen_access: body.kitchenAccess || 'full',
      on_snap: body.onSNAP || null,
      on_wic: body.onWIC || null,
      transportation: body.transportation || null,
      notes: body.notes || '',
      consent: body.consent || false,
      status: 'pending',
      submitted_at: new Date().toISOString(),
    };

    // Insert into Supabase
    const { data, error } = await supabase
      .from('intakes')
      .insert([intakeRecord])
      .select()
      .single();

    if (error) {
      console.error('[API] Supabase error:', error);
      return NextResponse.json(
        handleSupabaseError(error, 'Failed to submit intake form'),
        { status: 500 }
      );
    }

    console.log('[API] Intake submission successful:', data.id);

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Your application has been submitted successfully. We will contact you within 2-3 business days.',
      id: data.id,
    }, { status: 201 });

  } catch (error) {
    console.error('[API] Error processing intake:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error.message,
        details: 'Failed to process your submission. Please try again later.'
      },
      { status: 500 }
    );
  }
}
