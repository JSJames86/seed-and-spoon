import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const VALID_PHASES = ['baseline', 'weekly', 'endline'];

function validatePayload(data) {
  if (!data.household_id?.trim()) {
    return 'Household code is required';
  }
  if (!VALID_PHASES.includes(data.phase)) {
    return 'Phase must be baseline, weekly, or endline';
  }
  if (data.phase === 'weekly') {
    const wn = Number(data.week_number);
    if (!Number.isInteger(wn) || wn < 1 || wn > 6) {
      return 'Week number (1-6) is required for weekly check-ins';
    }
  }
  if (data.recommend_score != null) {
    const rs = Number(data.recommend_score);
    if (!Number.isInteger(rs) || rs < 0 || rs > 10) {
      return 'Recommend score must be 0-10';
    }
  }
  if (data.feeding_ease && !['much_easier', 'a_little_easier', 'no_change', 'harder'].includes(data.feeding_ease)) {
    return 'Invalid feeding ease value';
  }
  if (data.food_ran_out && !['never', 'sometimes', 'often'].includes(data.food_ran_out)) {
    return 'Invalid food_ran_out value';
  }
  return null;
}

function sanitizeNumeric(val) {
  if (val === '' || val === null || val === undefined) return null;
  const n = Number(val);
  return isNaN(n) ? null : n;
}

function buildRow(data) {
  return {
    household_id: data.household_id.trim().toUpperCase(),
    phase: data.phase,
    week_number: data.phase === 'weekly' ? Number(data.week_number) : null,
    survey_date: data.survey_date || new Date().toISOString().split('T')[0],
    children_served: sanitizeNumeric(data.children_served),
    adults_in_home: sanitizeNumeric(data.adults_in_home),
    zip: data.zip?.trim() || null,
    trips_per_week: sanitizeNumeric(data.trips_per_week),
    miles_round_trip: sanitizeNumeric(data.miles_round_trip),
    delivery_times_per_week: sanitizeNumeric(data.delivery_times_per_week),
    delivery_fee_each: sanitizeNumeric(data.delivery_fee_each),
    delivery_total_paid: sanitizeNumeric(data.delivery_total_paid),
    meals_from_stock: sanitizeNumeric(data.meals_from_stock),
    hours_per_week: sanitizeNumeric(data.hours_per_week),
    food_ran_out: data.food_ran_out || null,
    hardest_part: data.hardest_part?.trim() || null,
    kit_condition_ok: data.kit_condition_ok != null ? Boolean(data.kit_condition_ok) : null,
    kit_condition_issue: data.kit_condition_issue?.trim() || null,
    recommend_score: sanitizeNumeric(data.recommend_score),
    feeding_ease: data.feeding_ease || null,
    kit_difference: data.kit_difference?.trim() || null,
    improvement_suggestions: data.improvement_suggestions?.trim() || null,
  };
}

export async function POST(request) {
  try {
    const data = await request.json();

    const error = validatePayload(data);
    if (error) {
      return NextResponse.json({ error: 'Validation failed', message: error }, { status: 400 });
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Server configuration error', message: 'Database not configured' },
        { status: 503 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const row = buildRow(data);

    const { data: inserted, error: dbError } = await supabase
      .from('survey_responses')
      .insert([row])
      .select();

    if (dbError) {
      console.error('[Surveys API] Supabase error:', dbError);
      return NextResponse.json(
        { error: 'Database error', message: dbError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Survey response recorded',
      id: inserted?.[0]?.id,
    }, { status: 201 });

  } catch (err) {
    console.error('[Surveys API] Error:', err);
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to process survey. Please try again.' },
      { status: 500 }
    );
  }
}

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
