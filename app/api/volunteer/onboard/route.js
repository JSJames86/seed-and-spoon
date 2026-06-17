import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey);
}

// GET — validate invite token OR list volunteers for admin
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const action = searchParams.get('action');
  const supabase = getSupabase();

  // Admin: list review queue
  if (action === 'review_queue') {
    const { data, error } = await supabase
      .from('volunteer_review_queue')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ volunteers: data });
  }

  // Admin: list all volunteers
  if (action === 'list') {
    const { data, error } = await supabase
      .from('volunteers')
      .select('id, first_name, last_name, email, status, is_minor, created_at')
      .order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ volunteers: data });
  }

  // Admin: get single volunteer detail
  const volunteerId = searchParams.get('volunteer_id');
  if (volunteerId) {
    const [volunteer, roles, guardian, driver, consents, emergencyContacts, bgChecks, hours, accommodations, minorId] = await Promise.all([
      supabase.from('volunteers').select('*').eq('id', volunteerId).single(),
      supabase.from('volunteer_role_preferences').select('*').eq('volunteer_id', volunteerId),
      supabase.from('volunteer_guardian').select('*').eq('volunteer_id', volunteerId).maybeSingle(),
      supabase.from('volunteer_driver_verification').select('*').eq('volunteer_id', volunteerId).maybeSingle(),
      supabase.from('volunteer_consents').select('*').eq('volunteer_id', volunteerId),
      supabase.from('volunteer_emergency_contacts').select('*').eq('volunteer_id', volunteerId),
      supabase.from('volunteer_background_checks').select('*').eq('volunteer_id', volunteerId),
      supabase.from('volunteer_hours_log').select('*').eq('volunteer_id', volunteerId),
      supabase.from('volunteer_accommodations').select('*').eq('volunteer_id', volunteerId).maybeSingle(),
      supabase.from('volunteer_minor_id').select('*').eq('volunteer_id', volunteerId).maybeSingle(),
    ]);
    if (volunteer.error) return NextResponse.json({ error: 'Volunteer not found' }, { status: 404 });
    return NextResponse.json({
      volunteer: volunteer.data,
      roles: roles.data || [],
      guardian: guardian.data,
      driver: driver.data,
      consents: consents.data || [],
      emergency_contacts: emergencyContacts.data || [],
      background_checks: bgChecks.data || [],
      hours: hours.data || [],
      accommodations: accommodations.data,
      minor_id: minorId.data,
    });
  }

  // Token validation for onboarding form
  if (!token) {
    return NextResponse.json({ error: 'Token required' }, { status: 400 });
  }

  const { data: vol, error } = await supabase
    .from('volunteers')
    .select('id, status, first_name, invite_email')
    .eq('invite_token', token)
    .single();

  if (error || !vol) {
    return NextResponse.json({ error: 'Invalid or expired invite link.' }, { status: 404 });
  }

  if (vol.status === 'active' || vol.status === 'approved' || vol.status === 'pending_review') {
    return NextResponse.json({ error: 'already_submitted', message: 'This onboarding form has already been submitted.' }, { status: 409 });
  }

  return NextResponse.json({
    volunteer_id: vol.id,
    status: vol.status,
    first_name: vol.first_name,
    invite_email: vol.invite_email,
  });
}

