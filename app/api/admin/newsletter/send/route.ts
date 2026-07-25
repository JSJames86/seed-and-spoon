import { NextRequest, NextResponse } from "next/server";
import { resend, AUDIENCE_ID, NEWSLETTER_FROM } from "@/lib/resend";
import Newsletter, { type NewsletterProps } from "@/emails/Newsletter";

/**
 * POST /api/admin/newsletter/send
 *
 * Body = the newsletter content for this issue (matches NewsletterProps) plus a
 * couple of send options. Creates the Broadcast against your Audience and,
 * unless you pass draft:true, sends it in one call.
 *
 * The Node SDK lets you pass the React component directly as `react` — Resend
 * renders it server-side, so you never ship raw HTML.
 *
 *   curl -X POST https://backend.vercel.app/api/admin/newsletter/send \
 *     -H "Authorization: Bearer $ADMIN_SERVICE_TOKEN" \
 *     -H "Content-Type: application/json" \
 *     -d '{
 *           "subject": "November at Seed & Spoon",
 *           "name": "nov-2026-issue",
 *           "content": { "previewText": "...", "headline": "...",
 *                        "intro": "...", "stories": [ ... ] },
 *           "scheduledAt": "in 1 hour"   // optional; omit to send now
 *         }'
 */

interface SendBody {
  subject: string;
  name: string; // internal reference only, e.g. "nov-2026-issue"
  content: NewsletterProps;
  scheduledAt?: string; // ISO 8601 or natural language ("tomorrow at 9am")
  draft?: boolean; // true = create but don't send, review in dashboard first
}

function authorized(req: NextRequest): boolean {
  const header = req.headers.get("authorization") ?? "";
  const token = header.replace(/^Bearer\s+/i, "");
  return Boolean(token) && token === process.env.ADMIN_SERVICE_TOKEN;
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: SendBody;
  try {
    payload = (await req.json()) as SendBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { subject, name, content, scheduledAt, draft } = payload;

  if (!subject || !name || !content) {
    return NextResponse.json(
      { error: "subject, name, and content are required" },
      { status: 400 }
    );
  }

  const { data, error } = await resend.broadcasts.create({
    audienceId: AUDIENCE_ID,
    from: NEWSLETTER_FROM,
    subject,
    name,
    react: Newsletter(content),
    // send + scheduledAt are honored together: schedule if a time is given,
    // send now if not. draft:true overrides both and leaves it unsent.
    ...(draft
      ? { send: false as const }
      : { send: true as const, ...(scheduledAt ? { scheduledAt } : {}) }),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    broadcastId: data?.id,
    status: draft ? "draft" : scheduledAt ? "scheduled" : "sending",
  });
}
