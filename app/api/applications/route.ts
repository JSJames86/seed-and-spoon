import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createServiceClient } from "@/lib/supabase-server";
import { sendTransactional, FROM } from "@/lib/email";
import { checkRateLimit, getClientIp } from "@/lib/api-helpers";
import ApplicationReceived from "@/emails/ApplicationReceived";
import {
  ALLERGENS,
  SEVERITIES,
  FORMULA_BRANDS,
  FORMULA_TYPES,
  DIETARY_OPTIONS,
  CONTACT_METHODS,
  LANGUAGES,
  REHEAT_OPTIONS,
  DROPOFF_METHODS,
  REFERRAL_TYPES,
  REFERRAL_UPLOAD,
} from "@/data/familyIntake";

/**
 * POST /api/applications  (public — the Get Help family intake posts here)
 *
 * multipart/form-data:
 *   payload      JSON string (see IntakePayload)
 *   referralDoc  file, required unless referralType is "partner_sending"
 *
 * Records the intake (status "received"), stores the referral document in the
 * private `intake-referrals` bucket, and emails an acknowledgment when an email
 * was given. The decision comes later from /api/admin/applications/decision.
 *
 * We never collect income, SSNs, or immigration status. Referral documents are
 * deleted after 30 days by /api/applications/cleanup.
 */

export const runtime = "nodejs";

const BUCKET = "intake-referrals";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_CHILDREN = 10;

type Child = {
  label?: string;
  ageYears?: number | string | null;
  ageMonths?: number | string | null;
  underOne?: boolean;
  school?: string;
  formulaBrand?: string | null;
  formulaType?: string | null;
};

type Allergen = {
  childLabel?: string;
  allergen?: string;
  severity?: string;
  otherName?: string;
};

type IntakePayload = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  preferredContact?: string;
  preferredLanguage?: string;
  city?: string;
  zip?: string;
  essexCounty?: boolean;
  adultsInHome?: number | string;
  children?: Child[];
  allergens?: Allergen[];
  dietary?: string[];
  reheatAccess?: string;
  dropoffMethod?: string;
  dropoffAddress?: string;
  dropoffUnit?: string;
  dropoffSchool?: string;
  medicalNeeds?: string;
  notes?: string;
  referralType?: string;
  referrerName?: string;
  referrerOrg?: string;
  referrerContact?: string;
  privacyAcknowledged?: boolean;
  socialReshareConsent?: boolean;
  signatureName?: string;
};

const keys = (list: { key: string }[]) => list.map((o) => o.key);
const str = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const bad = (message: string, status = 400) => NextResponse.json({ error: message }, { status });

function toInt(v: unknown): number | null {
  const n = Number(v);
  return Number.isInteger(n) ? n : null;
}

function cleanChildren(raw: unknown): { children: Record<string, unknown>[]; error?: string } {
  if (!Array.isArray(raw) || raw.length === 0) return { children: [], error: "Please add at least one child." };
  if (raw.length > MAX_CHILDREN) return { children: [], error: `Please list up to ${MAX_CHILDREN} children.` };

  const labels = new Set<string>();
  const children: Record<string, unknown>[] = [];
  for (let i = 0; i < raw.length; i++) {
    const c = (raw[i] ?? {}) as Child;
    const label = str(c.label, 40);
    if (!label) return { children: [], error: `Child ${i + 1}: please add their first name.` };
    if (labels.has(label.toLowerCase())) return { children: [], error: `Two children are listed as "${label}". Please add a last initial to tell them apart.` };
    labels.add(label.toLowerCase());

    const underOne = Boolean(c.underOne);
    const ageYears = underOne ? 0 : toInt(c.ageYears);
    const ageMonths = underOne ? toInt(c.ageMonths) : null;
    if (!underOne && (ageYears === null || ageYears < 1 || ageYears > 17)) {
      return { children: [], error: `${label}: please enter an age from 1 to 17, or mark under 1 year.` };
    }
    if (underOne && (ageMonths === null || ageMonths < 0 || ageMonths > 11)) {
      return { children: [], error: `${label}: please enter the baby’s age in months (0 to 11).` };
    }

    let formulaBrand: string | null = null;
    let formulaType: string | null = null;
    if (underOne) {
      formulaBrand = str(c.formulaBrand, 20) || null;
      formulaType = str(c.formulaType, 20) || null;
      if (formulaBrand && !keys(FORMULA_BRANDS).includes(formulaBrand)) return { children: [], error: `${label}: unknown formula brand.` };
      if (formulaType && !keys(FORMULA_TYPES).includes(formulaType)) return { children: [], error: `${label}: unknown formula type.` };
      if (formulaBrand && !formulaType) return { children: [], error: `${label}: please choose Regular or Sensitive formula.` };
    }

    children.push({
      label,
      age_years: ageYears,
      age_months: ageMonths,
      under_one: underOne,
      school: str(c.school, 120) || null,
      formula_brand: formulaBrand,
      formula_type: formulaType,
    });
  }
  return { children };
}

