import type { ReactElement } from "react";
import { createServiceClient } from "./supabase-server";
import { resend } from "./resend";

/**
 * Transactional send helper — for one-to-one, event-triggered email
 * (welcome, donor thank-you, volunteer, application decisions, receipts).
 *
 * This is a DIFFERENT path from the newsletter. Newsletters go out as
 * Broadcasts to an Audience; these go out as individual sends via
 * resend.emails.send. Keep them separate so a delivery issue on one never
 * touches the other, and so marketing/list rules don't apply to receipts.
 *
 * Every send is logged to the email_logs table (the same one
 * lib/email-service.ts writes to). Logging never blocks or breaks a send --
 * if the log write fails, we swallow it and the email still goes out.
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
  to: string | string[];
  subject: string;
  react: ReactElement;
  from?: string;
  replyTo?: string;
  /** Category for the email_logs row, e.g. "donor_thank_you". */
  type: string;
  /** Optional structured context, e.g. { decision: "accepted", application_id }. */
  metadata?: Record<string, unknown>;
}

async function log(row: {
  type: string;
  recipient: string;
  subject: string;
  resend_id?: string | null;
  status: "sent" | "failed";
  error?: string | null;
  metadata?: Record<string, unknown>;
}) {
  try {
    const supabase = createServiceClient();
    if (!supabase) return;
    await supabase.from("email_logs").insert({
      recipient_email: row.recipient,
      subject: row.subject,
      email_type: row.type,
      status: row.status,
      resend_message_id: row.resend_id ?? null,
      error_message: row.error ?? null,
      metadata: row.metadata ?? null,
      sent_at: row.status === "sent" ? new Date().toISOString() : null,
    });
  } catch {
    // Logging is best-effort. Never let it affect the send path.
  }
}

export async function sendTransactional({
  to,
  subject,
  react,
  from = FROM.hello,
  replyTo,
  type,
  metadata,
}: SendArgs) {
  const recipient = Array.isArray(to) ? to.join(", ") : to;

  const { data, error } = await resend.emails.send({
    from,
    to,
    subject,
    react,
    ...(replyTo ? { replyTo } : {}),
  });

  if (error) {
    await log({
      type,
      recipient,
      subject,
      status: "failed",
      error: error.message,
      metadata,
    });
    // Bubble up so the caller (webhook, route handler) can log/retry.
    throw new Error(`Resend send failed: ${error.message}`);
  }

  await log({
    type,
    recipient,
    subject,
    resend_id: data?.id ?? null,
    status: "sent",
    metadata,
  });

  return data;
}
