import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey);
}

async function auditLog(supabase, volunteerId, action, performedBy, metadata) {
  await supabase.from('volunteer_audit_log').insert({
    volunteer_id: volunteerId,
    action,
    performed_by: performedBy || null,
    metadata: metadata || null,
  });
}

// GET — validate invite token, list volunteers, get roles, get volunteer detail
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const action = searchParams.get('action');
  const volunteerId = searchParams.get('volunteer_id');
  const supabase = getSupabase();

  // Public: fetch available roles
  if (action === 'roles') {
    const { data, error } = await supabase
      .from('volunteer_roles')
      .select('*')
      .eq('active', true)
      .order('key');
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ roles: data });
  }

  // Admin: review queue
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
      .select('id, first_name, last_name, email, status, is_minor, court_ordered, created_at')
      .not('status', 'is', null)
      .order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ volunteers: data });
  }

  // Admin: get single volunteer detail
  if (volunteerId) {
    const queries = await Promise.all([
      supabase.from('volunteers').select('*').eq('id', volunteerId).single(),
      supabase.from('volunteer_role_assignments').select('*').eq('volunteer_id', volunteerId),
      supabase.from('volunteer_role_preferences').select('role_key').eq('volunteer_id', volunteerId),
      supabase.from('volunteer_guardian').select('*').eq('volunteer_id', volunteerId).maybeSingle(),
      supabase.from('volunteer_driver_verification').select('*').eq('volunteer_id', volunteerId).maybeSingle(),
      supabase.from('volunteer_consents').select('*').eq('volunteer_id', volunteerId).maybeSingle(),
      supabase.from('volunteer_emergency_contacts').select('*').eq('volunteer_id', volunteerId),
      supabase.from('volunteer_background_check').select('*').eq('volunteer_id', volunteerId).maybeSingle(),
      supabase.from('volunteer_hours_purpose').select('*').eq('volunteer_id', volunteerId).maybeSingle(),
      supabase.from('volunteer_hours_log').select('*').eq('volunteer_id', volunteerId).order('shift_date', { ascending: false }),
      supabase.from('volunteer_accommodations').select('*').eq('volunteer_id', volunteerId).maybeSingle(),
      supabase.from('volunteer_minor_id').select('*').eq('volunteer_id', volunteerId).maybeSingle(),
      supabase.from('volunteer_availability').select('*').eq('volunteer_id', volunteerId).maybeSingle(),
      supabase.from('volunteer_languages').select('*').eq('volunteer_id', volunteerId),
      supabase.from('volunteer_notes').select('*').eq('volunteer_id', volunteerId).order('created_at', { ascending: false }),
      supabase.from('volunteer_audit_log').select('*').eq('volunteer_id', volunteerId).order('created_at', { ascending: false }).limit(50),
      supabase.from('verification_letters').select('*').eq('volunteer_id', volunteerId).order('generated_at', { ascending: false }),
    ]);

    const [volunteer, roleAssignments, rolePrefs, guardian, driver, consents, emergencyContacts,
           bgCheck, hoursPurpose, hoursLog, accommodations, minorId, availability, languages,
           notes, auditLogData, letters] = queries;

    if (volunteer.error) return NextResponse.json({ error: 'Volunteer not found' }, { status: 404 });
    return NextResponse.json({
      volunteer: volunteer.data,
      role_assignments: roleAssignments.data || [],
      role_preferences: (rolePrefs.data || []).map(r => r.role_key),
      guardian: guardian.data,
      driver: driver.data,
      consents: consents.data,
      emergency_contacts: emergencyContacts.data || [],
      background_check: bgCheck.data,
      hours_purpose: hoursPurpose.data,
      hours_log: hoursLog.data || [],
      accommodations: accommodations.data,
      minor_id: minorId.data,
      availability: availability.data,
      languages: languages.data || [],
      notes: notes.data || [],
      audit_log: auditLogData.data || [],
      verification_letters: letters.data || [],
    });
  }

  // Token validation for onboarding form
  if (!token) {
    return NextResponse.json({ error: 'Token required' }, { status: 400 });
  }

  const { data: vol, error } = await supabase
    .from('volunteers')
    .select('id, status, first_name, invite_email, email')
    .eq('invite_token', token)
    .single();

  if (error || !vol) {
    return NextResponse.json({ error: 'Invalid or expired invite link.' }, { status: 404 });
  }

  if (vol.status === 'submitted' || vol.status === 'active') {
    return NextResponse.json({ error: 'already_submitted', message: 'This onboarding form has already been submitted.' }, { status: 409 });
  }

  // Fetch roles for the form
  const { data: roles } = await supabase
    .from('volunteer_roles')
    .select('*')
    .eq('active', true)
    .order('key');

  return NextResponse.json({
    volunteer_id: vol.id,
    status: vol.status,
    first_name: vol.first_name,
    invite_email: vol.invite_email || vol.email,
    roles: roles || [],
  });
}

