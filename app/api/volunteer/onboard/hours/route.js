import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey);
}

// GET — hours summary for a volunteer or all
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const volunteerId = searchParams.get('volunteer_id');
  const supabase = getSupabase();

  let query = supabase.from('volunteer_hours_summary').select('*');
  if (volunteerId) {
    query = query.eq('volunteer_id', volunteerId);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ hours: data });
}

// POST — log hours or request verification letter
export async function POST(request) {
  const body = await request.json();
  const { action } = body;
  const supabase = getSupabase();

  if (action === 'log_hours') {
    const { hours_log_id, hours_to_add } = body;
    if (!hours_log_id || !hours_to_add || hours_to_add <= 0) {
      return NextResponse.json({ error: 'Valid hours_log_id and positive hours_to_add required' }, { status: 400 });
    }

    const { data: existing, error: fetchErr } = await supabase
      .from('volunteer_hours_log')
      .select('hours_logged')
      .eq('id', hours_log_id)
      .single();

    if (fetchErr) return NextResponse.json({ error: 'Hours record not found' }, { status: 404 });

    const newTotal = parseFloat(existing.hours_logged || 0) + parseFloat(hours_to_add);
    const { error } = await supabase
      .from('volunteer_hours_log')
      .update({ hours_logged: newTotal })
      .eq('id', hours_log_id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, hours_logged: newTotal });
  }

  if (action === 'mark_letter_sent') {
    const { hours_log_id } = body;
    const { error } = await supabase
      .from('volunteer_hours_log')
      .update({ verification_letter_sent_at: new Date().toISOString() })
      .eq('id', hours_log_id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'create_hours_record') {
    const { volunteer_id, purpose, hours_needed, due_date, institution_name, supervisor_name, supervisor_contact } = body;
    if (!volunteer_id || !purpose) {
      return NextResponse.json({ error: 'volunteer_id and purpose required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('volunteer_hours_log')
      .insert({
        volunteer_id,
        purpose,
        hours_needed: hours_needed || null,
        due_date: due_date || null,
        institution_name: institution_name?.trim() || null,
        supervisor_name: supervisor_name?.trim() || null,
        supervisor_contact: supervisor_contact?.trim() || null,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ hours_record: data });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
