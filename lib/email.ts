import type { ReactElement } from "react";
import { createClient } from "@supabase/supabase-js";
import { resend } from "./resend";

/**
 * Transactional send helper — for one-to-one, event-triggered email
 * (welcome, donor thank-you, volunteer, application decisions).
 *
 * This is a DIFFERENT path from the newsletter. Newsletters go out as
 * Broadcasts to an Audience; these go out as individual sends via
 * resend.emails.send. Keep them separate so a delivery issue on one never
 * touches the other, and so marketing/list rules don't apply to receipts.
 *
 * All `from` addresses must be on a domain you've verified in Resend.
 */

export const FROM = {
  hello: "Seed & Spoon <hello@seedandspoon.org>",
  donations: "Seed & Spoon <donations@seedandspoon.org>",
  volunteer: "Seed & Spoon <volunteer@seedandspoon.org>",
  program: "Seed & Spoon 5 Loaves <5loaves@seedandspoon.org>",
} as const;

interface SendArgs {
  type: string; // recorded as email_logs.email_type
  to: string | string[];
  subject: string;
  react: ReactElement;
  from?: string;
  replyTo?: string;
  metadata?: Record<string, unknown>;
}

function getServiceSupabase() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase service role environment variables");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function sendTransactional({
  type,
  to,
  subject,
  react,
  from = FROM.hello,
  replyTo,
  metadata,
}: SendArgs) {
  const { data, error } = await resend.emails.send({
    from,
    to,
    subject,
    react,
    ...(replyTo ? { replyTo } : {}),
  });

  // Log the send attempt — isolated try/catch so a DB failure never kills
  // the send result. Same email_logs table lib/email-service.ts writes to.
  try {
    const supabase = getServiceSupabase();
    await supabase.from("email_logs").insert({
      recipient_email: Array.isArray(to) ? to[0] : to,
      subject,
      email_type: type,
      status: error ? "failed" : "sent",
      resend_message_id: data?.id ?? null,
      metadata: metadata ?? null,
      error_message: error?.message ?? null,
      sent_at: error ? null : new Date().toISOString(),
    });
  } catch (logError) {
    console.error("[email] Failed to write email_log (non-fatal):", logError);
  }

  if (error) {
    // Bubble up so the caller (webhook, route handler) can log/retry.
    throw new Error(`Resend send failed: ${error.message}`);
  }
  return data;
}
