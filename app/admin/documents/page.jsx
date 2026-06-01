'use client'

import { useEffect, useState, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const ADMIN_EMAIL = 'janelle.shanise@gmail.com'

const CATEGORIES = [
  { value: 'governance', label: 'Governance' },
  { value: 'founding', label: 'Founding Documents' },
  { value: 'sops', label: 'SOPs' },
  { value: 'templates', label: 'Templates' },
  { value: 'financial', label: 'Financial' },
  { value: 'general', label: 'General' },
]

const ACCESS_LEVELS = [
  { value: 'volunteer', label: 'Volunteer+' },
  { value: 'staff', label: 'Staff+' },
  { value: 'board', label: 'Board only' },
  { value: 'admin', label: 'Admin only' },
]

function formatSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function AdminDocumentsPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const fileRef = useRef(null)

  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [form, setForm] = useState({
    title: '', description: '', category: 'governance', access_level: 'staff'
  })

  const isAdmin = user?.email === ADMIN_EMAIL || profile?.role === 'admin'

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/login'); return }
    if (!isAdmin && profile !== null) { router.push('/dashboard'); return }
    if (isAdmin) fetchDocs()
  }, [authLoading, user, profile, isAdmin]) // eslint-disable-line

  const fetchDocs = async () => {
    try {
      const res = await fetch('/api/documents')
      const data = await res.json()
      setDocs(data.documents || [])
    } catch (err) {
      console.error('Failed to load docs:', err)
    }
    setLoading(false)
  }

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setMsg('')
    const fd = new FormData()
    fd.append('file', file)
    fd.append('title', form.title || file.name)
    fd.append('description', form.description)
    fd.append('category', form.category)
    fd.append('access_level', form.access_level)
    fd.append('uploaded_by', user?.id || '')
    try {
      const res = await fetch('/api/documents/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (res.ok) {
        setMsg('✅ Uploaded successfully!')
        setDocs(prev => [data.document, ...prev])
        setForm({ title: '', description: '', category: 'governance', access_level: 'staff' })
        if (fileRef.current) fileRef.current.value = ''
      } else {
        setMsg(`❌ ${data.error || 'Upload failed'}`)
      }
    } catch (err) {
      setMsg(`❌ Upload failed: ${err.message}`)
    }
    setUploading(false)
  }

  const handleDelete = async (doc) => {
    if (!confirm(`Delete "${doc.title}"?`)) return
    try {
      await fetch('/api/documents', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: doc.id, file_path: doc.file_path }),
      })
      setDocs(prev => prev.filter(d => d.id !== doc.id))
    } catch (err) {
      alert('Delete failed.')
    }
  }

  const startEdit = (doc) => {
    setEditingId(doc.id)
    setEditForm({ title: doc.title, description: doc.description || '', category: doc.category, access_level: doc.access_level })
  }

  const saveEdit = async (doc) => {
    try {
      const res = await fetch('/api/documents', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: doc.id, ...editForm }),
      })
      const data = await res.json()
      if (res.ok) {
        setDocs(prev => prev.map(d => d.id === doc.id ? data.document : d))
        setEditingId(null)
      }
    } catch (err) {
      alert('Save failed.')
    }
  }

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-700" />
      </div>
    )
  }

  if (!isAdmin && profile) return null

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link href="/admin" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            ← Admin CRM
          </Link>
          <h1 className="text-xl font-bold text-charcoal">Document Library</h1>
          <span className="text-xs text-gray-400 ml-auto">{docs.length} documents</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        {/* Upload Form */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-charcoal mb-4">Upload Document</h2>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
              <input className={inputClass} placeholder="e.g. Conflict of Interest Policy"
                value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
              <select className={inputClass} value={form.category}
                onChange={e => setForm({...form, category: e.target.value})}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
              <input className={inputClass} placeholder="Brief description"
                value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Access Level</label>
              <select className={inputClass} value={form.access_level}
                onChange={e => setForm({...form, access_level: e.target.value})}>
                {ACCESS_LEVELS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
            </div>
          </div>

          <label className={`flex items-center justify-center gap-3 px-4 py-5 border-2 border-dashed rounded-xl cursor-pointer transition-all ${uploading ? 'border-gray-200 bg-gray-50 cursor-not-allowed' : 'border-green-300 hover:border-green-500 hover:bg-green-50'}`}>
            <input ref={fileRef} type="file" className="hidden"
              accept=".pdf,.doc,.docx,.png,.jpg"
              onChange={handleUpload} disabled={uploading} />
            <span className="text-3xl">{uploading ? '⏳' : '📎'}</span>
            <div>
              <p className="font-semibold text-gray-700 text-sm">{uploading ? 'Uploading...' : 'Click to choose a file'}</p>
              <p className="text-xs text-gray-400">PDF, Word, or images up to 50MB</p>
            </div>
          </label>

          {msg && (
            <p className={`text-sm mt-3 font-medium ${msg.startsWith('✅') ? 'text-green-700' : 'text-red-600'}`}>
              {msg}
            </p>
          )}
        </div>

        {/* Documents List */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-charcoal">All Documents</h2>
          </div>

          {loading ? (
            <div className="py-12 text-center text-gray-400 text-sm">Loading...</div>
          ) : docs.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-4xl mb-2">📂</p>
              <p className="text-gray-400 text-sm">No documents uploaded yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {docs.map(doc => (
                <div key={doc.id} className="px-6 py-4">
                  {editingId === doc.id ? (
                    <div className="space-y-2">
                      <input className={inputClass} value={editForm.title}
                        onChange={e => setEditForm({...editForm, title: e.target.value})}
                        placeholder="Title" />
                      <input className={inputClass} value={editForm.description}
                        onChange={e => setEditForm({...editForm, description: e.target.value})}
                        placeholder="Description" />
                      <div className="grid grid-cols-2 gap-2">
                        <select className={inputClass} value={editForm.category}
                          onChange={e => setEditForm({...editForm, category: e.target.value})}>
                          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                        <select className={inputClass} value={editForm.access_level}
                          onChange={e => setEditForm({...editForm, access_level: e.target.value})}>
                          {ACCESS_LEVELS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                        </select>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button onClick={() => saveEdit(doc)}
                          className="px-4 py-1.5 bg-green-700 text-white text-xs font-semibold rounded-lg hover:bg-green-800">
                          Save
                        </button>
                        <button onClick={() => setEditingId(null)}
                          className="px-4 py-1.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-200">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-2xl flex-shrink-0">
                          {doc.mime_type?.includes('pdf') ? '📕' : '📄'}
                        </span>
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-charcoal truncate">{doc.title}</p>
                          {doc.description && <p className="text-xs text-gray-400 truncate">{doc.description}</p>}
                          <p className="text-xs text-gray-300 capitalize">
                            {doc.category} · {doc.access_level} · {formatSize(doc.file_size)} · {new Date(doc.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        {/* Plain anchor tag — no JS, works on Safari */}
                        <a
                          href={`/api/documents/url?path=${encodeURIComponent(doc.file_path)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-green-700 text-white text-xs font-semibold rounded-lg hover:bg-green-800 transition-all"
                        >
                          Open
                        </a>
                        <button onClick={() => startEdit(doc)}
                          className="px-3 py-1.5 text-blue-600 text-xs font-semibold rounded-lg hover:bg-blue-50 transition-all border border-blue-200">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(doc)}
                          className="px-3 py-1.5 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-50 transition-all border border-red-200">
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
