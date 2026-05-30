'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import { supabase } from '@/lib/supabase'

const HASH_COLORS = ['bg-green-600', 'bg-blue-600', 'bg-purple-600', 'bg-orange-500', 'bg-pink-600', 'bg-teal-600']

function avatarColor(name) {
  let hash = 0
  for (let i = 0; i < (name || '').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return HASH_COLORS[Math.abs(hash) % HASH_COLORS.length]
}

function initials(name) {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function fmtTime(ts) {
  const d = new Date(ts)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  return isToday
    ? d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

export default function MessagesPage() {
  const { user, profile } = useAuth()
  const [channels, setChannels] = useState([])
  const [activeChannel, setActiveChannel] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    fetch('/api/messages/channels')
      .then(r => r.json())
      .then(data => {
        if (data.channels?.length) {
          setChannels(data.channels)
          setActiveChannel(data.channels[0])
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!activeChannel) return
    setMessages([])
    fetch(`/api/messages?channel_id=${activeChannel.id}`)
      .then(r => r.json())
      .then(data => setMessages(data.messages || []))

    const sub = supabase
      .channel(`messages:${activeChannel.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `channel_id=eq.${activeChannel.id}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new])
      })
      .subscribe()

    return () => supabase.removeChannel(sub)
  }, [activeChannel])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim() || !activeChannel || sending || !user) return
    setSending(true)

    const username = profile?.first_name
      ? `${profile.first_name} ${profile.last_name || ''}`.trim()
      : (profile?.username || user?.email?.split('@')[0] || 'Unknown')

    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel_id: activeChannel.id,
        sender_id: user.id,
        username,
        content: input.trim(),
      }),
    })

    setInput('')
    setSending(false)
    inputRef.current?.focus()
  }

  const displayName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name || ''}`.trim()
    : (profile?.username || user?.email?.split('@')[0] || '?')

  return (
    <ProtectedRoute>
      <div className="flex bg-gray-900 text-white overflow-hidden" style={{ height: 'calc(100vh - 60px)' }}>

        {/* Sidebar */}
        <div className="w-52 bg-gray-900 border-r border-gray-700 flex flex-col flex-shrink-0">
          <div className="px-3 py-4 border-b border-gray-700">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Seed & Spoon</p>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Channels</p>
            {loading ? (
              <p className="px-3 text-xs text-gray-500">Loading...</p>
            ) : channels.map(ch => (
              <button key={ch.id} onClick={() => setActiveChannel(ch)}
                className={`w-full text-left px-3 py-1.5 text-sm transition-colors ${
                  activeChannel?.id === ch.id
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                }`}>
                # {ch.name}
              </button>
            ))}
          </div>
          <div className="px-3 py-3 border-t border-gray-700 flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${avatarColor(displayName)}`}>
              {initials(displayName)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">{displayName}</p>
              <p className="text-xs text-green-400">● online</p>
            </div>
          </div>
        </div>

        {/* Chat */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="px-4 py-3 border-b border-gray-700 bg-gray-800 flex items-center gap-2">
            <span className="text-gray-400 font-bold">#</span>
            <span className="font-semibold text-white">{activeChannel?.name}</span>
            {activeChannel?.description && (
              <span className="text-gray-400 text-xs hidden sm:block">— {activeChannel.description}</span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 bg-gray-800">
            {messages.length === 0 && activeChannel && (
              <div className="text-center py-16">
                <p className="text-3xl mb-2">#</p>
                <p className="text-white font-bold">Welcome to #{activeChannel.name}!</p>
                {activeChannel.description && <p className="text-gray-400 text-sm mt-1">{activeChannel.description}</p>}
              </div>
            )}
            {messages.map((msg, i) => {
              const prev = messages[i - 1]
              const grouped = prev && prev.username === msg.username &&
                new Date(msg.created_at) - new Date(prev.created_at) < 300000

              if (grouped) return (
                <div key={msg.id} className="pl-10 px-1">
                  <p className="text-gray-200 text-sm">{msg.content}</p>
                </div>
              )

              return (
                <div key={msg.id} className="flex gap-3 pt-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${avatarColor(msg.username)}`}>
                    {initials(msg.username)}
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-semibold text-white text-sm">{msg.username}</span>
                      <span className="text-xs text-gray-500">{fmtTime(msg.created_at)}</span>
                    </div>
                    <p className="text-gray-200 text-sm">{msg.content}</p>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>

          <div className="px-4 py-3 bg-gray-800 border-t border-gray-700">
            <form onSubmit={sendMessage} className="flex gap-2">
              <input ref={inputRef}
                className="flex-1 bg-gray-700 text-white placeholder-gray-400 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder={activeChannel ? `Message #${activeChannel.name}` : 'Loading...'}
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={!activeChannel}
              />
              <button type="submit" disabled={!input.trim() || sending || !activeChannel}
                className="px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-40 transition-all">
                {sending ? '...' : 'Send'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
