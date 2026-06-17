import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getSupabase() {
  if (!supabaseUrl || !supabaseServiceKey) return null;
  return createClient(supabaseUrl, supabaseServiceKey);
}

// GET: validate token + load assessment data for the respondent
export async function GET(request) {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 });
    }

    // Look up invite by token (service_role only — enforces anonymity boundary)
    const { data: invite, error: inviteErr } = await supabase
      .from('assessment_invites')
      .select('id, assessment_id, respondent_token, submitted_at')
      .eq('respondent_token', token)
      .single();

    if (inviteErr || !invite) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 404 });
    }

    if (invite.submitted_at) {
      return NextResponse.json({ error: 'already_submitted', message: 'This assessment has already been submitted.' }, { status: 409 });
    }

    // Load the assessment
    const { data: assessment } = await supabase
      .from('assessments')
      .select('id, title, status, closes_at')
      .eq('id', invite.assessment_id)
      .single();

    if (!assessment || assessment.status !== 'open') {
      return NextResponse.json({ error: 'This assessment is not currently open.' }, { status: 403 });
    }

    if (assessment.closes_at && new Date(assessment.closes_at) < new Date()) {
      return NextResponse.json({ error: 'This assessment has closed.' }, { status: 403 });
    }

    return NextResponse.json({
      assessment_id: assessment.id,
      title: assessment.title,
      respondent_token: invite.respondent_token,
    });

  } catch (err) {
    console.error('[Governance Assess API] GET Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: submit assessment response
export async function POST(request) {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const data = await request.json();

    if (!data.respondent_token || !data.assessment_id) {
      return NextResponse.json({ error: 'respondent_token and assessment_id required' }, { status: 400 });
    }

    // Validate token
    const { data: invite } = await supabase
      .from('assessment_invites')
      .select('id, assessment_id, submitted_at')
      .eq('respondent_token', data.respondent_token)
      .eq('assessment_id', data.assessment_id)
      .single();

    if (!invite) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 404 });
    }

    if (invite.submitted_at) {
      return NextResponse.json({ error: 'Already submitted' }, { status: 409 });
    }

    // Validate assessment is open
    const { data: assessment } = await supabase
      .from('assessments')
      .select('status, closes_at')
      .eq('id', data.assessment_id)
      .single();

    if (!assessment || assessment.status !== 'open') {
      return NextResponse.json({ error: 'Assessment not open' }, { status: 403 });
    }

    // 1. Create response (keyed by token only — no board_member_id)
    const { data: response, error: respErr } = await supabase
      .from('assessment_responses')
      .insert([{
        assessment_id: data.assessment_id,
        respondent_token: data.respondent_token,
      }])
      .select()
      .single();

    if (respErr) {
      return NextResponse.json({ error: respErr.message }, { status: 500 });
    }

    // 2. Insert ratings
    if (Array.isArray(data.ratings) && data.ratings.length > 0) {
      const ratingRows = data.ratings.map(r => ({
        response_id: response.id,
        domain_key: r.domain_key,
        statement_id: r.statement_id,
        rating: r.rating,
      }));

      const { error: ratErr } = await supabase
        .from('assessment_ratings')
        .insert(ratingRows);

      if (ratErr) {
        console.error('[Governance Assess API] Ratings insert error:', ratErr);
        return NextResponse.json({ error: ratErr.message }, { status: 500 });
      }
    }

    // 3. Insert text reflections
    if (Array.isArray(data.texts) && data.texts.length > 0) {
      const textRows = data.texts
        .filter(t => t.body?.trim())
        .map(t => ({
          response_id: response.id,
          prompt_id: t.prompt_id,
          body: t.body.trim(),
        }));

      if (textRows.length > 0) {
        const { error: txtErr } = await supabase
          .from('assessment_texts')
          .insert(textRows);

        if (txtErr) {
          console.error('[Governance Assess API] Texts insert error:', txtErr);
        }
      }
    }

    // 4. Mark invite as submitted (identity side — never joins to response)
    await supabase
      .from('assessment_invites')
      .update({ submitted_at: new Date().toISOString() })
      .eq('id', invite.id);

    return NextResponse.json({ success: true, message: 'Assessment submitted. Thank you.' }, { status: 201 });

  } catch (err) {
    console.error('[Governance Assess API] POST Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