// POST — invite, submit onboarding, or admin actions
export async function POST(request) {
  const body = await request.json();
  const { action } = body;
  const supabase = getSupabase();

  // ============ INVITE ============
  if (action === 'invite') {
    const { email, first_name, invited_by } = body;
    if (!email?.trim()) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from('volunteers')
      .select('id')
      .eq('invite_email', email.trim().toLowerCase())
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'This email has already been invited.' }, { status: 409 });
    }

    const { data, error } = await supabase
      .from('volunteers')
      .insert({
        invite_email: email.trim().toLowerCase(),
        first_name: first_name?.trim() || null,
        status: 'invited',
        invited_at: new Date().toISOString(),
        invited_by: invited_by || null,
      })
      .select('id, invite_token, invite_email, first_name')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ invite: data });
  }

  // ============ SUBMIT ONBOARDING ============
  if (action === 'submit_onboarding') {
    const { volunteer_id, personal, emergency_contacts, roles: rolePrefs, guardian, minor_info, driver, hours_purpose, consents, accommodations } = body;

    if (!volunteer_id) {
      return NextResponse.json({ error: 'volunteer_id is required' }, { status: 400 });
    }

    // Validate required personal info
    if (!personal?.first_name?.trim() || !personal?.last_name?.trim() || !personal?.email?.trim()) {
      return NextResponse.json({ error: 'First name, last name, and email are required' }, { status: 400 });
    }

    if (!emergency_contacts?.length) {
      return NextResponse.json({ error: 'At least one emergency contact is required' }, { status: 400 });
    }

    // Determine minor status from DOB
    let isMinor = false;
    if (personal.date_of_birth) {
      const dob = new Date(personal.date_of_birth);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      isMinor = age < 18 || (age === 18 && monthDiff < 0) || (age === 18 && monthDiff === 0 && today.getDate() < dob.getDate());
    }

    try {
      // 1. Update volunteer record
      const { error: volErr } = await supabase
        .from('volunteers')
        .update({
          first_name: personal.first_name.trim(),
          last_name: personal.last_name.trim(),
          email: personal.email.trim().toLowerCase(),
          phone: personal.phone?.trim() || null,
          date_of_birth: personal.date_of_birth || null,
          is_minor: isMinor,
          is_youth: isMinor,
          street_address: personal.street_address?.trim() || null,
          city: personal.city?.trim() || null,
          state: personal.state || 'NJ',
          zip: personal.zip?.trim() || null,
          status: 'pending_review',
        })
        .eq('id', volunteer_id);

      if (volErr) throw volErr;

      // 2. Emergency contacts
      for (const ec of emergency_contacts) {
        await supabase.from('volunteer_emergency_contacts').insert({
          volunteer_id,
          contact_name: ec.contact_name.trim(),
          relationship: ec.relationship.trim(),
          phone: ec.phone.trim(),
          is_primary: ec.is_primary || false,
        });
      }

      // 3. Role preferences
      if (rolePrefs?.length) {
        for (const rp of rolePrefs) {
          await supabase.from('volunteer_role_preferences').insert({
            volunteer_id,
            role_key: rp.role_key,
            interest_level: rp.interest_level || 'interested',
          });
        }
      }

      // 4. Guardian (minor branch)
      if (isMinor && guardian) {
        await supabase.from('volunteer_guardian').insert({
          volunteer_id,
          guardian_name: guardian.guardian_name.trim(),
          guardian_relationship: guardian.guardian_relationship,
          guardian_phone: guardian.guardian_phone.trim(),
          guardian_email: guardian.guardian_email?.trim() || null,
        });
      }

      // 5. Minor ID (minor branch)
      if (isMinor && minor_info) {
        await supabase.from('volunteer_minor_id').insert({
          volunteer_id,
          school_name: minor_info.school_name?.trim() || null,
          grade: minor_info.grade?.trim() || null,
          school_contact_phone: minor_info.school_contact_phone?.trim() || null,
          parent_work_schedule: minor_info.parent_work_schedule?.trim() || null,
          availability_notes: minor_info.availability_notes?.trim() || null,
        });
      }

      // 6. Driver verification
      if (driver?.wants_to_drive) {
        await supabase.from('volunteer_driver_verification').insert({
          volunteer_id,
          wants_to_drive: true,
          license_state: driver.license_state || 'NJ',
          license_number_last4: driver.license_number_last4?.trim() || null,
          license_expiration: driver.license_expiration || null,
          has_insurance: driver.has_insurance || false,
          insurance_expiration: driver.insurance_expiration || null,
        });
      }

      // 7. Hours purpose
      if (hours_purpose?.purpose && hours_purpose.purpose !== 'general') {
        await supabase.from('volunteer_hours_log').insert({
          volunteer_id,
          purpose: hours_purpose.purpose,
          hours_needed: hours_purpose.hours_needed || null,
          due_date: hours_purpose.due_date || null,
          institution_name: hours_purpose.institution_name?.trim() || null,
          supervisor_name: hours_purpose.supervisor_name?.trim() || null,
          supervisor_contact: hours_purpose.supervisor_contact?.trim() || null,
        });
      }

      // 8. Consents
      if (consents?.length) {
        for (const consent of consents) {
          await supabase.from('volunteer_consents').insert({
            volunteer_id,
            consent_type: consent,
            ip_address: body.ip_address || null,
          });
        }
      }

      // 9. Accommodations
      if (accommodations?.has_accommodations) {
        await supabase.from('volunteer_accommodations').insert({
          volunteer_id,
          has_accommodations: true,
          description: accommodations.description?.trim() || null,
        });
      }

      return NextResponse.json({ success: true, is_minor: isMinor });
    } catch (err) {
      console.error('[Volunteer Onboard] Error:', err);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  // ============ ADMIN: UPDATE STATUS ============
  if (action === 'update_status') {
    const { volunteer_id, status } = body;
    const validStatuses = ['invited', 'pending_auth', 'onboarding', 'pending_review', 'approved', 'active', 'inactive'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updates = { status };
    if (status === 'approved') {
      updates.approved_at = new Date().toISOString();
      updates.approved_by = body.approved_by || null;
    }

    const { error } = await supabase
      .from('volunteers')
      .update(updates)
      .eq('id', volunteer_id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  // ============ ADMIN: INITIATE BACKGROUND CHECK ============
  if (action === 'initiate_bg_check') {
    const { volunteer_id, check_type } = body;
    const { data, error } = await supabase
      .from('volunteer_background_checks')
      .upsert({
        volunteer_id,
        check_type: check_type || 'all',
        status: 'in_progress',
        initiated_at: new Date().toISOString(),
      }, { onConflict: 'volunteer_id,check_type' })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ background_check: data });
  }

  // ============ ADMIN: UPDATE BACKGROUND CHECK ============
  if (action === 'update_bg_check') {
    const { volunteer_id, check_type, status, reviewed_by, notes } = body;
    const { error } = await supabase
      .from('volunteer_background_checks')
      .update({
        status,
        completed_at: ['clear', 'flagged', 'disqualified'].includes(status) ? new Date().toISOString() : null,
        reviewed_by: reviewed_by || null,
        notes: notes || null,
      })
      .eq('volunteer_id', volunteer_id)
      .eq('check_type', check_type || 'all');

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
