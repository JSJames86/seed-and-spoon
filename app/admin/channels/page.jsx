'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const ADMIN_EMAIL = 'janelle.shanise@gmail.com'

export default function AdminChannelsPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const [channels, setChannels] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [newChannel, setNewChannel] = useState({ name: '', description: '', intro: '', intro_author: 'Janelle' })
  const [showNew, setShowNew] = useState(false)
  const [msg, setMsg] = useState('')

  const isAdmin = user?.email === ADMIN_EMAIL || profile?.role === 'admin'

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/login'); return }
    if (!isAdmin && profile !== null) { router.push('/dashboard'); return }
    if (isAdmin) fetchChannels()
  }, [authLoading, user, profile, isAdmin]) // eslint-disable-line

  const fetchChannels = async () => {
    const res = await fetch('/api/messages/channels')
    const data = await res.json()
    setChannels(data.channels || [])
    setLoading(false)
  }

  const startEdit = (ch) => {
    setEditingId(ch.id)
    setEditForm({ name: ch.name, description: ch.description || '', intro: ch.intro || '', intro_author: ch.intro_author || 'Janelle' })
  }

  const saveEdit = async (ch) => {
    const res = await fetch('/api/messages/channels', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: ch.id, ...editForm }),
    })
    const data = await res.json()
    if (res.ok) {
      setChannels(prev => prev.map(c => c.id === ch.id ? data.channel : c))
      setEditingId(null)
      setMsg('✅ Saved!')
      setTimeout(() => setMsg(''), 2000)
    }
  }

  const createChannel = async () => {
    if (!newChannel.name.trim()) return
    const res = await fetch('/api/messages/channels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newChannel),
    })
    const data = await res.json()
    if (res.ok) {
      setChannels(prev => [...prev, data.channel])
      setNewChannel({ name: '', description: '', intro: '', intro_author: 'Janelle' })
      setShowNew(false)
      setMsg('✅ Channel created!')
      setTimeout(() => setMsg(''), 2000)
    }
  }

  const deleteChannel = async (ch) => {
    if (!confirm(`Delete #${ch.name}? All messages will be lost.`)) return
    await fetch('/api/messages/channels', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: ch.id }),
    })
    setChannels(prev => prev.filter(c => c.id !== ch.id))
  }

  if (authLoading || (!user && !authLoading)) {
    return <div className="min-h-screen flex items-center justify-center bg-cream"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-700" /></div>
  }

  if (!isAdmin && profile) return null

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link href="/admin" className="text-sm text-gray-400 hover:text-gray-600">← Admin CRM</Link>
          <h1 className="text-xl font-bold text-charcoal">Channel Manager</h1>
          <div className="ml-auto flex items-center gap-3">
            {msg && <span className="text-sm font-medium text-green-700">{msg}</span>}
            <button onClick={() => setShowNew(!showNew)}
              className="px-4 py-2 bg-green-700 text-white text-sm font-semibold rounded-lg hover:bg-green-800 transition-all">
              + New Channel
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">

        {/* New channel form */}
        {showNew && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
            <h2 className="font-semibold text-charcoal">Create Channel</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Channel Name</label>
                <input className={inputClass} placeholder="e.g. gardens"
                  value={newChannel.name} onChange={e => setNewChannel({...newChannel, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                <input className={inputClass} placeholder="One-line description"
                  value={newChannel.description} onChange={e => setNewChannel({...newChannel, description: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Intro Author</label>
              <input className={inputClass} placeholder="Janelle"
                value={newChannel.intro_author} onChange={e => setNewChannel({...newChannel, intro_author: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Channel Intro Message</label>
              <textarea className={inputClass} rows={4}
                placeholder="Welcome message shown at the top of the channel..."
                value={newChannel.intro} onChange={e => setNewChannel({...newChannel, intro: e.target.value})} />
            </div>
            <div className="flex gap-2">
              <button onClick={createChannel} className="px-4 py-2 bg-green-700 text-white text-sm font-semibold rounded-lg hover:bg-green-800">Create</button>
              <button onClick={() => setShowNew(false)} className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200">Cancel</button>
            </div>
          </div>
        )}

        {/* Channel list */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : (
          <div className="space-y-3">
            {channels.map(ch => (
              <div key={ch.id} className="bg-white rounded-xl border border-gray-200 p-5">
                {editingId === ch.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                        <input className={inputClass} value={editForm.name}
                          onChange={e => setEditForm({...editForm, name: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                        <input className={inputClass} value={editForm.description}
                          onChange={e => setEditForm({...editForm, description: e.target.value})} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Intro Author</label>
                      <input className={inputClass} value={editForm.intro_author}
                        onChange={e => setEditForm({...editForm, intro_author: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Intro Message</label>
                      <textarea className={inputClass} rows={6} value={editForm.intro}
                        onChange={e => setEditForm({...editForm, intro: e.target.value})}
                        placeholder="Welcome message shown at top of channel..." />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => saveEdit(ch)} className="px-4 py-2 bg-green-700 text-white text-sm font-semibold rounded-lg hover:bg-green-800">Save</button>
                      <button onClick={() => setEditingId(null)} className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <p className="font-semibold text-charcoal"># {ch.name}</p>
                        {ch.description && <p className="text-xs text-gray-400 mt-0.5">{ch.description}</p>}
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => startEdit(ch)}
                          className="px-3 py-1 text-blue-600 text-xs font-semibold rounded-lg hover:bg-blue-50 border border-blue-200">
                          Edit
                        </button>
                        <button onClick={() => deleteChannel(ch)}
                          className="px-3 py-1 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-50 border border-red-200">
                          Delete
                        </button>
                      </div>
                    </div>
                    {ch.intro ? (
                      <div className="bg-gray-50 rounded-lg p-3 mt-2">
                        <p className="text-xs font-medium text-gray-500 mb-1">Intro by {ch.intro_author}</p>
                        <p className="text-xs text-gray-600 whitespace-pre-line line-clamp-3">{ch.intro}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-300 italic mt-1">No intro set</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
