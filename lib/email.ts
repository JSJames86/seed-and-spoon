import type { ReactElement } from "react";
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
  to: string | string[];
  subject: string;
  react: ReactElement;
  from?: string;
  replyTo?: string;
}

export async function sendTransactional({
  to,
  subject,
  react,
  from = FROM.hello,
  replyTo,
}: SendArgs) {
  const { data, error } = await resend.emails.send({
    from,
    to,
    subject,
    react,
    ...(replyTo ? { replyTo } : {}),
  });

  if (error) {
    // Bubble up so the caller (webhook, route handler) can log/retry.
    throw new Error(`Resend send failed: ${error.message}`);
  }
  return data;
}
