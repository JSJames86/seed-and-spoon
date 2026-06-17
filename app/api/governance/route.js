import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getSupabase() {
  if (!supabaseUrl || !supabaseServiceKey) return null;
  return createClient(supabaseUrl, supabaseServiceKey);
}

// POST: create assessment cycle or issue invites
export async function POST(request) {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const data = await request.json();

    // Create a new assessment cycle
    if (data.action === 'create_cycle') {
      if (!data.title?.trim()) {
        return NextResponse.json({ error: 'Title is required' }, { status: 400 });
      }

      const { data: cycle, error } = await supabase
        .from('assessments')
        .insert([{
          title: data.title.trim(),
          status: data.status || 'draft',
          opened_at: data.status === 'open' ? new Date().toISOString() : null,
          closes_at: data.closes_at || null,
        }])
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, assessment: cycle }, { status: 201 });
    }

    // Update cycle status
    if (data.action === 'update_status') {
      if (!data.assessment_id || !data.status) {
        return NextResponse.json({ error: 'assessment_id and status required' }, { status: 400 });
      }

      const updates = { status: data.status };
      if (data.status === 'open' && !data.keep_dates) updates.opened_at = new Date().toISOString();
      if (data.status === 'closed') updates.closes_at = new Date().toISOString();

      const { error } = await supabase
        .from('assessments')
        .update(updates)
        .eq('id', data.assessment_id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    // Issue invites to board members
    if (data.action === 'issue_invites') {
      if (!data.assessment_id || !Array.isArray(data.members) || data.members.length === 0) {
        return NextResponse.json({ error: 'assessment_id and members[] required' }, { status: 400 });
      }

      const rows = data.members.map(m => ({
        assessment_id: data.assessment_id,
        board_member_id: m.id,
        board_member_name: m.name || null,
        board_member_email: m.email || null,
      }));

      const { data: invites, error } = await supabase
        .from('assessment_invites')
        .upsert(rows, { onConflict: 'assessment_id,board_member_id' })
        .select('id, respondent_token, board_member_name, board_member_email');

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, invites }, { status: 201 });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });

  } catch (err) {
    console.error('[Governance API] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET: list assessments or get results
export async function GET(request) {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const assessmentId = searchParams.get('assessment_id');

    // Get single assessment with results
    if (assessmentId) {
      const [
        { data: assessment },
        { data: results },
        { data: participation },
        { data: texts },
      ] = await Promise.all([
        supabase.from('assessments').select('*').eq('id', assessmentId).single(),
        supabase.from('assessment_statement_results').select('*').eq('assessment_id', assessmentId),
        supabase.from('assessment_participation').select('*').eq('assessment_id', assessmentId).single(),
        supabase.from('assessment_texts')
          .select('prompt_id, body')
          .in('response_id',
            supabase.from('assessment_responses').select('id').eq('assessment_id', assessmentId)
          ),
      ]);

      // Fetch texts via a separate query since nested selects don't work well
      const { data: responses } = await supabase
        .from('assessment_responses')
        .select('id')
        .eq('assessment_id', assessmentId);

      let allTexts = [];
      if (responses && responses.length > 0) {
        const responseIds = responses.map(r => r.id);
        const { data: textData } = await supabase
          .from('assessment_texts')
          .select('prompt_id, body')
          .in('response_id', responseIds);
        allTexts = textData || [];
      }

      return NextResponse.json({
        assessment,
        results: results || [],
        participation: participation || { invited: 0, submitted: 0 },
        texts: allTexts,
      });
    }

    // List all assessments with participation counts
    const { data: assessments, error } = await supabase
      .from('assessments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: participationData } = await supabase
      .from('assessment_participation')
      .select('*');

    const participationMap = {};
    for (const p of (participationData || [])) {
      participationMap[p.assessment_id] = p;
    }

    const enriched = (assessments || []).map(a => ({
      ...a,
      participation: participationMap[a.id] || { invited: 0, submitted: 0 },
    }));

    return NextResponse.json({ assessments: enriched });

  } catch (err) {
    console.error('[Governance API] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
