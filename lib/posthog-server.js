/**
 * Server-side PostHog capture via the REST API.
 * Used in API route handlers (e.g. Stripe webhook) where posthog-js is unavailable.
 * Uses POSTHOG_API_KEY (server-only) rather than the NEXT_PUBLIC_ variant.
 * Analytics failures are swallowed so they never break the primary request flow.
 */

export async function captureServerEvent(distinctId, event, properties = {}) {
  const key = process.env.POSTHOG_API_KEY
  if (!key) return

  try {
    await fetch('https://us.i.posthog.com/capture/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: key,
        event,
        distinct_id: distinctId,
        properties,
      }),
    })
  } catch {
    // Intentionally silent — analytics must never break the main request
  }
}
