import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase-server";
import { sendTransactional, FROM } from "@/lib/email";
import ApplicationDecision from "@/emails/ApplicationDecision";

/**
 * POST /api/admin/applications/decision
 *
 * Row-driven: give it an applicationId and a decision. It looks up the
 * applicant, moves the row from "received" to the decision outcome, then emails
 * the person on file. The row is the source of truth — we update it FIRST, so
 * if the email hiccups the decision is still recorded and you can resend.
 *
 * Service-token protected, same pattern as your other admin routes.
 *
 * Body:
 *   {
 *     "applicationId": "uuid",              // required
 *     "decision": "accepted" | "declined_medical" | "declined_capacity" | "waitlist",
 *     "decidedBy": "Janelle",               // optional, recorded on the row
 *     "notes": "internal note",             // optional, decision_notes (NOT emailed)
 *     "coordinatorName": "Janelle",         // optional, shown in the email
 *     "coordinatorEmail": "5loaves@seedandspoon.org"  // optional, shown in the email
 *   }
 */

const VALID = ["accepted", "declined_medical", "declined_capacity", "waitlist"] as const;
type Decision = (typeof VALID)[number];

function authorized(req: NextRequest): boolean {
  const token = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  return Boolean(token) && token === process.env.ADMIN_SERVICE_TOKEN;
}

function subjectFor(decision: Decision): string {
  if (decision === "accepted") return "Your family has a spot in 5 Loaves";
  if (decision === "waitlist") return "You're on the 5 Loaves waitlist";
  return "About your 5 Loaves application";
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    applicationId?: string;
    decision?: Decision;
    decidedBy?: string;
    notes?: string;
    coordinatorName?: string;
    coordinatorEmail?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { applicationId, decision, decidedBy, notes, coordinatorName, coordinatorEmail } = body;

  if (!applicationId) {
    return NextResponse.json({ error: "applicationId is required" }, { status: 400 });
  }
  if (!decision || !VALID.includes(decision)) {
    return NextResponse.json(
      { error: `decision must be one of: ${VALID.join(", ")}` },
      { status: 400 }
    );
  }

  const supabase = createServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  // 1. Look up the applicant.
  const { data: application, error: fetchError } = await supabase
    .from("applications")
    .select("id, email, first_name, status")
    .eq("id", applicationId)
    .single();

  if (fetchError || !application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  const previousStatus = application.status;

  // 2. Move the row FIRST — the decision of record.
  const { error: updateError } = await supabase
    .from("applications")
    .update({
      status: decision,
      decided_at: new Date().toISOString(),
      decided_by: decidedBy ?? null,
      decision_notes: notes ?? null,
    })
    .eq("id", applicationId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // 3. Notify the applicant. If this fails, the decision is already recorded —
  // report it so you can resend rather than silently losing the notification.
  try {
    const result = await sendTransactional({
      type: "application_decision",
      to: application.email,
      subject: subjectFor(decision),
      from: FROM.program,
      react: ApplicationDecision({
        status: decision,
        firstName: application.first_name ?? undefined,
        coordinatorName,
        coordinatorEmail,
      }),
      metadata: { decision, application_id: applicationId, previous_status: previousStatus },
    });

    return NextResponse.json({
      ok: true,
      applicationId,
      decision,
      previousStatus,
      emailId: result?.id,
      emailSent: true,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "send failed";
    // 207: the row moved but the email didn't go out.
    return NextResponse.json(
      {
        ok: true,
        applicationId,
        decision,
        previousStatus,
        emailSent: false,
        emailError: msg,
        note: "Decision recorded, but the email failed. Safe to retry the send.",
      },
      { status: 207 }
    );
  }
}
