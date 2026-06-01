'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import SendReceiptsButton from './SendReceiptsButton'

const ADMIN_EMAIL = 'janelle.shanise@gmail.com'

const GRANT_STAGES = [
  { id: 'prospect', label: 'Prospect', color: 'bg-gray-100 text-gray-700' },
  { id: 'loi', label: 'LOI', color: 'bg-blue-100 text-blue-700' },
  { id: 'submitted', label: 'Submitted', color: 'bg-yellow-100 text-yellow-700' },
  { id: 'awarded', label: 'Awarded', color: 'bg-green-100 text-green-700' },
  { id: 'reporting', label: 'Reporting', color: 'bg-purple-100 text-purple-700' },
  { id: 'closed', label: 'Closed', color: 'bg-red-100 text-red-700' },
]

const TABS = ['Overview', 'Grants', 'Donors', 'Volunteers', 'Users', 'Documents']

export default function AdminPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('Overview')
  const [donations, setDonations] = useState([])
  const [volunteers, setVolunteers] = useState([])
  const [grants, setGrants] = useState([])
  const [users, setUsers] = useState([])
  const [invites, setInvites] = useState([])
  const [dataLoading, setDataLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showGrantForm, setShowGrantForm] = useState(false)
  const [newGrant, setNewGrant] = useState({ title: '', funder: '', amount: '', stage: 'prospect', due_date: '', notes: '' })
  const [newInvite, setNewInvite] = useState({ email: '', role: 'volunteer', default_channel_id: '' })
  const [adminChannels, setAdminChannels] = useState([])
  const [adminDocs, setAdminDocs] = useState([])
  const [uploading, setUploading] = useState(false)
  const [uploadMsg, setUploadMsg] = useState('')
  const [newDoc, setNewDoc] = useState({ title: '', description: '', category: 'governance', access_level: 'staff' })
  const [inviting, setInviting] = useState(false)
  const [inviteMsg, setInviteMsg] = useState('')

  const isAdmin = user?.email === ADMIN_EMAIL || profile?.role === 'admin'

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/login'); return }
    if (!isAdmin && profile !== null) { router.push('/dashboard'); return }
    if (isAdmin) fetchData()
  }, [authLoading, user, profile, isAdmin]) // eslint-disable-line

  const fetchData = async () => {
    try {
      const [adminRes, grantsRes, usersRes, invitesRes, docsRes, channelsRes] = await Promise.all([
        fetch('/api/admin/data'),
        fetch('/api/admin/grants'),
        fetch('/api/admin/users'),
        fetch('/api/admin/invites'),
        fetch('/api/documents'),
        fetch('/api/messages/channels'),
      ])
      const adminData = await adminRes.json()
      const grantsData = await grantsRes.json()
      const usersData = await usersRes.json()
      const invitesData = await invitesRes.json()
      const docsData = await docsRes.json()
      setDonations(adminData.donations ?? [])
      setVolunteers(adminData.volunteers ?? [])
      setGrants(grantsData.grants ?? [])
      setUsers(usersData.users ?? [])
      setInvites(invitesData.invites ?? [])
      setAdminDocs(docsData.documents ?? [])
      setAdminChannels((await channelsRes.json()).channels ?? [])
    } catch (err) {
      console.error('Failed to load admin data:', err)
    } finally {
      setDataLoading(false)
    }
  }

  const updateVolunteerStatus = async (id, status) => {
    await fetch('/api/admin/volunteers', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    setVolunteers(prev => prev.map(v => v.id === id ? { ...v, status } : v))
  }

  const moveGrant = async (id, stage) => {
    await fetch('/api/admin/grants', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, stage }),
    })
    setGrants(prev => prev.map(g => g.id === id ? { ...g, stage } : g))
  }

  const addGrant = async (e) => {
    e.preventDefault()
    const res = await fetch('/api/admin/grants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newGrant),
    })
    const data = await res.json()
    if (data.grant) {
      setGrants(prev => [data.grant, ...prev])
      setShowGrantForm(false)
      setNewGrant({ title: '', funder: '', amount: '', stage: 'prospect', due_date: '', notes: '' })
    }
  }

  const sendInvite = async (e) => {
    e.preventDefault()
    setInviting(true)
    setInviteMsg('')
    const res = await fetch('/api/admin/invites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newInvite),
    })
    const data = await res.json()
    if (res.ok) {
      setInviteMsg(`Invite sent to ${newInvite.email}!`)
      setNewInvite({ email: '', role: 'volunteer' })
      setInvites(prev => [data.invite, ...prev])
    } else {
      setInviteMsg(data.error || 'Failed to send invite')
    }
    setInviting(false)
  }

  const updateUserRole = async (userId, role) => {
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role }),
    })
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u))
  }

  const revokeInvite = async (id) => {
    await fetch('/api/admin/invites', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setInvites(prev => prev.filter(i => i.id !== id))
  }

  const uploadDocument = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadMsg('')
    const fd = new FormData()
    fd.append('file', file)
    fd.append('title', newDoc.title || file.name)
    fd.append('description', newDoc.description)
    fd.append('category', newDoc.category)
    fd.append('access_level', newDoc.access_level)
    fd.append('uploaded_by', user?.id || '')
    const res = await fetch('/api/documents/upload', { method: 'POST', body: fd })
    const data = await res.json()
    if (res.ok) {
      setUploadMsg('Document uploaded successfully!')
      setAdminDocs(prev => [data.document, ...prev])
      setNewDoc({ title: '', description: '', category: 'governance', access_level: 'staff' })
    } else {
      setUploadMsg(data.error || 'Upload failed')
    }
    setUploading(false)
    e.target.value = ''
  }

  const deleteDocument = async (doc) => {
    if (!confirm(`Delete "${doc.title}"?`)) return
    await fetch('/api/documents', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: doc.id, file_path: doc.file_path }),
    })
    setAdminDocs(prev => prev.filter(d => d.id !== doc.id))
  }

  const openDocumentAdmin = async (doc) => {
    const res = await fetch(`/api/documents/url?path=${encodeURIComponent(doc.file_path)}`)
    const data = await res.json()
    if (data.url) window.open(data.url, '_blank')
  }

  const totalRaised = donations.reduce((sum, d) => sum + Number(d.amount), 0)
  const uniqueDonors = new Set(donations.map(d => d.donor_email)).size
  const activeVolunteers = volunteers.filter(v => v.status === 'approved' || v.status === 'active').length
  const awardedGrants = grants.filter(g => g.stage === 'awarded').reduce((sum, g) => sum + Number(g.amount || 0), 0)
  const filteredDonors = donations.filter(d =>
    !search || d.donor_name?.toLowerCase().includes(search.toLowerCase()) ||
    d.donor_email?.toLowerCase().includes(search.toLowerCase())
  )

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-soil" />
      </div>
    )
  }

  if (!user || (!isAdmin && profile !== null)) return null

  const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500'

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-charcoal">Admin CRM</h1>
            <p className="text-xs text-gray-400">{user.email}</p>
          </div>
          <SendReceiptsButton />
        </div>
      </div>

      <div className="bg-white border-b border-gray-200 px-4">
        <div className="max-w-6xl mx-auto flex gap-1 overflow-x-auto">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors -mb-px whitespace-nowrap ${
                activeTab === tab ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'
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
              <StatCard label="Total Raised" value={`$${totalRaised.toLocaleString()}`} color="green" />
              <StatCard label="Unique Donors" value={uniqueDonors} color="blue" />
              <StatCard label="Active Volunteers" value={activeVolunteers} color="purple" />
              <StatCard label="Grants Awarded" value={`$${awardedGrants.toLocaleString()}`} color="yellow" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Link href="/admin/tasks" className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-green-400 hover:shadow-sm transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Tasks & Follow-ups</p>
                    <p className="font-semibold text-charcoal">Manage tasks & deadlines →</p>
                    <p className="text-xs text-gray-400 mt-1">Track follow-ups, assign work, set due dates</p>
                  </div>
                  <span className="text-3xl">📌</span>
                </div>
              </Link>
              <Link href="/admin/timeline" className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-green-400 hover:shadow-sm transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Activity Timeline</p>
                    <p className="font-semibold text-charcoal">View all org activity →</p>
                    <p className="text-xs text-gray-400 mt-1">Donations, grants, volunteers, more</p>
                  </div>
                  <span className="text-3xl">📍</span>
                </div>
              </Link>
              <Link href="/admin/documents" className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-green-400 hover:shadow-sm transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Document Library</p>
                    <p className="font-semibold text-charcoal">Upload & manage internal docs →</p>
                    <p className="text-xs text-gray-400 mt-1">SOPs, governance policies, founding documents</p>
                  </div>
                  <span className="text-3xl">📁</span>
                </div>
              </Link>
              <Link href="/admin/channels" className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-green-400 hover:shadow-sm transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Channel Manager</p>
                    <p className="font-semibold text-charcoal">Manage channels & intros →</p>
                    <p className="text-xs text-gray-400 mt-1">Create channels, edit intro messages</p>
                  </div>
                  <span className="text-3xl">💬</span>
                </div>
              </Link>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-charcoal mb-3">Recent Donations</h2>
              {dataLoading ? <Loading /> : (
                <div className="divide-y divide-gray-100">
                  {donations.slice(0, 5).map(d => (
                    <div key={d.id} className="py-3 flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-charcoal">{d.donor_name ?? '—'}</p>
                        <p className="text-xs text-gray-400">{d.donor_email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-green-700">${Number(d.amount).toFixed(2)}</p>
                        <p className="text-xs text-gray-400">{d.donated_at ? new Date(d.donated_at).toLocaleDateString() : '—'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* GRANTS */}
        {activeTab === 'Grants' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-charcoal">Grant Pipeline</h2>
              <button onClick={() => setShowGrantForm(!showGrantForm)}
                className="px-3 py-1.5 bg-green-700 text-white text-sm font-medium rounded-lg hover:bg-green-800 transition-all">
                + Add Grant
              </button>
            </div>
            {showGrantForm && (
              <form onSubmit={addGrant} className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
                <h3 className="font-semibold text-sm text-charcoal">New Grant Opportunity</h3>
                <div className="grid grid-cols-2 gap-3">
                  <input required className={inputClass} placeholder="Grant title" value={newGrant.title}
                    onChange={e => setNewGrant({...newGrant, title: e.target.value})} />
                  <input required className={inputClass} placeholder="Funder" value={newGrant.funder}
                    onChange={e => setNewGrant({...newGrant, funder: e.target.value})} />
                  <input className={inputClass} placeholder="Amount ($)" type="number" value={newGrant.amount}
                    onChange={e => setNewGrant({...newGrant, amount: e.target.value})} />
                  <input className={inputClass} type="date" value={newGrant.due_date}
                    onChange={e => setNewGrant({...newGrant, due_date: e.target.value})} />
                </div>
                <select className={inputClass} value={newGrant.stage}
                  onChange={e => setNewGrant({...newGrant, stage: e.target.value})}>
                  {GRANT_STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
                <textarea className={inputClass} rows={2} placeholder="Notes..." value={newGrant.notes}
                  onChange={e => setNewGrant({...newGrant, notes: e.target.value})} />
                <div className="flex gap-2">
                  <button type="submit" className="px-4 py-2 bg-green-700 text-white text-sm font-medium rounded-lg hover:bg-green-800">Save</button>
                  <button type="button" onClick={() => setShowGrantForm(false)} className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200">Cancel</button>
                </div>
              </form>
            )}
            {dataLoading ? <Loading /> : (
              <div className="space-y-3">
                {GRANT_STAGES.map(stage => {
                  const stageGrants = grants.filter(g => g.stage === stage.id)
                  if (stageGrants.length === 0) return null
                  return (
                    <div key={stage.id} className="bg-white rounded-xl border border-gray-200 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${stage.color}`}>{stage.label}</span>
                        <span className="text-xs text-gray-400">{stageGrants.length} grant{stageGrants.length !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="space-y-3">
                        {stageGrants.map(grant => (
                          <div key={grant.id} className="border border-gray-100 rounded-lg p-3">
                            <div className="flex justify-between items-start mb-1">
                              <p className="text-sm font-semibold text-charcoal">{grant.title}</p>
                              {grant.amount && <p className="text-sm font-bold text-green-700">${Number(grant.amount).toLocaleString()}</p>}
                            </div>
                            <p className="text-xs text-gray-500 mb-1">{grant.funder}</p>
                            {grant.due_date && <p className="text-xs text-gray-400 mb-1">Due: {new Date(grant.due_date).toLocaleDateString()}</p>}
                            {grant.notes && <p className="text-xs text-gray-400 mb-2 italic">{grant.notes}</p>}
                            <div className="flex flex-wrap gap-1 mt-2">
                              {GRANT_STAGES.filter(s => s.id !== stage.id).map(s => (
                                <button key={s.id} onClick={() => moveGrant(grant.id, s.id)}
                                  className={`px-2 py-0.5 rounded text-xs font-medium ${s.color} opacity-70 hover:opacity-100 transition-opacity`}>
                                  → {s.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
                {grants.length === 0 && <div className="text-center py-12 text-gray-400 text-sm">No grants yet</div>}
              </div>
            )}
          </div>
        )}

        {/* DONORS */}
        {activeTab === 'Donors' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Search donors..." value={search} onChange={e => setSearch(e.target.value)} />
              <span className="text-xs text-gray-400 whitespace-nowrap">{filteredDonors.length} records</span>
            </div>
            {dataLoading ? <Loading /> : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead><tr className="bg-gray-50 border-b border-gray-200">
                    <Th>Donor</Th><Th>Email</Th><Th>Amount</Th><Th>Type</Th><Th>Status</Th><Th>Date</Th>
                  </tr></thead>
                  <tbody>
                    {filteredDonors.map(d => (
                      <tr key={d.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <Td>{d.donor_name ?? '—'}</Td>
                        <Td>{d.donor_email ?? '—'}</Td>
                        <Td className="font-medium text-green-700">${Number(d.amount).toFixed(2)}</Td>
                        <Td>{d.donation_type}</Td>
                        <Td><StatusBadge status={d.status} /></Td>
                        <Td>{d.donated_at ? new Date(d.donated_at).toLocaleDateString() : '—'}</Td>
                      </tr>
                    ))}
                    {filteredDonors.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm italic">No records found</td></tr>}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* VOLUNTEERS */}
        {activeTab === 'Volunteers' && (
          <div className="space-y-4">
            <h2 className="font-semibold text-charcoal">Volunteer Applications</h2>
            {dataLoading ? <Loading /> : (
              <div className="space-y-3">
                {volunteers.map(v => (
                  <div key={v.id} className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-sm text-charcoal">{v.name ?? '—'}</p>
                        <p className="text-xs text-gray-400">{v.email}</p>
                      </div>
                      <StatusBadge status={v.status ?? 'pending'} />
                    </div>
                    <p className="text-xs text-gray-500 mb-1">
                      <span className="font-medium">Interests:</span> {Array.isArray(v.interests) ? v.interests.join(', ') : (v.interests ?? '—')}
                    </p>
                    <p className="text-xs text-gray-500 mb-3">
                      <span className="font-medium">Availability:</span> {v.availability ?? '—'}
                    </p>
                    <div className="flex gap-2">
                      {['pending', 'approved', 'active', 'declined'].map(s => (
                        <button key={s} onClick={() => updateVolunteerStatus(v.id, s)}
                          className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                            v.status === s ? 'bg-green-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {volunteers.length === 0 && <div className="text-center py-12 text-gray-400 text-sm">No volunteer applications yet</div>}
              </div>
            )}
          </div>
        )}

        {/* USERS */}
        {activeTab === 'Users' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-charcoal mb-3">Send Invite</h2>
              <form onSubmit={sendInvite} className="flex flex-wrap gap-3 items-end">
                <div className="flex-1 min-w-48">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                  <input required type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="email@example.com"
                    value={newInvite.email}
                    onChange={e => setNewInvite({...newInvite, email: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
                  <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={newInvite.role} onChange={e => setNewInvite({...newInvite, role: e.target.value})}>
                    <option value="donor">Donor</option>
                    <option value="volunteer">Volunteer</option>
                    <option value="staff">Staff</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Assign to Channel</label>
                  <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={newInvite.default_channel_id} onChange={e => setNewInvite({...newInvite, default_channel_id: e.target.value})}>
                    <option value="">General only</option>
                    {adminChannels.map(ch => (
                      <option key={ch.id} value={ch.id}>#{ch.name}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" disabled={inviting}
                  className="px-4 py-2 bg-green-700 text-white text-sm font-semibold rounded-lg hover:bg-green-800 disabled:opacity-50 transition-all">
                  {inviting ? 'Sending...' : 'Send Invite'}
                </button>
              </form>
              {inviteMsg && (
                <p className={`text-sm mt-3 font-medium ${inviteMsg.includes('sent') ? 'text-green-700' : 'text-red-600'}`}>
                  {inviteMsg}
                </p>
              )}
            </div>

            {invites.filter(i => !i.used_at).length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="font-semibold text-charcoal mb-3">Pending Invites</h2>
                <div className="space-y-2">
                  {invites.filter(i => !i.used_at).map(invite => (
                    <div key={invite.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-charcoal">{invite.email}</p>
                        <p className="text-xs text-gray-400 capitalize">{invite.role} · Expires {new Date(invite.expires_at).toLocaleDateString()}</p>
                      </div>
                      <button onClick={() => revokeInvite(invite.id)}
                        className="px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all">
                        Revoke
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-charcoal">
                  All Users <span className="text-gray-400 font-normal text-sm">({users.length})</span>
                </h2>
              </div>
              {dataLoading ? <Loading /> : (
                <div className="divide-y divide-gray-100">
                  {users.map(u => (
                    <div key={u.id} className="px-5 py-3 flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-charcoal truncate">
                          {u.profile?.first_name ? `${u.profile.first_name} ${u.profile.last_name || ''}`.trim() : u.email}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{u.email}</p>
                        {u.last_sign_in && (
                          <p className="text-xs text-gray-300">Last seen {new Date(u.last_sign_in).toLocaleDateString()}</p>
                        )}
                      </div>
                      <select
                        className="px-2 py-1 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={u.role}
                        onChange={e => updateUserRole(u.id, e.target.value)}>
                        <option value="donor">Donor</option>
                        <option value="volunteer">Volunteer</option>
                        <option value="staff">Staff</option>
                        <option value="admin">Admin</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>
                  ))}
                  {users.length === 0 && (
                    <div className="px-5 py-8 text-center text-gray-400 text-sm">No users yet</div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* DOCUMENTS */}
        {activeTab === 'Documents' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-charcoal mb-4">Upload Document</h2>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
                  <input className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Document title (optional)"
                    value={newDoc.title}
                    onChange={e => setNewDoc({...newDoc, title: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={newDoc.category} onChange={e => setNewDoc({...newDoc, category: e.target.value})}>
                    <option value="governance">Governance</option>
                    <option value="founding">Founding Documents</option>
                    <option value="sops">SOPs</option>
                    <option value="templates">Templates</option>
                    <option value="financial">Financial</option>
                    <option value="general">General</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                  <input className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Brief description (optional)"
                    value={newDoc.description}
                    onChange={e => setNewDoc({...newDoc, description: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Access Level</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={newDoc.access_level} onChange={e => setNewDoc({...newDoc, access_level: e.target.value})}>
                    <option value="volunteer">Volunteer+</option>
                    <option value="staff">Staff+</option>
                    <option value="board">Board only</option>
                    <option value="admin">Admin only</option>
                  </select>
                </div>
              </div>
              <label className={`flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={uploadDocument} disabled={uploading} />
                <span className="text-2xl">📎</span>
                <span className="text-sm font-medium text-gray-600">{uploading ? 'Uploading...' : 'Click to upload PDF or Word doc'}</span>
              </label>
              {uploadMsg && <p className={`text-sm mt-2 font-medium ${uploadMsg.includes('success') ? 'text-green-700' : 'text-red-600'}`}>{uploadMsg}</p>}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-charcoal">All Documents <span className="text-gray-400 font-normal text-sm">({adminDocs.length})</span></h2>
              </div>
              {dataLoading ? <Loading /> : (
                <div className="divide-y divide-gray-100">
                  {adminDocs.map(doc => (
                    <div key={doc.id} className="px-5 py-3 flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-charcoal truncate">{doc.title}</p>
                        <p className="text-xs text-gray-400 capitalize">{doc.category} · {doc.access_level} · {new Date(doc.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => openDocumentAdmin(doc)}
                          className="px-3 py-1 text-xs font-medium text-green-700 hover:bg-green-50 rounded-lg transition-all">
                          Open
                        </button>
                        <button onClick={() => deleteDocument(doc)}
                          className="px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all">
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                  {adminDocs.length === 0 && <div className="px-5 py-8 text-center text-gray-400 text-sm">No documents uploaded yet</div>}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </main>
  )
}

function StatCard({ label, value, color }) {
  const colors = {
    green: 'bg-green-50 text-green-700 border-green-100',
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    purple: 'bg-purple-50 text-purple-700 border-purple-100',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-100',
  }
  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <p className="text-xs font-medium opacity-70 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}

function StatusBadge({ status }) {
  const colors = {
    completed: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-blue-100 text-blue-700',
    active: 'bg-green-100 text-green-700',
    declined: 'bg-red-100 text-red-700',
    failed: 'bg-red-100 text-red-700',
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status ?? 'pending'}
    </span>
  )
}

function Th({ children }) {
  return <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">{children}</th>
}

function Td({ children, className = '' }) {
  return <td className={`px-4 py-3 text-gray-700 text-sm ${className}`}>{children}</td>
}

function Loading() {
  return <div className="py-8 text-center text-gray-400 text-sm">Loading...</div>
}
