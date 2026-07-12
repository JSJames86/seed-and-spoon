'use client'

import { useState } from 'react'

export type SubscribeSegment = 'general' | 'donor' | 'volunteer'

export interface SubscribeFormProps {
  segment?: SubscribeSegment
  source?: string
  onSuccess?: (email: string) => void
  onError?: (message: string) => void
  className?: string
  compact?: boolean
  /** True when this form is embedded directly on a dark (e.g. green-900) background, not a white card — swaps text colors that would otherwise fail contrast. */
  onDark?: boolean
}

interface FormState {
  email: string
  firstName: string
}

type Status = 'idle' | 'loading' | 'success' | 'error'

export function SubscribeForm({
  segment = 'general',
  source = 'website',
  onSuccess,
  onError,
  className = '',
  compact = false,
  onDark = false,
}: SubscribeFormProps) {
  const [form, setForm] = useState<FormState>({ email: '', firstName: '' })
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.email) return

    setStatus('loading')
    setErrorMessage('')

    try {
      const res = await fetch('/api/email/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email.trim(),
          first_name: form.firstName.trim() || undefined,
          segment,
          source,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error ?? 'Something went wrong. Please try again.')
      }

      setStatus('success')
      onSuccess?.(form.email)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      setStatus('error')
      setErrorMessage(msg)
      onError?.(msg)
    }
  }

  if (status === 'success') {
    return (
      <div className={`rounded-lg bg-green-50 border border-green-200 p-4 text-center ${className}`}>
        <p className="text-green-800 font-medium text-sm">
          🌱 You&apos;re in! Check your inbox for a welcome email from Seed &amp; Spoon.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col gap-3 ${className}`} noValidate>
      {!compact && (
        <input
          type="text"
          placeholder="First name (optional)"
          value={form.firstName}
          onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
        />
      )}

      <div className={compact ? 'flex gap-2' : 'flex flex-col gap-3'}>
        <input
          type="email"
          placeholder="Your email address"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          required
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={status === 'loading' || !form.email}
          className="rounded-md bg-green-800 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
        >
          {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
        </button>
      </div>

      {status === 'error' && (
        <p className={`text-xs ${onDark ? 'text-red-300' : 'text-red-600'}`}>{errorMessage}</p>
      )}

      <p className={`text-xs ${onDark ? 'text-green-300' : 'text-gray-500'}`}>
        No spam, ever. Unsubscribe at any time.
      </p>
    </form>
  )
}
