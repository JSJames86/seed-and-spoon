'use client'

import { useState } from 'react'

export default function SendReceiptsButton() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [result, setResult] = useState<string>('')

  const handleSend = async () => {
    setStatus('loading')
    try {
      const res = await fetch('/api/email/send-donor-thanks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await res.json()
      if (res.ok) {
        setStatus('done')
        setResult(`Sent: ${data.sent} | Failures: ${data.failures?.length ?? 0}`)
      } else {
        setStatus('error')
        setResult(data.error || 'Unknown error')
      }
    } catch (err) {
      setStatus('error')
      setResult(String(err))
    }
  }

  return (
    <div className="flex items-center gap-4 flex-wrap">
      <button
        onClick={handleSend}
        disabled={status === 'loading' || status === 'done'}
        className="px-4 py-2 bg-green-700 text-white rounded-lg font-medium text-sm hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {status === 'loading' ? 'Sending...' : status === 'done' ? 'Sent ✓' : 'Send Donor Thank-You Emails'}
      </button>
      {result && (
        <span className={`text-sm font-medium ${status === 'done' ? 'text-green-700' : 'text-red-600'}`}>
          {result}
        </span>
      )}
    </div>
  )
}
