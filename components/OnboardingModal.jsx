'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

const ONBOARDING_KEY = 'ss_onboarded'

const ROLE_STEPS = {
  admin: [
    { icon: '🌱', title: 'Welcome to Seed & Spoon', body: 'You\'re logged in as an admin. This platform is your organization\'s operating system — donors, grants, volunteers, messaging, and more, all in one place.' },
    { icon: '🎛️', title: 'Your Admin CRM', body: 'Head to Admin to manage donors, track grants, approve volunteers, and invite new team members. The Activity Timeline logs everything automatically.' },
    { icon: '✅', title: 'You\'re all set!', body: 'Start by checking your Tasks & Follow-ups, then explore the Activity Timeline to see everything that\'s happened so far.' },
  ],
  staff: [
    { icon: '🌱', title: 'Welcome to Seed & Spoon', body: 'You\'re part of the Seed & Spoon team. This platform keeps everything connected — communications, documents, tasks, and updates all in one place.' },
    { icon: '💬', title: 'Your Channels', body: 'Head to Messages to connect with your team. Check #staff for updates, #kitchen for operations, and #general for org-wide announcements.' },
    { icon: '📋', title: 'Documents & Tasks', body: 'Access internal SOPs and governance docs in the Document Library. Check your assigned tasks to see what\'s on your plate.' },
  ],
  volunteer: [
    { icon: '🌱', title: 'Welcome to Seed & Spoon!', body: 'Thank you for joining our mission to feed Newark families. We\'re glad you\'re here.' },
    { icon: '💬', title: 'Connect with the team', body: 'Head to Messages and check #volunteers for your schedule, updates, and coordination from the kitchen team.' },
    { icon: '📄', title: 'Get oriented', body: 'Review the Document Library for volunteer SOPs and guidelines. If you have questions, post them in #general.' },
  ],
  donor: [
    { icon: '💚', title: 'Welcome, and thank you!', body: 'Your generosity directly feeds families in Newark. This is your donor portal — track your giving and see your impact.' },
    { icon: '📊', title: 'Your Impact Dashboard', body: 'Head to your Dashboard to see your total donations, meals provided, and donation history. Every dollar goes directly to the mission.' },
    { icon: '🙌', title: 'Stay connected', body: 'We\'ll keep you updated on how your support is making a difference. Thank you for believing in Seed & Spoon.' },
  ],
}

const ROLE_DESTINATIONS = {
  admin:     { label: 'Go to Admin CRM', href: '/admin' },
  staff:     { label: 'Go to Messages', href: '/messages' },
  volunteer: { label: 'Go to Messages', href: '/messages' },
  donor:     { label: 'Go to Dashboard', href: '/dashboard' },
}

export default function OnboardingModal() {
  const { user, profile } = useAuth()
  const router = useRouter()
  const [show, setShow] = useState(false)
  const [step, setStep] = useState(0)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [saving, setSaving] = useState(false)

  const role = profile?.role || 'donor'
  const steps = ROLE_STEPS[role] || ROLE_STEPS.donor
  const destination = ROLE_DESTINATIONS[role] || ROLE_DESTINATIONS.donor

  useEffect(() => {
    if (!user || !profile) return
    const key = `${ONBOARDING_KEY}_${user.id}`
    const done = localStorage.getItem(key)
    if (!done) {
      setFirstName(profile.first_name || '')
      setLastName(profile.last_name || '')
      // Small delay so page renders first
      setTimeout(() => setShow(true), 800)
    }
  }, [user, profile])

  const saveProfile = async () => {
    if (!firstName.trim()) return
    setSaving(true)
    await fetch('/api/profile/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      }),
    })
    setSaving(false)
  }

  const next = async () => {
    // Save profile on step 1 (profile setup) — only for non-donors
    if (step === 1 && (role === 'admin' || role === 'staff' || role === 'volunteer') && firstName) {
      await saveProfile()
    }
    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      finish()
    }
  }

  const finish = () => {
    const key = `${ONBOARDING_KEY}_${user.id}`
    localStorage.setItem(key, 'true')
    setShow(false)
    router.push(destination.href)
  }

  if (!show) return null

  const current = steps[step]
  const isLastStep = step === steps.length - 1
  const isProfileStep = step === 1 && (role === 'admin' || role === 'staff')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">

        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-1 transition-all duration-500"
            style={{ width: `${((step + 1) / steps.length) * 100}%`, background: '#2d5a27' }}
          />
        </div>

        <div className="p-8">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-6">
            <Image src="/logo-compact.webp" alt="Seed & Spoon" width={32} height={32} className="w-8 h-8 object-contain" />
            <span className="text-sm font-semibold text-gray-500">Seed & Spoon</span>
            <span className="ml-auto text-xs text-gray-300">{step + 1} of {steps.length}</span>
          </div>

          {/* Step content */}
          <div className="text-center mb-8">
            <p className="text-5xl mb-4">{current.icon}</p>
            <h2 className="text-xl font-bold text-gray-900 mb-3">{current.title}</h2>
            <p className="text-gray-500 text-sm leading-relaxed">{current.body}</p>
          </div>

          {/* Profile form on step 1 for admin/staff */}
          {isProfileStep && (
            <div className="space-y-3 mb-6">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">First Name</label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="First"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Last Name</label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Last"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            {step > 0 && (
              <button onClick={() => setStep(step - 1)}
                className="px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                ← Back
              </button>
            )}
            <button onClick={next} disabled={saving || (isProfileStep && !firstName.trim())}
              className="flex-1 py-2.5 text-white text-sm font-semibold rounded-xl disabled:opacity-50 transition-all"
              style={{ background: '#2d5a27' }}>
              {saving ? 'Saving...' : isLastStep ? destination.label + ' →' : 'Next →'}
            </button>
          </div>

          {/* Skip */}
          {!isLastStep && (
            <button onClick={finish} className="w-full mt-3 text-xs text-gray-300 hover:text-gray-400 transition-colors">
              Skip for now
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
