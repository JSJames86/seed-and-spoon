'use client'

import { useState, useEffect, Suspense } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'

const CATEGORIES = {
  governance: { label: 'Governance', icon: '⚖️', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  founding: { label: 'Founding Documents', icon: '🏛️', color: 'bg-green-50 text-green-700 border-green-200' },
  sops: { label: 'SOPs', icon: '📋', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  templates: { label: 'Templates', icon: '📄', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  financial: { label: 'Financial', icon: '💰', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  general: { label: 'General', icon: '📁', color: 'bg-gray-50 text-gray-700 border-gray-200' },
}

function formatSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function DocumentsPage() {
  const { user, profile } = useAuth()
  const [ndaSigned, setNdaSigned] = useState(false)
  const [ndaLoading, setNdaLoading] = useState(true)
  const [signing, setSigning] = useState(false)
  const [documents, setDocuments] = useState([])
  const [docsLoading, setDocsLoading] = useState(false)
  const [activeCategory, setActiveCategory] = useState('all')
  const [downloading, setDownloading] = useState(null)

  useEffect(() => {
    if (!user) return
    fetch(`/api/documents/nda?userId=${user.id}`)
      .then(r => r.json())
      .then(data => {
        setNdaSigned(data.signed)
        setNdaLoading(false)
        if (data.signed) fetchDocuments()
      })
  }, [user])

  const fetchDocuments = async () => {
    setDocsLoading(true)
    const res = await fetch('/api/documents')
    const data = await res.json()
    setDocuments(data.documents || [])
    setDocsLoading(false)
  }

  const signNda = async () => {
    setSigning(true)
    await fetch('/api/documents/nda', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id }),
    })
    setNdaSigned(true)
    setSigning(false)
    fetchDocuments()
  }

  const openDocument = async (doc) => {
    setDownloading(doc.id)
    const res = await fetch(`/api/documents/url?path=${encodeURIComponent(doc.file_path)}`)
    const data = await res.json()
    if (data.url) {
        const a = document.createElement('a')
        a.href = data.url
        a.target = '_blank'
        a.rel = 'noopener noreferrer'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      }
    setDownloading(null)
  }

  const filtered = activeCategory === 'all'
    ? documents
    : documents.filter(d => d.category === activeCategory)

  const grouped = filtered.reduce((acc, doc) => {
    acc[doc.category] = acc[doc.category] || []
    acc[doc.category].push(doc)
    return acc
  }, {})

  if (ndaLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-cream flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-700" />
        </div>
      </ProtectedRoute>
    )
  }

  if (!ndaSigned) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-cream flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-lg max-w-2xl w-full p-8">
            <div className="text-center mb-6">
              <p className="text-4xl mb-3">🔒</p>
              <h1 className="text-2xl font-bold text-charcoal">Internal Document Library</h1>
              <p className="text-gray-500 text-sm mt-2">Access requires signing a confidentiality agreement</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 text-sm text-gray-700 space-y-3 mb-6 max-h-72 overflow-y-auto">
              <p className="font-bold text-charcoal">SEED & SPOON, INC. — CONFIDENTIALITY AGREEMENT</p>
              <p>By accessing the internal document library, you agree to the following terms:</p>
              <p><strong>1. Confidentiality.</strong> All documents, policies, procedures, financial information, and organizational materials accessed through this library are strictly confidential. You agree not to share, copy, distribute, or disclose any such materials to individuals outside of Seed & Spoon, Incorporated without prior written authorization from the Executive Director.</p>
              <p><strong>2. Authorized Use Only.</strong> Documents accessed through this library are provided solely for use in connection with your role with Seed & Spoon. You agree to use these materials only for purposes directly related to your authorized responsibilities.</p>
              <p><strong>3. Return of Materials.</strong> Upon termination of your relationship with Seed & Spoon, you agree to promptly delete, destroy, or return any copies of internal documents in your possession.</p>
              <p><strong>4. No Unauthorized Reproduction.</strong> You agree not to reproduce, publish, or otherwise make available any internal document in any form without authorization.</p>
              <p><strong>5. Acknowledgment.</strong> You acknowledge that unauthorized disclosure of confidential materials may result in termination of your relationship with Seed & Spoon and may expose you to legal liability.</p>
              <p className="text-gray-400 text-xs">This agreement is electronically recorded with your account ID, IP address, and timestamp.</p>
            </div>

            <p className="text-sm text-gray-500 text-center mb-4">
              Signing as <span className="font-semibold text-charcoal">{user?.email}</span>
            </p>

            <button onClick={signNda} disabled={signing}
              className="w-full py-3 bg-green-700 text-white font-bold rounded-xl hover:bg-green-800 disabled:opacity-50 transition-all">
              {signing ? 'Recording signature...' : 'I Agree — Sign & Access Documents'}
            </button>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-cream">
        <div className="bg-white border-b border-gray-200 px-4 py-5">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold text-charcoal">Internal Document Library</h1>
            <p className="text-gray-400 text-sm mt-0.5">Confidential — authorized access only</p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-6">
          {/* Category filter */}
          <div className="flex gap-2 flex-wrap mb-6">
            <button onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeCategory === 'all' ? 'bg-charcoal text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}>
              All ({documents.length})
            </button>
            {Object.entries(CATEGORIES).map(([key, cat]) => {
              const count = documents.filter(d => d.category === key).length
              if (count === 0) return null
              return (
                <button key={key} onClick={() => setActiveCategory(key)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    activeCategory === key ? 'bg-charcoal text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}>
                  {cat.icon} {cat.label} ({count})
                </button>
              )
            })}
          </div>

          {docsLoading ? (
            <div className="text-center py-16 text-gray-400">Loading documents...</div>
          ) : documents.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">📂</p>
              <p className="text-gray-500 font-medium">No documents uploaded yet</p>
              {(profile?.role === 'admin' || profile?.role === 'staff') && (
                <p className="text-gray-400 text-sm mt-1">Upload documents from the Admin CRM → Documents tab</p>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {activeCategory === 'all'
                ? Object.entries(grouped).map(([cat, docs]) => (
                    <CategorySection key={cat} category={cat} docs={docs} onOpen={openDocument} downloading={downloading} />
                  ))
                : <CategorySection category={activeCategory} docs={filtered} onOpen={openDocument} downloading={downloading} />
              }
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}

function CategorySection({ category, docs, onOpen, downloading }) {
  const cat = CATEGORIES[category] || CATEGORIES.general
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{cat.icon}</span>
        <h2 className="font-semibold text-charcoal">{cat.label}</h2>
        <span className="text-xs text-gray-400">{docs.length} document{docs.length !== 1 ? 's' : ''}</span>
      </div>
      <div className="grid gap-3">
        {docs.map(doc => (
          <div key={doc.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="text-2xl flex-shrink-0">
                {doc.mime_type?.includes('pdf') ? '📕' : '📄'}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-charcoal text-sm truncate">{doc.title}</p>
                {doc.description && <p className="text-xs text-gray-400 truncate">{doc.description}</p>}
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`px-1.5 py-0.5 rounded text-xs font-medium border ${cat.color}`}>{cat.label}</span>
                  {doc.file_size && <span className="text-xs text-gray-300">{formatSize(doc.file_size)}</span>}
                  <span className="text-xs text-gray-300">{new Date(doc.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <button onClick={() => onOpen(doc)} disabled={downloading === doc.id}
              className="px-3 py-1.5 bg-green-700 text-white text-xs font-semibold rounded-lg hover:bg-green-800 disabled:opacity-50 transition-all flex-shrink-0">
              {downloading === doc.id ? '...' : 'Open'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
