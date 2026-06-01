'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const ADMIN_EMAIL = 'janelle.shanise@gmail.com'

const EVENT_ICONS = {
  'donation.received':    '💚',
  'donation.recurring':   '🔄',
  'email.sent':           '📧',
  'grant.created':        '📋',
  'grant.stage_changed':  '📊',
  'grant.awarded':        '🏆',
  'volunteer.registered': '🙋',
  'volunteer.approved':   '✅',
  'volunteer.shift':      '👩‍🍳',
  'document.signed':      '✍️',
  'document.uploaded':    '📎',
  'invite.sent':          '📨',
  'invite.accepted':      '👋',
  'delivery.dispatched':  '🚗',
  'delivery.completed':   '📦',
  'cohort.enrolled':      '🌱',
  'cohort.completed':     '🎉',
  'message.sent':         '💬',
  'platform.launched':    '🚀',
  'nda.signed':           '🔒',
}

const RECORD_COLORS = {
  donor:     'bg-green-100 text-green-700',
  grant:     'bg-blue-100 text-blue-700',
  volunteer: 'bg-purple-100 text-purple-700',
  household: 'bg-orange-100 text-orange-700',
  cohort:    'bg-teal-100 text-teal-700',
  user:      'bg-gray-100 text-gray-700',
  system:    'bg-yellow-100 text-yellow-700',
}

function fmtDate(ts) {
  const d = new Date(ts)
  const now = new Date()
  const diff = now - d
  if (diff < 60000) return 'just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function getLabel(log) {
  const labels = {
    'donation.received':    `Donation received from ${log.record_label || 'donor'}`,
    'email.sent':           `Email sent to ${log.record_label || 'recipient'}`,
    'grant.created':        `Grant added: ${log.record_label || ''}`,
    'grant.stage_changed':  `Grant moved to ${log.metadata?.stage || ''}: ${log.record_label || ''}`,
    'grant.awarded':        `🏆 Grant awarded: ${log.record_label || ''}`,
    'volunteer.registered': `${log.record_label || 'Volunteer'} registered`,
    'volunteer.approved':   `${log.record_label || 'Volunteer'} approved as active`,
    'document.signed':      `${log.record_label || 'User'} signed ${log.metadata?.document || 'document'}`,
    'document.uploaded':    `Document uploaded: ${log.record_label || ''}`,
    'invite.sent':          `Invite sent to ${log.record_label || ''}`,
    'invite.accepted':      `${log.record_label || 'User'} joined the platform`,
    'delivery.dispatched':  `Delivery dispatched to ${log.record_label || 'household'}`,
    'delivery.completed':   `Delivery completed — ${log.metadata?.meals_delivered || ''} meals`,
    'cohort.enrolled':      `${log.record_label || 'Family'} enrolled in cohort`,
    'platform.launched':    'Seed & Spoon platform went live',
    'nda.signed':           `${log.record_label || 'User'} signed the NDA`,
  }
  return labels[log.event_type] || `${log.event_type}: ${log.record_label || ''}`
}

export default function TimelinePage() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const isAdmin = user?.email === ADMIN_EMAIL || profile?.role === 'admin'

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/login'); return }
    if (!isAdmin && profile !== null) { router.push('/dashboard'); return }
    if (isAdmin) fetchLogs()
  }, [authLoading, user, profile, isAdmin]) // eslint-disable-line

  const fetchLogs = async () => {
    const res = await fetch('/api/activity?limit=100')
    const data = await res.json()
    setLogs(data.logs || [])
    setLoading(false)
  }

  const filtered = logs.filter(log => {
    if (filter !== 'all' && log.record_type !== filter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        log.record_label?.toLowerCase().includes(q) ||
        log.event_type?.toLowerCase().includes(q) ||
        log.actor_name?.toLowerCase().includes(q)
      )
    }
    return true
  })

  // Group by date
  const grouped = filtered.reduce((acc, log) => {
    const date = new Date(log.created_at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    acc[date] = acc[date] || []
    acc[date].push(log)
    return acc
  }, {})

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-700" />
    </div>
  )

  if (!isAdmin && profile) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link href="/admin" className="text-sm text-gray-400 hover:text-gray-600">← Admin CRM</Link>
          <h1 className="text-xl font-bold text-charcoal">Activity Timeline</h1>
          <span className="text-xs text-gray-400 ml-auto">{filtered.length} events</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="flex gap-2 flex-wrap mb-6">
          <input
            className="flex-1 min-w-48 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Search events, people, records..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="flex gap-1 flex-wrap">
            {['all', 'donor', 'grant', 'volunteer', 'user', 'system'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${
                  filter === f ? 'bg-green-700 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading timeline...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-2">📍</p>
            <p className="text-gray-400">No events found</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([date, dateLogs]) => (
              <div key={date}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px flex-1 bg-gray-200" />
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{date}</span>
                  <div className="h-px flex-1 bg-gray-200" />
                </div>

                <div className="space-y-2">
                  {dateLogs.map(log => (
                    <div key={log.id} className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-start gap-3 hover:border-gray-200 transition-all">
                      <div className="text-xl flex-shrink-0 mt-0.5">
                        {EVENT_ICONS[log.event_type] || '📍'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-charcoal">{getLabel(log)}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {log.record_type && (
                            <span className={`px-1.5 py-0.5 rounded text-xs font-medium capitalize ${RECORD_COLORS[log.record_type] || 'bg-gray-100 text-gray-600'}`}>
                              {log.record_type}
                            </span>
                          )}
                          {log.actor_name && (
                            <span className="text-xs text-gray-400">by {log.actor_name}</span>
                          )}
                          {log.metadata && Object.keys(log.metadata).length > 0 && (
                            <span className="text-xs text-gray-300">
                              {log.metadata.amount ? `$${log.metadata.amount}` : ''}
                              {log.metadata.stage ? ` → ${log.metadata.stage}` : ''}
                              {log.metadata.meals_delivered ? ` ${log.metadata.meals_delivered} meals` : ''}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-gray-300 flex-shrink-0 mt-0.5">{fmtDate(log.created_at)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
