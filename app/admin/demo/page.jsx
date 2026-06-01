'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDemo } from '@/contexts/DemoContext'
import Link from 'next/link'
import {
  DEMO_DONORS, DEMO_GRANTS, DEMO_VOLUNTEERS,
  DEMO_TASKS, DEMO_TIMELINE, DEMO_STATS
} from '@/lib/demo-data'

const GRANT_STAGES = [
  { id: 'prospect', label: 'Prospect', color: 'bg-gray-100 text-gray-700' },
  { id: 'loi', label: 'LOI', color: 'bg-blue-100 text-blue-700' },
  { id: 'submitted', label: 'Submitted', color: 'bg-yellow-100 text-yellow-700' },
  { id: 'awarded', label: 'Awarded', color: 'bg-green-100 text-green-700' },
  { id: 'reporting', label: 'Reporting', color: 'bg-purple-100 text-purple-700' },
  { id: 'closed', label: 'Closed', color: 'bg-red-100 text-red-700' },
]

const EVENT_ICONS = {
  'donation.received': '💚', 'grant.awarded': '🏆',
  'volunteer.approved': '✅', 'invite.accepted': '👋',
  'document.uploaded': '📎', 'grant.stage_changed': '📊',
}

const TABS = ['Overview', 'Grants', 'Donors', 'Volunteers', 'Tasks', 'Timeline']

export default function DemoPage() {
  const { setDemo } = useDemo()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('Overview')

  const exitDemo = () => {
    setDemo(false)
    router.push('/admin')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Banner */}
      <div className="bg-orange-500 text-white text-center py-2 px-4 text-sm font-semibold">
        🎭 Demo Mode — Showing sample data only. No real donor or family information is visible.
        <button onClick={exitDemo} className="ml-4 underline hover:no-underline">Exit Demo</button>
      </div>

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-charcoal">Admin CRM <span className="text-orange-500 text-sm font-normal ml-1">DEMO</span></h1>
            <p className="text-xs text-gray-400">demo@seedandspoon.org</p>
          </div>
          <button onClick={exitDemo}
            className="px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-all">
            Exit Demo Mode
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-4">
        <div className="max-w-6xl mx-auto flex gap-1 overflow-x-auto">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors -mb-px whitespace-nowrap ${
                activeTab === tab ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* OVERVIEW */}
        {activeTab === 'Overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Total Raised" value={`$${DEMO_STATS.totalRaised.toLocaleString()}`} color="green" />
              <StatCard label="Unique Donors" value={DEMO_STATS.uniqueDonors} color="blue" />
              <StatCard label="Active Volunteers" value={DEMO_STATS.activeVolunteers} color="purple" />
              <StatCard label="Grants Awarded" value={`$${DEMO_STATS.grantsAwarded.toLocaleString()}`} color="yellow" />
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-charcoal mb-3">Recent Donations</h2>
              <div className="divide-y divide-gray-100">
                {DEMO_DONORS.slice(0, 4).map(d => (
                  <div key={d.id} className="py-3 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-charcoal">{d.donor_name}</p>
                      <p className="text-xs text-gray-400">{d.donor_email}</p>
                    </div>
                    <p className="text-sm font-bold text-green-700">${d.amount}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* GRANTS */}
        {activeTab === 'Grants' && (
          <div className="space-y-4">
            <h2 className="font-semibold text-charcoal">Grant Pipeline</h2>
            {GRANT_STAGES.map(stage => {
              const stageGrants = DEMO_GRANTS.filter(g => g.stage === stage.id)
              if (!stageGrants.length) return null
              return (
                <div key={stage.id} className="bg-white rounded-xl border border-gray-200 p-4">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${stage.color}`}>{stage.label}</span>
                  <div className="mt-3 space-y-3">
                    {stageGrants.map(g => (
                      <div key={g.id} className="border border-gray-100 rounded-lg p-3">
                        <div className="flex justify-between">
                          <p className="text-sm font-semibold">{g.title}</p>
                          <p className="text-sm font-bold text-green-700">${g.amount.toLocaleString()}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{g.funder}</p>
                        {g.notes && <p className="text-xs text-gray-400 mt-1 italic">{g.notes}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* DONORS */}
        {activeTab === 'Donors' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 border-b">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Donor</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
              </tr></thead>
              <tbody>
                {DEMO_DONORS.map(d => (
                  <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3"><p className="font-medium">{d.donor_name}</p><p className="text-xs text-gray-400">{d.donor_email}</p></td>
                    <td className="px-4 py-3 font-medium text-green-700">${d.amount}</td>
                    <td className="px-4 py-3 text-gray-500 capitalize">{d.donation_type.replace('_', ' ')}</td>
                    <td className="px-4 py-3 text-gray-400">{d.donated_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* VOLUNTEERS */}
        {activeTab === 'Volunteers' && (
          <div className="space-y-3">
            {DEMO_VOLUNTEERS.map(v => (
              <div key={v.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex justify-between mb-1">
                  <p className="font-semibold text-sm">{v.name}</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${v.status === 'active' ? 'bg-green-100 text-green-700' : v.status === 'approved' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {v.status}
                  </span>
                </div>
                <p className="text-xs text-gray-400">{v.email}</p>
                <p className="text-xs text-gray-500 mt-1">Interests: {v.interests.join(', ')} · {v.availability}</p>
              </div>
            ))}
          </div>
        )}

        {/* TASKS */}
        {activeTab === 'Tasks' && (
          <div className="space-y-3">
            {DEMO_TASKS.map(t => (
              <div key={t.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex justify-between mb-1">
                  <p className="font-semibold text-sm">{t.title}</p>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${t.priority === 'urgent' ? 'bg-red-100 text-red-700' : t.priority === 'high' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                    {t.priority}
                  </span>
                </div>
                <p className="text-xs text-gray-400">{t.notes}</p>
                <p className="text-xs text-gray-300 mt-1">Due: {t.due_date} · {t.related_type}: {t.related_label}</p>
              </div>
            ))}
          </div>
        )}

        {/* TIMELINE */}
        {activeTab === 'Timeline' && (
          <div className="space-y-2">
            {DEMO_TIMELINE.map(log => (
              <div key={log.id} className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-start gap-3">
                <span className="text-xl">{EVENT_ICONS[log.event_type] || '📍'}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-charcoal">{log.record_label}</p>
                  <p className="text-xs text-gray-400">{log.event_type.replace('.', ' ')} · by {log.actor_name}</p>
                </div>
                <span className="text-xs text-gray-300">{new Date(log.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

function StatCard({ label, value, color }) {
  const colors = { green: 'bg-green-50 text-green-700 border-green-100', blue: 'bg-blue-50 text-blue-700 border-blue-100', purple: 'bg-purple-50 text-purple-700 border-purple-100', yellow: 'bg-yellow-50 text-yellow-700 border-yellow-100' }
  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <p className="text-xs font-medium opacity-70 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}