// POST — invite, submit onboarding, admin actions
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

    const normalizedEmail = email.trim().toLowerCase();

    const { data: existing } = await supabase
      .from('volunteers')
      .select('id')
      .eq('invite_email', normalizedEmail)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'This email has already been invited.' }, { status: 409 });
    }

    const { data, error } = await supabase
      .from('volunteers')
      .insert({
        invite_email: normalizedEmail,
        email: normalizedEmail,
        first_name: first_name?.trim() || null,
        status: 'invited',
        invited_at: new Date().toISOString(),
        invited_by: invited_by || null,
      })
      .select('id, invite_token, invite_email, first_name')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await auditLog(supabase, data.id, 'INVITED', invited_by, { email: normalizedEmail });

    return NextResponse.json({ invite: data });
  }

  // ============ SUBMIT ONBOARDING ============
  if (action === 'submit_onboarding') {
    const {
      volunteer_id, personal, emergency_contact, role_preferences, guardian,
      driver, hours_purpose, consents, accommodations, availability, languages,
    } = body;

    if (!volunteer_id) {
      return NextResponse.json({ error: 'volunteer_id is required' }, { status: 400 });
    }
    if (!personal?.first_name?.trim() || !personal?.last_name?.trim() || !personal?.email?.trim() || !personal?.phone?.trim()) {
      return NextResponse.json({ error: 'First name, last name, email, and phone are required' }, { status: 400 });
    }
    if (!personal?.date_of_birth) {
      return NextResponse.json({ error: 'Date of birth is required' }, { status: 400 });
    }
    if (!emergency_contact?.name?.trim() || !emergency_contact?.phone?.trim()) {
      return NextResponse.json({ error: 'Emergency contact name and phone are required' }, { status: 400 });
    }
    if (!role_preferences?.length) {
      return NextResponse.json({ error: 'At least one role preference is required' }, { status: 400 });
    }

    // Derive minor status
    const dob = new Date(personal.date_of_birth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    const isMinor = age < 18;

    // Court-ordered flag
    const courtOrdered = hours_purpose?.purpose === 'court_ordered';

    try {
      // 1. Update volunteer record
      const { error: volErr } = await supabase
        .from('volunteers')
        .update({
          first_name: personal.first_name.trim(),
          last_name: personal.last_name.trim(),
          email: personal.email.trim().toLowerCase(),
          phone: personal.phone.trim(),
          date_of_birth: personal.date_of_birth,
          is_minor: isMinor,
          is_youth: isMinor,
          court_ordered: courtOrdered,
          tshirt_size: personal.tshirt_size || null,
          why_volunteering: personal.why_volunteering?.trim() || null,
          status: 'submitted',
        })
        .eq('id', volunteer_id);
      if (volErr) throw volErr;

      // 2. Emergency contact
      await supabase.from('volunteer_emergency_contacts').insert({
        volunteer_id,
        name: emergency_contact.name.trim(),
        relationship: emergency_contact.relationship?.trim() || null,
        phone: emergency_contact.phone.trim(),
      });

      // 3. Role preferences → preferences + initial assignments
      const { data: allRoles } = await supabase.from('volunteer_roles').select('*').eq('active', true);
      const roleMap = Object.fromEntries((allRoles || []).map(r => [r.key, r]));

      for (const roleKey of role_preferences) {
        const role = roleMap[roleKey];
        if (!role) continue;

        // Skip roles minors can't have
        if (isMinor && !role.allows_minors) continue;

        await supabase.from('volunteer_role_preferences').insert({ volunteer_id, role_key: roleKey });

        // Determine initial eligibility
        let eligibility = 'pending';
        let reason = null;

        if (role.requires_background_check) {
          reason = 'Background check required';
        } else if (role.requires_driver_verification) {
          reason = 'Driver verification required';
        } else if (isMinor) {
          reason = 'Awaiting guardian consent';
        } else {
          eligibility = 'eligible';
        }

        await supabase.from('volunteer_role_assignments').insert({
          volunteer_id,
          role_key: roleKey,
          eligibility_status: eligibility,
          reason,
        });
      }

      // 4. Hours purpose
      if (hours_purpose?.purpose && hours_purpose.purpose !== 'none') {
        await supabase.from('volunteer_hours_purpose').insert({
          volunteer_id,
          purpose: hours_purpose.purpose,
          target_hours: hours_purpose.target_hours || null,
          institution_name: hours_purpose.institution_name?.trim() || null,
          documentation_required: hours_purpose.documentation_required || false,
        });
      }

      // 5. Guardian (minor branch) — sends consent email
      let guardianConsentToken = null;
      if (isMinor && guardian) {
        const { data: gData } = await supabase.from('volunteer_guardian').insert({
          volunteer_id,
          guardian_name: guardian.guardian_name.trim(),
          guardian_relationship: guardian.guardian_relationship.trim(),
          guardian_email: guardian.guardian_email.trim().toLowerCase(),
          guardian_phone: guardian.guardian_phone.trim(),
        }).select('consent_token').single();
        guardianConsentToken = gData?.consent_token;

        await supabase.from('volunteer_minor_id').insert({
          volunteer_id,
          school_id_status: 'pending',
        });
      }

      // 6. Driver verification
      if (driver?.nj_licensed !== undefined) {
        const driverRow = {
          volunteer_id,
          nj_licensed: driver.nj_licensed,
          has_valid_insurance: driver.has_valid_insurance || false,
        };
        if (!driver.nj_licensed) {
          driverRow.driving_restriction_reason = 'no_nj_license';
          // Remove driving from assignments
          await supabase.from('volunteer_role_assignments')
            .update({ eligibility_status: 'denied', reason: 'No NJ license' })
            .eq('volunteer_id', volunteer_id)
            .eq('role_key', 'driving');
        }
        await supabase.from('volunteer_driver_verification').insert(driverRow);
      }

      // 7. Consents
      if (consents) {
        await supabase.from('volunteer_consents').insert({
          volunteer_id,
          liability_waiver: consents.liability_waiver || false,
          waiver_at: consents.liability_waiver ? new Date().toISOString() : null,
          code_of_conduct: consents.code_of_conduct || false,
          food_safety_ack: consents.food_safety_ack || false,
          media_consent: consents.media_consent || false,
          background_check_consent: consents.background_check_consent || false,
          bg_consent_at: consents.background_check_consent ? new Date().toISOString() : null,
        });
      }

      // 8. Accommodations
      if (accommodations?.food_allergies?.trim() || accommodations?.accommodations_needed?.trim()) {
        await supabase.from('volunteer_accommodations').insert({
          volunteer_id,
          food_allergies: accommodations.food_allergies?.trim() || null,
          accommodations_needed: accommodations.accommodations_needed?.trim() || null,
        });
      }

      // 9. Availability
      if (availability) {
        await supabase.from('volunteer_availability').insert({
          volunteer_id,
          weekdays: availability.weekdays || [],
          preferred_times: availability.preferred_times || [],
          max_hours_per_month: availability.max_hours_per_month || null,
          transportation: availability.transportation || null,
        });
      }

      // 10. Languages
      if (languages?.length) {
        for (const lang of languages) {
          if (lang.language?.trim()) {
            await supabase.from('volunteer_languages').insert({
              volunteer_id,
              language: lang.language.trim(),
              proficiency: lang.proficiency || 'basic',
            });
          }
        }
      }

      // 11. Background check record if any role requires it
      const needsBgCheck = role_preferences.some(rk => roleMap[rk]?.requires_background_check);
      if (needsBgCheck) {
        await supabase.from('volunteer_background_check').insert({
          volunteer_id,
          required: true,
          method: 'commercial_interim',
        });
      }

      await auditLog(supabase, volunteer_id, 'ONBOARDING_SUBMITTED', null, {
        is_minor: isMinor,
        court_ordered: courtOrdered,
        role_preferences,
        needs_bg_check: needsBgCheck,
      });

      return NextResponse.json({
        success: true,
        is_minor: isMinor,
        guardian_consent_token: guardianConsentToken,
      });
    } catch (err) {
      console.error('[Volunteer Onboard] Error:', err);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  // ============ ADMIN: UPDATE STATUS ============
  if (action === 'update_status') {
    const { volunteer_id, status, performed_by } = body;
    const validStatuses = ['invited', 'in_progress', 'submitted', 'active', 'needs_info'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const { error } = await supabase
      .from('volunteers')
      .update({ status })
      .eq('id', volunteer_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await auditLog(supabase, volunteer_id, `STATUS_CHANGED_TO_${status.toUpperCase()}`, performed_by);
    return NextResponse.json({ success: true });
  }

  // ============ ADMIN: UPDATE ROLE ELIGIBILITY ============
  if (action === 'update_role_eligibility') {
    const { volunteer_id, role_key, eligibility_status, reason, approved_by } = body;
    const valid = ['pending', 'eligible', 'restricted', 'denied'];
    if (!valid.includes(eligibility_status)) {
      return NextResponse.json({ error: 'Invalid eligibility status' }, { status: 400 });
    }

    const updates = { eligibility_status, reason: reason || null };
    if (eligibility_status === 'eligible') {
      updates.approved_by = approved_by || null;
      updates.approved_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('volunteer_role_assignments')
      .update(updates)
      .eq('volunteer_id', volunteer_id)
      .eq('role_key', role_key);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await auditLog(supabase, volunteer_id, 'ROLE_ELIGIBILITY_UPDATED', approved_by, {
      role_key, eligibility_status, reason,
    });
    return NextResponse.json({ success: true });
  }

  // ============ ADMIN: UPDATE BACKGROUND CHECK ============
  if (action === 'update_bg_check') {
    const { volunteer_id, chri_status, sor_status, cari_status, method, reviewed_by } = body;
    const updates = {};
    if (chri_status) updates.chri_status = chri_status;
    if (sor_status) updates.sor_status = sor_status;
    if (cari_status) updates.cari_status = cari_status;
    if (method) updates.method = method;

    const allCleared = (chri_status || 'pending') === 'cleared'
      && (sor_status || 'pending') === 'cleared'
      && (cari_status || 'pending') === 'cleared';

    if (allCleared) {
      updates.cleared = true;
      updates.checked_at = new Date().toISOString();
      const recheckDate = new Date();
      recheckDate.setFullYear(recheckDate.getFullYear() + 2);
      updates.recheck_due = recheckDate.toISOString().split('T')[0];
    }

    const { error } = await supabase
      .from('volunteer_background_check')
      .update(updates)
      .eq('volunteer_id', volunteer_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const actionName = allCleared ? 'BACKGROUND_CHECK_CLEARED' : 'BACKGROUND_CHECK_UPDATED';
    await auditLog(supabase, volunteer_id, actionName, reviewed_by, updates);

    // If cleared, auto-upgrade child-access role assignments from pending to eligible
    if (allCleared) {
      await supabase.from('volunteer_role_assignments')
        .update({ eligibility_status: 'eligible', reason: 'Background check cleared', approved_at: new Date().toISOString() })
        .eq('volunteer_id', volunteer_id)
        .eq('eligibility_status', 'pending')
        .in('role_key', ['driving']);
    }

    return NextResponse.json({ success: true, cleared: allCleared });
  }

  // ============ ADMIN: UPDATE DRIVER VERIFICATION ============
  if (action === 'update_driver_verification') {
    const { volunteer_id, performed_by, ...fields } = body;
    delete fields.action;
    const { error } = await supabase
      .from('volunteer_driver_verification')
      .update(fields)
      .eq('volunteer_id', volunteer_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await auditLog(supabase, volunteer_id, 'DRIVER_VERIFICATION_UPDATED', performed_by, fields);
    return NextResponse.json({ success: true });
  }

  // ============ ADMIN: ADD NOTE ============
  if (action === 'add_note') {
    const { volunteer_id, note, created_by } = body;
    if (!note?.trim()) return NextResponse.json({ error: 'Note is required' }, { status: 400 });

    const { data, error } = await supabase
      .from('volunteer_notes')
      .insert({ volunteer_id, note: note.trim(), created_by: created_by || null })
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ note: data });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
