import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function GET(request, { params }) {
  const { slug } = await params;

  const { data, error } = await serviceClient()
    .from("campaigns")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    return NextResponse.json({ ok: false, error: "Campaign not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, data });
}
