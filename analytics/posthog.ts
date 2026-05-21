import posthog from 'posthog-js'

let _initialized = false

export function initPostHog(): void {
  if (typeof window === 'undefined') return
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  if (!key || _initialized) return

  posthog.init(key, {
    api_host: 'https://us.i.posthog.com',
    capture_pageview: true,
    session_recording: {
      maskAllInputs: true,
    },
  })

  _initialized = true
}

export function captureEvent(event: string, properties?: Record<string, unknown>): void {
  if (typeof window === 'undefined' || !_initialized) return
  posthog.capture(event, properties)
}

export default posthog
