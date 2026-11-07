import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createServiceClient } from "@/lib/supabase-server";
import { checkRateLimit, getClientIp } from "@/lib/api-helpers";
import { REFERRER_ROLES, REFERRAL_UPLOAD } from "@/data/familyIntake";

/**
 * POST /api/referrals  (public — the Partner Referral tab on Get Help posts here)
 *
 * A school administrator, parent advocate, faith leader, or WIC/social service
 * staff member refers a family. The family still completes its own intake;
 * staff match the two by name and phone (family_referrals.application_id).
 *
 * multipart/form-data: payload (JSON string), letter (optional file).
 * Letters are deleted after 30 days by /api/applications/cleanup.
 */

export const runtime = "nodejs";

const BUCKET = "intake-referrals";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DAY_MS = 24 * 60 * 60 * 1000;

const str = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const bad = (message: string, status = 400) => NextResponse.json({ error: message }, { status });

function extFor(type: string) {
  return { "application/pdf": "pdf", "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }[type] ?? "bin";
}

export async function POST(req: NextRequest) {
  if (!checkRateLimit(`family_referral_ip:${getClientIp(req)}`, 20, DAY_MS).allowed) {
    return bad("We’ve received many referrals from this network today. Please email hello@seedandspoon.org.", 429);
  }

  let body: Record<string, unknown>;
  let file: File | null = null;
  try {
    const form = await req.formData();
    body = JSON.parse(String(form.get("payload") ?? "{}"));
    const letter = form.get("letter");
    file = letter && typeof letter !== "string" ? (letter as File) : null;
  } catch {
    return bad("We couldn’t read the form. Please try again.");
  }

  const referrerRole = str(body.referrerRole, 40);
  const referrerName = str(body.referrerName, 120);
  const referrerOrg = str(body.referrerOrg, 160);
  const referrerEmail = str(body.referrerEmail, 200).toLowerCase();
  const referrerPhone = str(body.referrerPhone, 30);
  const familyContactName = str(body.familyContactName, 120);
  const familyPhone = str(body.familyPhone, 30);
  const childrenCount = Number(body.childrenCount);
  const notes = str(body.notes, 2000);

  if (!REFERRER_ROLES.some((r) => r.key === referrerRole)) return bad("Please choose your role.");
  if (!referrerName) return bad("Please enter your name.");
  if (!referrerOrg) return bad("Please enter your school or organization.");
  if (!EMAIL_RE.test(referrerEmail)) return bad("Please enter a valid email so we can confirm the referral.");
  if (!familyContactName) return bad("Please enter the parent or guardian’s name.");
  if (!familyPhone) return bad("Please enter a phone number for the family.");
  if (!Number.isInteger(childrenCount) || childrenCount < 1 || childrenCount > 15) {
    return bad("Please enter how many children are in the family.");
  }
  if (body.familyAgreed !== true) return bad("Please confirm the family agreed to this referral.");

  if (file) {
    if (!REFERRAL_UPLOAD.allowedTypes.includes(file.type)) return bad("Please upload a PDF or a photo (JPG or PNG).");
    if (file.size > REFERRAL_UPLOAD.maxBytes) return bad("That file is too large. Please upload a file under 4 MB.");
  }

  const supabase = createServiceClient();
  if (!supabase) return bad("We’re having trouble right now. Please email hello@seedandspoon.org.", 503);

  const id = randomUUID();
  let letterPath: string | null = null;
  if (file) {
    letterPath = `referrals/${id}/letter.${extFor(file.type)}`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(letterPath, Buffer.from(await file.arrayBuffer()), { contentType: file.type, upsert: false });
    if (uploadError) {
      console.error("[referrals] letter upload failed:", uploadError.message);
      return bad("We couldn’t upload the letter. Please try again.", 500);
    }
  }

  const { error: dbError } = await supabase.from("family_referrals").insert({
    id,
    referrer_role: referrerRole,
    referrer_name: referrerName,
    referrer_org: referrerOrg,
    referrer_email: referrerEmail,
    referrer_phone: referrerPhone || null,
    family_contact_name: familyContactName,
    family_phone: familyPhone,
    children_count: childrenCount,
    letter_path: letterPath,
    family_agreed: true,
    notes: notes || null,
  });

  if (dbError) {
    console.error("[referrals] insert failed:", dbError.message);
    if (letterPath) await supabase.storage.from(BUCKET).remove([letterPath]);
    return bad("We couldn’t save the referral. Please try again.", 500);
  }

  return NextResponse.json({ ok: true, referralId: id });
}
