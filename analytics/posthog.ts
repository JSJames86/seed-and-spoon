// posthog-js is loaded dynamically so it never lands in the initial page
// bundle — it's only fetched once a user actually grants analytics consent.
type PostHogInstance = typeof import('posthog-js').default

let _posthog: PostHogInstance | null = null
let _initialized = false

export async function initPostHog(): Promise<void> {
  if (typeof window === 'undefined') return
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  if (!key || _initialized) return

  const { default: posthog } = await import('posthog-js')
  posthog.init(key, {
    api_host: 'https://us.i.posthog.com',
    capture_pageview: true,
    session_recording: {
      maskAllInputs: true,
    },
  })

  _posthog = posthog
  _initialized = true
}

export async function captureEvent(event: string, properties?: Record<string, unknown>): Promise<void> {
  if (typeof window === 'undefined' || !_initialized || !_posthog) return
  _posthog.capture(event, properties)
}
