import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey);
}

const CONSENT_VERSION = '2026-06-17-v1';

// GET — validate guardian consent token
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const supabase = getSupabase();

  if (!token) {
    return NextResponse.json({ error: 'Consent token required' }, { status: 400 });
  }

  const { data: guardian, error } = await supabase
    .from('volunteer_guardian')
    .select('volunteer_id, guardian_name, consent_given, guardian_consent_at')
    .eq('consent_token', token)
    .single();

  if (error || !guardian) {
    return NextResponse.json({ error: 'Invalid or expired consent link.' }, { status: 404 });
  }

  if (guardian.consent_given) {
    return NextResponse.json({
      error: 'already_consented',
      message: 'Guardian consent has already been given. Thank you!',
      consented_at: guardian.guardian_consent_at,
    }, { status: 409 });
  }

  // Get volunteer info to display
  const { data: volunteer } = await supabase
    .from('volunteers')
    .select('first_name, last_name')
    .eq('id', guardian.volunteer_id)
    .single();

  return NextResponse.json({
    guardian_name: guardian.guardian_name,
    volunteer_name: volunteer ? `${volunteer.first_name} ${volunteer.last_name}` : 'your child',
    consent_version: CONSENT_VERSION,
  });
}

// POST — guardian accepts consent
export async function POST(request) {
  const body = await request.json();
  const { token } = body;
  const supabase = getSupabase();

  if (!token) {
    return NextResponse.json({ error: 'Consent token required' }, { status: 400 });
  }

  const { data: guardian, error: fetchErr } = await supabase
    .from('volunteer_guardian')
    .select('id, volunteer_id, consent_given')
    .eq('consent_token', token)
    .single();

  if (fetchErr || !guardian) {
    return NextResponse.json({ error: 'Invalid consent link.' }, { status: 404 });
  }

  if (guardian.consent_given) {
    return NextResponse.json({ error: 'Consent already given.' }, { status: 409 });
  }

  // Get IP from headers
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';

  const { error } = await supabase
    .from('volunteer_guardian')
    .update({
      consent_given: true,
      guardian_consent_ip: ip,
      guardian_consent_at: new Date().toISOString(),
      guardian_consent_version: CONSENT_VERSION,
    })
    .eq('id', guardian.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Audit log
  await supabase.from('volunteer_audit_log').insert({
    volunteer_id: guardian.volunteer_id,
    action: 'GUARDIAN_CONSENT_VERIFIED',
    metadata: { ip, consent_version: CONSENT_VERSION },
  });

  // Auto-upgrade minor's pending role assignments that only needed guardian consent
  await supabase.from('volunteer_role_assignments')
    .update({ eligibility_status: 'eligible', reason: 'Guardian consent received' })
    .eq('volunteer_id', guardian.volunteer_id)
    .eq('eligibility_status', 'pending')
    .eq('reason', 'Awaiting guardian consent');

  return NextResponse.json({ success: true });
}
