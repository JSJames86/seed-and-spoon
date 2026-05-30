import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function getRequestUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(list) {
          try { list.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {}
        },
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function GET() {
  const { data, error } = await serviceClient()
    .from("campaigns")
    .select("*")
    .eq("status", "active")
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, data });
}

export async function POST(request) {
  const user = await getRequestUser();
  if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const service = serviceClient();
  const { data: profile } = await service
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const {
    slug, title, description, campaign_type, goal_amount,
    start_date, end_date, is_featured, is_matching,
    matching_sponsor, matching_amount,
    impact_metric_label, impact_metric_value, impact_metric_amount,
    organization_name,
  } = body;

  if (!slug || !title || !goal_amount || !start_date) {
    return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
  }

  const { data, error } = await service
    .from("campaigns")
    .insert({
      slug, title, description, campaign_type, goal_amount,
      start_date, end_date: end_date || null,
      is_featured: !!is_featured, is_matching: !!is_matching,
      matching_sponsor: matching_sponsor || null,
      matching_amount: matching_amount || null,
      impact_metric_label: impact_metric_label || null,
      impact_metric_value: impact_metric_value || null,
      impact_metric_amount: impact_metric_amount || null,
      organization_name: organization_name || "Seed & Spoon NJ",
      created_by: user.id,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, data }, { status: 201 });
}
