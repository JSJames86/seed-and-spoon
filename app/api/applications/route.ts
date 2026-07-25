import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase-server";
import { sendTransactional, FROM } from "@/lib/email";
import ApplicationReceived from "@/emails/ApplicationReceived";

/**
 * POST /api/applications   (public — your 5 Loaves application form posts here)
 * Body: {
 *   email, firstName?, lastName?, phone?,
 *   householdSize?, allergies?, medicalNeeds?, notes?
 * }
 *
 * Records the application (status "received") and immediately sends the
 * acknowledgment so the family isn't left in silence. The decision comes later
 * from the admin route.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  let body: {
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    householdSize?: number;
    allergies?: string;
    medicalNeeds?: string;
    notes?: string;
  };
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

  // Table: applications (supabase/migrations/20260725100001_create_applications.sql).
  // The allergy/medical fields are what the reviewer uses to make a safe decision later.
  const { data, error: dbError } = await supabase
    .from("applications")
    .insert({
      email,
      first_name: firstName,
      last_name: body.lastName?.trim() || null,
      phone: body.phone?.trim() || null,
      household_size: body.householdSize ?? null,
      allergies: body.allergies?.trim() || null,
      medical_needs: body.medicalNeeds?.trim() || null,
      notes: body.notes?.trim() || null,
      status: "received",
    })
    .select("id")
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  try {
    await sendTransactional({
      type: "application_received",
      to: email,
      subject: "We received your 5 Loaves application",
      from: FROM.program,
      react: ApplicationReceived({
        firstName: firstName ?? undefined,
        coordinatorEmail: "5loaves@seedandspoon.org",
      }),
      metadata: { application_id: data?.id },
    });
  } catch (err) {
    console.error("application received email failed:", err);
  }

  return NextResponse.json({ ok: true, applicationId: data?.id });
}
