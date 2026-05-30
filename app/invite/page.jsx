'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

function InviteForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [invite, setInvite] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ firstName: '', lastName: '', password: '', confirm: '' })
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!token) { setError('Invalid invite link.'); setLoading(false); return }
    fetch(`/api/invite/validate?token=${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) setError(data.error)
        else setInvite(data.invite)
        setLoading(false)
      })
      .catch(() => { setError('Failed to validate invite.'); setLoading(false) })
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return }
    setSubmitting(true)
    setError('')

    const res = await fetch('/api/invite/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        email: invite.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        role: invite.role,
      }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Failed to create account'); setSubmitting(false); return }
    setDone(true)
    setTimeout(() => { window.location.href = '/dashboard' }, 2000)
  }

  const inputClass = 'w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500'

  if (loading) return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-700" />
    </div>
  )

  if (error && !invite) return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow p-8 max-w-md w-full text-center">
        <p className="text-2xl mb-2">⚠️</p>
        <h1 className="text-xl font-bold text-charcoal mb-2">Invalid Invite</h1>
        <p className="text-gray-500 text-sm mb-4">{error}</p>
        <Link href="/" className="text-green-700 font-semibold text-sm hover:underline">Go home →</Link>
      </div>
    </div>
  )

  if (done) return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow p-8 max-w-md w-full text-center">
        <p className="text-4xl mb-3">🌱</p>
        <h1 className="text-xl font-bold text-charcoal mb-2">Welcome to Seed & Spoon!</h1>
        <p className="text-gray-500 text-sm">Taking you to your dashboard...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-xl shadow p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <p className="text-3xl mb-2">🌱</p>
          <h1 className="text-2xl font-bold text-charcoal">You're invited!</h1>
          <p className="text-gray-500 text-sm mt-1">
            Join Seed & Spoon as a <span className="font-semibold capitalize text-green-700">{invite?.role}</span>
          </p>
          <p className="text-gray-400 text-xs mt-1">{invite?.email}</p>
        </div>

        {error && (
          <div className="bg-red-50 rounded-lg p-3 mb-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">First Name</label>
              <input required className={inputClass} placeholder="First" value={form.firstName}
                onChange={e => setForm({...form, firstName: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Last Name</label>
              <input required className={inputClass} placeholder="Last" value={form.lastName}
                onChange={e => setForm({...form, lastName: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
            <input required type="password" className={inputClass} placeholder="Min. 8 characters"
              value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Confirm Password</label>
            <input required type="password" className={inputClass} placeholder="Confirm password"
              value={form.confirm} onChange={e => setForm({...form, confirm: e.target.value})} />
          </div>
          <button type="submit" disabled={submitting}
            className="w-full py-3 bg-green-700 text-white font-bold rounded-lg hover:bg-green-800 disabled:opacity-50 transition-all">
            {submitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function InvitePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-700" /></div>}>
      <InviteForm />
    </Suspense>
  )
}
