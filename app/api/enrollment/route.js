import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const CONTACT_METHODS = ['call', 'text', 'whatsapp', 'email'];
const LANGUAGES = ['english', 'spanish', 'other'];
const IF_NOT_HOME = ['leave_at_door', 'call_first', 'reschedule'];
const FREEZER_OPTIONS = ['yes', 'limited', 'no'];
const SEVERITIES = ['I', 'A', 'S'];
const ALLERGENS = [
  'milk_dairy', 'egg', 'peanut', 'tree_nuts', 'fish',
  'shellfish', 'wheat_gluten', 'soy', 'sesame', 'other',
];

function validatePayload(data) {
  if (!data.household_id?.trim()) return 'Household code is required';
  if (!data.contact_name?.trim()) return 'Contact name is required';
  if (!data.phone?.trim()) return 'Phone number is required';
  if (!CONTACT_METHODS.includes(data.contact_method)) return 'Invalid contact method';
  if (!LANGUAGES.includes(data.preferred_language)) return 'Invalid language preference';
  if (!Number.isInteger(Number(data.children_count)) || Number(data.children_count) < 1) return 'At least one child is required';
  if (!Number.isInteger(Number(data.adults_in_home)) || Number(data.adults_in_home) < 1) return 'At least one adult is required';
  if (!data.delivery_address?.trim()) return 'Delivery address is required';
  if (!IF_NOT_HOME.includes(data.if_not_home)) return 'Please select what to do if no one is home';
  if (!FREEZER_OPTIONS.includes(data.freezer_space)) return 'Please indicate freezer space availability';
  if (!data.consent_allergen_accuracy) return 'You must confirm allergen information accuracy';
  if (!data.consent_update_changes) return 'You must agree to report changes';
  if (!data.consent_program_messages) return 'You must consent to program messages';

  if (!Array.isArray(data.children) || data.children.length < 1) return 'At least one child entry is required';
  for (let i = 0; i < data.children.length; i++) {
    const c = data.children[i];
    if (!c.label?.trim()) return `Child ${i + 1}: label/initial is required`;
  }

  if (data.allergens && Array.isArray(data.allergens)) {
    for (const a of data.allergens) {
      if (!ALLERGENS.includes(a.allergen)) return `Invalid allergen: ${a.allergen}`;
      if (!SEVERITIES.includes(a.severity)) return `Invalid severity for ${a.allergen}`;
    }
  }

  return null;
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
    const householdId = data.household_id.trim().toUpperCase();

    // 1. Insert household enrollment
    const { error: enrollError } = await supabase
      .from('household_enrollments')
      .insert([{
        household_id: householdId,
        enrollment_date: data.enrollment_date || new Date().toISOString().split('T')[0],
        contact_name: data.contact_name.trim(),
        phone: data.phone.trim(),
        contact_method: data.contact_method,
        email: data.email?.trim() || null,
        preferred_language: data.preferred_language,
        preferred_language_other: data.preferred_language_other?.trim() || null,
        children_count: Number(data.children_count),
        adults_in_home: Number(data.adults_in_home),
        dietary_vegetarian: Boolean(data.dietary_vegetarian),
        dietary_vegan: Boolean(data.dietary_vegan),
        dietary_no_pork: Boolean(data.dietary_no_pork),
        dietary_halal: Boolean(data.dietary_halal),
        dietary_kosher: Boolean(data.dietary_kosher),
        dietary_other: data.dietary_other?.trim() || null,
        delivery_address: data.delivery_address.trim(),
        delivery_unit_access: data.delivery_unit_access?.trim() || null,
        delivery_window: data.delivery_window?.trim() || null,
        if_not_home: data.if_not_home,
        freezer_space: data.freezer_space,
        consent_allergen_accuracy: true,
        consent_update_changes: true,
        consent_program_messages: true,
        consent_funder_reports: Boolean(data.consent_funder_reports),
        allergen_confirmed: Boolean(data.allergen_confirmed),
        allergen_confirmed_at: data.allergen_confirmed ? new Date().toISOString() : null,
        intake_completed_by: data.intake_completed_by?.trim() || null,
        signature_name: data.signature_name?.trim() || null,
        signature_date: data.signature_date || new Date().toISOString().split('T')[0],
        status: data.allergen_confirmed ? 'enrolled' : 'pending',
      }]);

    if (enrollError) {
      if (enrollError.code === '23505') {
        return NextResponse.json(
          { error: 'Duplicate', message: `Household ${householdId} is already enrolled.` },
          { status: 409 }
        );
      }
      console.error('[Enrollment API] Enrollment insert error:', enrollError);
      return NextResponse.json({ error: 'Database error', message: enrollError.message }, { status: 500 });
    }

    // 2. Insert children
    const childRows = data.children.map(c => ({
      household_id: householdId,
      label: c.label.trim(),
      age: c.age ? Number(c.age) : null,
      texture_medical_needs: c.texture_medical_needs?.trim() || null,
    }));

    const { data: insertedChildren, error: childError } = await supabase
      .from('household_children')
      .insert(childRows)
      .select('id, label');

    if (childError) {
      console.error('[Enrollment API] Children insert error:', childError);
      return NextResponse.json({ error: 'Database error', message: childError.message }, { status: 500 });
    }

    // 3. Insert allergen flags (if any)
    if (data.allergens && data.allergens.length > 0) {
      const childLabelToId = {};
      for (const c of insertedChildren) {
        childLabelToId[c.label] = c.id;
      }

      const allergenRows = data.allergens
        .filter(a => childLabelToId[a.child_label])
        .map(a => ({
          child_id: childLabelToId[a.child_label],
          household_id: householdId,
          allergen: a.allergen,
          allergen_other_name: a.allergen === 'other' ? (a.allergen_other_name?.trim() || null) : null,
          severity: a.severity,
          version: 1,
          is_current: true,
          confirmed_by: data.intake_completed_by?.trim() || null,
          confirmed_at: data.allergen_confirmed ? new Date().toISOString() : null,
        }));

      if (allergenRows.length > 0) {
        const { error: allergenError } = await supabase
          .from('allergen_flags')
          .insert(allergenRows);

        if (allergenError) {
          console.error('[Enrollment API] Allergen insert error:', allergenError);
          return NextResponse.json({ error: 'Database error', message: allergenError.message }, { status: 500 });
        }
      }
    }

    const hasSevere = data.allergens?.some(a => a.severity === 'S') || false;

    return NextResponse.json({
      success: true,
      message: data.allergen_confirmed
        ? `Household ${householdId} enrolled successfully.`
        : `Household ${householdId} intake saved. Allergen confirmation pending before enrollment.`,
      household_id: householdId,
      status: data.allergen_confirmed ? 'enrolled' : 'pending',
      has_severe_allergens: hasSevere,
    }, { status: 201 });

  } catch (err) {
    console.error('[Enrollment API] Error:', err);
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to process enrollment. Please try again.' },
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
