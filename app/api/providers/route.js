// app/api/providers/route.js
// API route to handle provider submission requests

import { NextResponse } from "next/server";
import { createServerSupabaseClient, handleSupabaseError } from "@/lib/supabase";

export async function POST(request) {
  try {
    console.log('[API] Processing provider submission...');

    const body = await request.json();

    // Validate required fields
    if (!body.orgName?.trim()) {
      return NextResponse.json(
        { error: 'Missing required field: organization name is required' },
        { status: 400 }
      );
    }

    if (!body.county) {
      return NextResponse.json(
        { error: 'Missing required field: county is required' },
        { status: 400 }
      );
    }

    if (!body.address?.zip) {
      return NextResponse.json(
        { error: 'Missing required field: ZIP code is required' },
        { status: 400 }
      );
    }

    if (!body.contact?.phone && !body.contact?.email) {
      return NextResponse.json(
        { error: 'At least one contact method (phone or email) is required' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = createServerSupabaseClient();

    // Prepare the provider record
    const providerRecord = {
      org_name: body.orgName,
      site_name: body.siteName || null,
      county: body.county,
      street: body.address.street || '',
      city: body.address.city || '',
      state: body.address.state || 'NJ',
      zip: body.address.zip,
      type: body.type || null,
      hours: body.hours || [],
      services: body.services || [],
      languages: body.languages || ['English'],
      contact_phone: body.contact.phone || null,
      contact_email: body.contact.email || null,
      contact_website: body.contact.website || null,
      eligibility: body.eligibility || null,
      notes: body.notes || '',
      consent: body.consent || false,
      status: 'pending',
      submitted_at: new Date().toISOString(),
    };

    // Insert into Supabase
    const { data, error } = await supabase
      .from('providers')
      .insert([providerRecord])
      .select()
      .single();

    if (error) {
      console.error('[API] Supabase error:', error);
      return NextResponse.json(
        handleSupabaseError(error, 'Failed to submit provider information'),
        { status: 500 }
      );
    }

    console.log('[API] Provider submission successful:', data.id);

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Thank you! Your submission has been received and will be reviewed within 3-5 business days.',
      id: data.id,
    }, { status: 201 });

  } catch (error) {
    console.error('[API] Error processing provider submission:', error);
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
