import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase-server";
import { sendTransactional, FROM } from "@/lib/email";
import Welcome from "@/emails/Welcome";

/**
 * POST /api/subscribe   (public — your newsletter signup form posts here)
 * Body: { email, firstName? }
 *
 * Adds the subscriber to Supabase (source of truth) and sends the welcome.
 * Upserts on email so a repeat signup doesn't error or double-send storage.
 *
 * NOTE: this is a single opt-in. When you build the double opt-in flow, this
 * becomes "save as unconfirmed + send confirm link," and Welcome fires only
 * after they confirm.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  let body: { email?: string; firstName?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const firstName = body.firstName?.trim() || null;

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }

  const supabase = createServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  // Table: email_subscribers (email unique) -- the same table
  // app/api/email/subscribe and /unsubscribe read and write.
  const { error: dbError } = await supabase
    .from("email_subscribers")
    .upsert(
      { email, first_name: firstName, segment: "general", source: "api", status: "subscribed", subscribed_at: new Date().toISOString() },
      { onConflict: "email", ignoreDuplicates: false }
    );

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  // Don't fail the signup if the welcome email hiccups — they're subscribed.
  try {
    await sendTransactional({
      type: "welcome",
      to: email,
      subject: "Welcome to Seed & Spoon",
      from: FROM.hello,
      react: Welcome({ firstName: firstName ?? undefined }),
    });
  } catch (err) {
    console.error("welcome email failed:", err);
  }

  return NextResponse.json({ ok: true });
}
