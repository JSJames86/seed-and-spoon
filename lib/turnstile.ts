/**
 * Server-side Cloudflare Turnstile check for public forms.
 *
 * Off until BOTH TURNSTILE_SECRET_KEY and NEXT_PUBLIC_TURNSTILE_SITE_KEY are set
 * (Vercel env), so this code can ship before the keys exist. Requiring both
 * means a half-configured deploy (secret but no widget) can't lock families
 * out. Once both are set, every protected form must include a valid, unused token.
 */

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export type TurnstileResult = { ok: boolean; status: number; message: string };

const PASS: TurnstileResult = { ok: true, status: 200, message: "" };

export const TURNSTILE_FAIL_MESSAGE =
  "We couldn’t confirm this form came from a person. Please refresh the page and try again, or email hello@seedandspoon.org.";

export function turnstileRequired(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
}

export async function verifyTurnstile(token: unknown, ip?: string): Promise<TurnstileResult> {
  if (!turnstileRequired()) return PASS;
  const secret = process.env.TURNSTILE_SECRET_KEY as string;

  if (typeof token !== "string" || token.length === 0 || token.length > 2048) {
    return { ok: false, status: 403, message: TURNSTILE_FAIL_MESSAGE };
  }

  const body = new URLSearchParams({ secret, response: token });
  if (ip && ip !== "unknown") body.set("remoteip", ip);

  try {
    const res = await fetch(VERIFY_URL, { method: "POST", body, cache: "no-store" });
    const data = (await res.json()) as { success?: boolean; "error-codes"?: string[] };
    if (data.success) return PASS;
    console.warn("[turnstile] rejected", data["error-codes"]);
    return { ok: false, status: 403, message: TURNSTILE_FAIL_MESSAGE };
  } catch (err) {
    // Cloudflare unreachable: fail closed so a bot can't ride an outage,
    // but tell the family how to reach us instead.
    console.error("[turnstile] verify failed", err);
    return {
      ok: false,
      status: 503,
      message: "Our security check is temporarily unavailable. Please try again in a few minutes, or email hello@seedandspoon.org.",
    };
  }
}
