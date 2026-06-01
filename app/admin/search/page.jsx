'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

const ADMIN_EMAIL = 'janelle.shanise@gmail.com'

const TYPE_COLORS = {
  donor:     'bg-green-100 text-green-700',
  grant:     'bg-blue-100 text-blue-700',
  volunteer: 'bg-purple-100 text-purple-700',
  document:  'bg-yellow-100 text-yellow-700',
  task:      'bg-orange-100 text-orange-700',
  message:   'bg-gray-100 text-gray-600',
}

function SearchContent() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [searched, setSearched] = useState(false)
  const inputRef = useRef(null)
  const debounceRef = useRef(null)

  const isAdmin = user?.email === ADMIN_EMAIL || profile?.role === 'admin'

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/login'); return }
    if (!isAdmin && profile !== null) { router.push('/dashboard'); return }
    inputRef.current?.focus()
    if (query) runSearch(query)
  }, [authLoading, user, profile, isAdmin]) // eslint-disable-line

  const runSearch = async (q) => {
    if (!q || q.length < 2) { setResults([]); setSearched(false); return }
    setSearching(true)
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
    const data = await res.json()
    setResults(data.results || [])
    setSearched(true)
    setSearching(false)
  }

  const handleChange = (e) => {
    const val = e.target.value
    setQuery(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => runSearch(val), 300)
  }

  const grouped = results.reduce((acc, r) => {
    acc[r.type] = acc[r.type] || []
    acc[r.type].push(r)
    return acc
  }, {})

  const TYPE_LABELS = {
    donor: 'Donors', grant: 'Grants', volunteer: 'Volunteers',
    document: 'Documents', task: 'Tasks', message: 'Messages'
  }

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-700" />
    </div>
  )

  if (!isAdmin && profile) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-sm text-gray-400 hover:text-gray-600 flex-shrink-0">← Admin</Link>
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"
                placeholder="Search donors, grants, volunteers, documents, tasks, messages..."
                value={query}
                onChange={handleChange}
                autoFocus
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              {searching && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {!searched && !searching && (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-lg font-semibold text-gray-700">Search everything</p>
            <p className="text-gray-400 text-sm mt-1">Donors, grants, volunteers, documents, tasks, messages</p>
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {['Tiffany', 'Wells Fargo', 'consumer affairs', 'NDA', 'whistleblower'].map(hint => (
                <button key={hint} onClick={() => { setQuery(hint); runSearch(hint) }}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition-all">
                  {hint}
                </button>
              ))}
            </div>
          </div>
        )}

        {searched && results.length === 0 && (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">🤷</p>
            <p className="font-semibold text-gray-700">No results for "{query}"</p>
            <p className="text-gray-400 text-sm mt-1">Try a different name, keyword, or phrase</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-6">
            <p className="text-xs text-gray-400">{results.length} result{results.length !== 1 ? 's' : ''} for "{query}"</p>
            {Object.entries(grouped).map(([type, items]) => (
              <div key={type}>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{TYPE_LABELS[type]}</p>
                <div className="space-y-1.5">
                  {items.map(result => (
                    result.external ? (
                      <a key={result.id} href={result.href} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 px-4 py-3 hover:border-green-400 hover:shadow-sm transition-all">
                        <span className="text-xl flex-shrink-0">{result.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-charcoal truncate">{result.title}</p>
                          {result.subtitle && <p className="text-xs text-gray-400 truncate">{result.subtitle}</p>}
                        </div>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${TYPE_COLORS[result.type]}`}>
                          {result.type}
                        </span>
                      </a>
                    ) : (
                      <Link key={result.id} href={result.href}
                        className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 px-4 py-3 hover:border-green-400 hover:shadow-sm transition-all">
                        <span className="text-xl flex-shrink-0">{result.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-charcoal truncate">{result.title}</p>
                          {result.subtitle && <p className="text-xs text-gray-400 truncate">{result.subtitle}</p>}
                        </div>
                        <span className={`px-2 py-0 .5 rounded text-xs font-medium flex-shrink-0 ${TYPE_COLORS[result.type]}`}>
                          {result.type}
                        </span>
                      </Link>
                    )
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

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-cream"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-700" /></div>}>
      <SearchContent />
    </Suspense>
  )
}
