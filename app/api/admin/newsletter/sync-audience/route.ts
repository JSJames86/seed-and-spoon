import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { resend, AUDIENCE_ID } from "@/lib/resend";

/**
 * POST /api/admin/newsletter/sync-audience
 *
 * Pulls your subscriber list out of Supabase (the source of truth) and pushes
 * it into the Resend Audience that Broadcasts send against. Idempotent: safe to
 * run before every send. Contacts already in the audience are skipped.
 *
 * Protected by the same ADMIN_SERVICE_TOKEN pattern as the rest of your admin
 * API — no public exposure.
 *
 *   curl -X POST https://backend.vercel.app/api/admin/newsletter/sync-audience \
 *     -H "Authorization: Bearer $ADMIN_SERVICE_TOKEN"
 */

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function authorized(req: NextRequest): boolean {
  const header = req.headers.get("authorization") ?? "";
  const token = header.replace(/^Bearer\s+/i, "");
  return Boolean(token) && token === process.env.ADMIN_SERVICE_TOKEN;
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // email_subscribers is the table app/api/email/subscribe and /unsubscribe
  // read and write. Columns: email (text), first_name (text, nullable),
  // status (text: 'subscribed' | 'unsubscribed').
  const { data: subscribers, error } = await supabase
    .from("email_subscribers")
    .select("email, first_name, status")
    .eq("status", "subscribed");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const results = { added: 0, skipped: 0, failed: 0 };
  const failures: { email: string; reason: string }[] = [];

  for (const sub of subscribers ?? []) {
    try {
      const { error: contactError } = await resend.contacts.create({
        audienceId: AUDIENCE_ID,
        email: sub.email,
        firstName: sub.first_name ?? undefined,
        unsubscribed: false,
      });

      if (contactError) {
        // Resend returns an error (not a throw) when the contact already exists.
        results.skipped++;
      } else {
        results.added++;
      }
    } catch (e) {
      results.failed++;
      failures.push({
        email: sub.email,
        reason: e instanceof Error ? e.message : "unknown",
      });
    }
  }

  return NextResponse.json({
    ok: true,
    total: subscribers?.length ?? 0,
    ...results,
    failures,
  });
}
