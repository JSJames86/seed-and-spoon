import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase-server";
import { sendTransactional, FROM } from "@/lib/email";
import VolunteerWelcome from "@/emails/VolunteerWelcome";

/**
 * POST /api/volunteer   (public — your volunteer signup form posts here)
 * Body: { email, firstName?, lastName?, phone?, interests? }
 *
 * Records the volunteer and sends the thank-you + next-steps email.
 *
 * This is a lightweight interest-form submission, distinct from the full
 * background-check/consent onboarding pipeline in app/api/volunteer/onboard
 * (the `volunteers` table there is invite-token gated and safety-critical --
 * not a place for a bare public-form insert). Shares the volunteer_applications
 * table with the older app/api/email/volunteer route and the admin approval
 * view at app/api/admin/volunteers, so submissions from either endpoint show
 * up in the same place for staff.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  let body: {
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    interests?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const firstName = body.firstName?.trim() || null;
  const lastName = body.lastName?.trim() || null;
  const name = [firstName, lastName].filter(Boolean).join(" ") || null;

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }

  const supabase = createServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const { error: dbError } = await supabase.from("volunteer_applications").insert({
    name,
    email,
    first_name: firstName,
    last_name: lastName,
    phone: body.phone?.trim() || null,
    interests: body.interests?.trim() || null,
    status: "pending",
  });

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  try {
    await sendTransactional({
      type: "volunteer_welcome",
      to: email,
      subject: "Thanks for signing up to volunteer",
      from: FROM.volunteer,
      react: VolunteerWelcome({
        firstName: firstName ?? undefined,
        coordinatorEmail: "volunteer@seedandspoon.org",
      }),
    });
  } catch (err) {
    console.error("volunteer welcome email failed:", err);
  }

  return NextResponse.json({ ok: true });
}