function cleanAllergens(raw: unknown, childLabels: string[]): { allergens: Record<string, unknown>[]; error?: string } {
  if (raw == null) return { allergens: [] };
  if (!Array.isArray(raw)) return { allergens: [], error: "Invalid allergy information." };
  const allergens: Record<string, unknown>[] = [];
  for (const entry of raw) {
    const a = (entry ?? {}) as Allergen;
    const childLabel = str(a.childLabel, 40);
    if (!childLabels.includes(childLabel)) continue; // child was removed after marking an allergy
    if (!keys(ALLERGENS).includes(String(a.allergen))) return { allergens: [], error: "Unknown allergen." };
    if (!keys(SEVERITIES).includes(String(a.severity))) return { allergens: [], error: "Unknown allergy severity." };
    const otherName = a.allergen === "other" ? str(a.otherName, 80) : "";
    if (a.allergen === "other" && !otherName) {
      return { allergens: [], error: `${childLabel}: please name the "Other" allergy.` };
    }
    allergens.push({
      child_label: childLabel,
      allergen: a.allergen,
      severity: a.severity,
      allergen_other_name: otherName || null,
    });
  }
  return { allergens };
}

function extFor(type: string) {
  return { "application/pdf": "pdf", "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }[type] ?? "bin";
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (!checkRateLimit(`family_intake_ip:${ip}`, 8, DAY_MS).allowed) {
    return bad("We’ve received several forms from this network today. Please call or text us instead.", 429);
  }

  // Accept multipart (current form) or JSON (no document; partner_sending only).
  let body: IntakePayload;
  let file: File | null = null;
  const contentType = req.headers.get("content-type") ?? "";
  try {
    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      body = JSON.parse(String(form.get("payload") ?? "{}"));
      const doc = form.get("referralDoc");
      file = doc && typeof doc !== "string" ? (doc as File) : null;
    } else {
      body = await req.json();
    }
  } catch {
    return bad("We couldn’t read the form. Please try again.");
  }

  // ── Contact ───────────────────────────────────────────────────────────────
  const firstName = str(body.firstName, 80);
  const lastName = str(body.lastName, 80);
  const phone = str(body.phone, 30);
  const email = str(body.email, 200).toLowerCase();
  const preferredContact = str(body.preferredContact, 20);
  const preferredLanguage = str(body.preferredLanguage, 20);

  if (!firstName) return bad("Please enter your first name.");
  if (!phone) return bad("Please enter a phone number.");
  if (!email || !EMAIL_RE.test(email)) return bad("Please enter a valid email address. We send updates and documents by email.");
  if (!keys(CONTACT_METHODS).includes(preferredContact)) return bad("Please choose how we should contact you.");
  if (preferredLanguage && !keys(LANGUAGES).includes(preferredLanguage)) return bad("Unknown language.");

  const zip = str(body.zip, 10);
  if (!/^\d{5}$/.test(zip)) return bad("Please enter a 5-digit ZIP code.");
  if (typeof body.essexCounty !== "boolean") return bad("Please tell us whether you live in Essex County.");

  // ── Household ─────────────────────────────────────────────────────────────
  const adultsInHome = toInt(body.adultsInHome);
  if (adultsInHome === null || adultsInHome < 1 || adultsInHome > 20) return bad("Please enter how many adults live in your home.");

  const { children, error: childError } = cleanChildren(body.children);
  if (childError) return bad(childError);

  const childLabels = children.map((c) => String(c.label));
  const { allergens, error: allergenError } = cleanAllergens(body.allergens, childLabels);
  if (allergenError) return bad(allergenError);

  const dietary = Array.isArray(body.dietary)
    ? body.dietary.map(String).filter((d) => keys(DIETARY_OPTIONS).includes(d))
    : [];
  const reheatAccess = str(body.reheatAccess, 20);
  if (reheatAccess && !keys(REHEAT_OPTIONS).includes(reheatAccess)) return bad("Unknown kitchen option.");

  // ── Drop-off ──────────────────────────────────────────────────────────────
  const dropoffMethod = str(body.dropoffMethod, 20);
  if (!keys(DROPOFF_METHODS).includes(dropoffMethod)) return bad("Please choose where we should drop off your meals.");
  const dropoffAddress = str(body.dropoffAddress, 200);
  const dropoffUnit = str(body.dropoffUnit, 120);
  const dropoffSchool = str(body.dropoffSchool, 120);
  if (dropoffMethod === "home" && !dropoffAddress) return bad("Please enter your street address for home drop-off.");
  if (dropoffMethod === "school" && !dropoffSchool) return bad("Please tell us which school.");

  // ── Referral ──────────────────────────────────────────────────────────────
  const referralType = str(body.referralType, 40);
  const referral = REFERRAL_TYPES.find((r) => r.key === referralType);
  if (!referral) return bad("Please choose your referral type.");

  const referrerName = str(body.referrerName, 120);
  const referrerOrg = str(body.referrerOrg, 160);
  const referrerContact = str(body.referrerContact, 200);

  if (referral.how === "upload") {
    if (!file) return bad("Please attach your referral document.");
    if (!REFERRAL_UPLOAD.allowedTypes.includes(file.type)) return bad("Please upload a PDF or a photo (JPG or PNG).");
    if (file.size > REFERRAL_UPLOAD.maxBytes) return bad("That file is too large. Please upload a file under 4 MB.");
  } else {
    file = null; // the partner sends the document
    if (!referrerName || !referrerOrg) return bad("Please tell us who is sending your referral and where they work.");
  }

  // ── Consents ──────────────────────────────────────────────────────────────
  if (body.privacyAcknowledged !== true) return bad("Please confirm you’ve read our privacy promise.");
  const signatureName = str(body.signatureName, 120);
  if (!signatureName) return bad("Please type your full name to sign.");

  const supabase = createServiceClient();
  if (!supabase) return bad("We’re having trouble right now. Please call or text us.", 503);

  // Upload first so the row never points to a missing file.
  const id = randomUUID();
  let referralDocPath: string | null = null;
  if (file) {
    referralDocPath = `applications/${id}/referral.${extFor(file.type)}`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(referralDocPath, Buffer.from(await file.arrayBuffer()), { contentType: file.type, upsert: false });
    if (uploadError) {
      console.error("[applications] referral upload failed:", uploadError.message);
      return bad("We couldn’t upload your document. Please try again, or call or text us.", 500);
    }
  }

  const medicalNeeds = str(body.medicalNeeds, 2000);
  const notes = str(body.notes, 2000);

  const { error: dbError } = await supabase.from("applications").insert({
    id,
    email,
    first_name: firstName,
    last_name: lastName || null,
    phone,
    preferred_contact: preferredContact,
    preferred_language: preferredLanguage || null,
    city: str(body.city, 80) || null,
    zip,
    essex_county: body.essexCounty,
    household_size: adultsInHome + children.length,
    adults_in_home: adultsInHome,
    children,
    allergens,
    // Plain-text summary kept for the existing reviewer fields and emails.
    allergies: allergens.length
      ? allergens
          .map((a) => `${a.child_label}: ${a.allergen === "other" ? a.allergen_other_name : a.allergen} (${a.severity})`)
          .join("; ")
      : null,
    dietary,
    reheat_access: reheatAccess || null,
    dropoff_method: dropoffMethod,
    dropoff_address: dropoffMethod === "home" ? dropoffAddress : null,
    dropoff_unit: dropoffMethod === "home" ? dropoffUnit || null : null,
    dropoff_school: dropoffMethod === "school" ? dropoffSchool : null,
    medical_needs: medicalNeeds || null,
    notes: notes || null,
    referral_type: referralType,
    referral_doc_path: referralDocPath,
    referrer_name: referrerName || null,
    referrer_org: referrerOrg || null,
    referrer_contact: referrerContact || null,
    privacy_acknowledged: true,
    social_reshare_consent: body.socialReshareConsent === true,
    signature_name: signatureName,
    signed_at: new Date().toISOString(),
    source: "get_help_intake",
    status: "received",
  });

  if (dbError) {
    console.error("[applications] insert failed:", dbError.message);
    if (referralDocPath) await supabase.storage.from(BUCKET).remove([referralDocPath]);
    return bad("We couldn’t save your form. Please try again, or call or text us.", 500);
  }

  {
    try {
      await sendTransactional({
        type: "application_received",
        to: email,
        subject: "We received your 5 Loaves intake form",
        from: FROM.program,
        react: ApplicationReceived({
          firstName,
          coordinatorEmail: "5loaves@seedandspoon.org",
        }),
        metadata: { application_id: id },
      });
    } catch (err) {
      console.error("application received email failed:", err);
    }
  }

  return NextResponse.json({ ok: true, applicationId: id });
}
