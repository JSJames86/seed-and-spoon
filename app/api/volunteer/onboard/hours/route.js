import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey);
}

// GET — hours summary
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const volunteerId = searchParams.get('volunteer_id');
  const supabase = getSupabase();

  if (volunteerId) {
    const [hours, purpose, letters] = await Promise.all([
      supabase.from('volunteer_hours_log').select('*').eq('volunteer_id', volunteerId).order('shift_date', { ascending: false }),
      supabase.from('volunteer_hours_purpose').select('*').eq('volunteer_id', volunteerId).maybeSingle(),
      supabase.from('verification_letters').select('*').eq('volunteer_id', volunteerId).order('generated_at', { ascending: false }),
    ]);
    return NextResponse.json({
      hours_log: hours.data || [],
      hours_purpose: purpose.data,
      verification_letters: letters.data || [],
    });
  }

  // Summary for all
  const { data, error } = await supabase.from('volunteer_hours_summary').select('*');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ summary: data });
}

// POST — log hours, verify hours, record verification letter
export async function POST(request) {
  const body = await request.json();
  const { action } = body;
  const supabase = getSupabase();

  // Staff logs a shift
  if (action === 'log_shift') {
    const { volunteer_id, shift_date, hours, role_key } = body;
    if (!volunteer_id || !shift_date || !hours || hours <= 0) {
      return NextResponse.json({ error: 'volunteer_id, shift_date, and positive hours required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('volunteer_hours_log')
      .insert({
        volunteer_id,
        shift_date,
        hours: parseFloat(hours),
        role_key: role_key || null,
      })
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ entry: data });
  }

  // Staff verifies hours
  if (action === 'verify_hours') {
    const { entry_id, verified_by } = body;
    if (!entry_id) return NextResponse.json({ error: 'entry_id required' }, { status: 400 });

    const { data, error } = await supabase
      .from('volunteer_hours_log')
      .update({
        verified_by: verified_by || null,
        verified_at: new Date().toISOString(),
      })
      .eq('id', entry_id)
      .select('volunteer_id, hours')
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await supabase.from('volunteer_audit_log').insert({
      volunteer_id: data.volunteer_id,
      action: 'HOURS_VERIFIED',
      performed_by: verified_by,
      metadata: { entry_id, hours: data.hours },
    });

    return NextResponse.json({ success: true });
  }

  // Record a verification letter
  if (action === 'record_letter') {
    const { volunteer_id, generated_by, recipient, pdf_url } = body;
    if (!volunteer_id || !recipient) {
      return NextResponse.json({ error: 'volunteer_id and recipient required' }, { status: 400 });
    }

    // Calculate total verified hours
    const { data: entries } = await supabase
      .from('volunteer_hours_log')
      .select('hours')
      .eq('volunteer_id', volunteer_id)
      .not('verified_at', 'is', null);

    const totalVerified = (entries || []).reduce((sum, e) => sum + parseFloat(e.hours), 0);

    const { data, error } = await supabase
      .from('verification_letters')
      .insert({
        volunteer_id,
        generated_by: generated_by || null,
        total_verified_hours: totalVerified,
        recipient,
        pdf_url: pdf_url || null,
      })
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await supabase.from('volunteer_audit_log').insert({
      volunteer_id,
      action: 'VERIFICATION_LETTER_ISSUED',
      performed_by: generated_by,
      metadata: { recipient, total_verified_hours: totalVerified, letter_id: data.id },
    });

    return NextResponse.json({ letter: data });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
