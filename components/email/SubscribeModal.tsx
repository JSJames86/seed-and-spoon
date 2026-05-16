'use client'

import { useEffect, useRef, useState } from 'react'
import { SubscribeForm } from './SubscribeForm'

interface SubscribeModalProps {
  open: boolean
  onClose: () => void
  segment?: 'general' | 'donor' | 'volunteer'
}

export function SubscribeModal({ open, onClose, segment = 'general' }: SubscribeModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Subscribe to Seed & Spoon newsletter"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="mb-6 text-center">
          <span className="text-3xl">🌱</span>
          <h2 className="mt-2 text-xl font-bold text-green-900">
            Join the Seed &amp; Spoon community
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Monthly updates on our mission to end food insecurity in Newark, NJ.
          </p>
        </div>
        <SubscribeForm segment={segment} source="popup" onSuccess={() => setTimeout(onClose, 2000)} />
      </div>
    </div>
  )
}

const DISMISSED_KEY = 'sns_newsletter_dismissed'

export function SubscribePopupTrigger({ delayMs = 8000 }: { delayMs?: number }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    try {
      if (localStorage.getItem(DISMISSED_KEY)) return
    } catch {
      return // localStorage unavailable (iOS private browsing)
    }
    const timer = setTimeout(() => setOpen(true), delayMs)
    return () => clearTimeout(timer)
  }, [delayMs])

  function handleClose() {
    setOpen(false)
    try {
      localStorage.setItem(DISMISSED_KEY, '1')
    } catch {
      // localStorage unavailable — popup just won't stay dismissed
    }
  }

  return <SubscribeModal open={open} onClose={handleClose} />
}
