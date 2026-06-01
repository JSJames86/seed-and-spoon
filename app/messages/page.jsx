'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import { supabase } from '@/lib/supabase'

const HASH_COLORS = ['bg-green-600', 'bg-blue-600', 'bg-purple-600', 'bg-orange-500', 'bg-pink-600', 'bg-teal-600']
const QUICK_EMOJIS = ['👍', '❤️', '😂', '🙏', '🔥', '✅']

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
  const [reactions, setReactions] = useState({}) // { messageId: [{emoji, users}] }
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')
  const [hoveredId, setHoveredId] = useState(null)
  const [emojiPickerId, setEmojiPickerId] = useState(null)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  const displayName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name || ''}`.trim()
    : (profile?.username || user?.email?.split('@')[0] || '?')

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
  }, [])

  useEffect(() => {
    if (!activeChannel) return
    setMessages([])
    setReactions({})

    // Fetch messages
    fetch(`/api/messages?channel_id=${activeChannel.id}`)
      .then(r => r.json())
      .then(data => setMessages(data.messages || []))

    // Fetch reactions
    fetch(`/api/messages/reactions?channel_id=${activeChannel.id}`)
      .then(r => r.json())
      .then(data => {
        const grouped = {}
        for (const r of (data.reactions || [])) {
          if (!grouped[r.message_id]) grouped[r.message_id] = {}
          if (!grouped[r.message_id][r.emoji]) grouped[r.message_id][r.emoji] = []
          grouped[r.message_id][r.emoji].push(r.username)
        }
        setReactions(grouped)
      })

    // Subscribe to new messages
    const msgSub = supabase
      .channel(`msg:${activeChannel.id}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'messages',
        filter: `channel_id=eq.${activeChannel.id}`,
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setMessages(prev => [...prev, payload.new])
        } else if (payload.eventType === 'UPDATE') {
          setMessages(prev => prev.map(m => m.id === payload.new.id ? payload.new : m))
        } else if (payload.eventType === 'DELETE') {
          setMessages(prev => prev.filter(m => m.id !== payload.old.id))
        }
      })
      .subscribe()

    // Subscribe to reactions
    const reactSub = supabase
      .channel(`react:${activeChannel.id}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'message_reactions',
      }, () => {
        // Refetch reactions on any change
        fetch(`/api/messages/reactions?channel_id=${activeChannel.id}`)
          .then(r => r.json())
          .then(data => {
            const grouped = {}
            for (const r of (data.reactions || [])) {
              if (!grouped[r.message_id]) grouped[r.message_id] = {}
              if (!grouped[r.message_id][r.emoji]) grouped[r.message_id][r.emoji] = []
              grouped[r.message_id][r.emoji].push(r.username)
            }
            setReactions(grouped)
          })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(msgSub)
      supabase.removeChannel(reactSub)
    }
  }, [activeChannel])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim() || !activeChannel || sending || !user) return
    setSending(true)
    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel_id: activeChannel.id,
        sender_id: user.id,
        username: displayName,
        content: input.trim(),
      }),
    })
    setInput('')
    setSending(false)
    inputRef.current?.focus()
  }

  const saveEdit = async (msg) => {
    if (!editText.trim()) return
    await fetch('/api/messages', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: msg.id, content: editText.trim() }),
    })
    setEditingId(null)
  }

  const deleteMessage = async (id) => {
    await fetch('/api/messages', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
  }

  const togglePin = async (msg) => {
    await fetch('/api/messages', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: msg.id, is_pinned: !msg.is_pinned }),
    })
    setHoveredId(null)
  }

  const addReaction = async (messageId, emoji) => {
    setEmojiPickerId(null)
    await fetch('/api/messages/reactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message_id: messageId, user_id: user.id, username: displayName, emoji }),
    })
  }

  const pinnedMessages = messages.filter(m => m.is_pinned)
  const regularMessages = messages.filter(m => !m.is_pinned)

  return (
    <ProtectedRoute>
      <div className="flex overflow-hidden"  style={{background: "#1a2e1a"}} style={{ height: 'calc(100vh - 60px)' }}>

        {/* Sidebar */}
        <div className="w-52 flex flex-col flex-shrink-0" style={{background: "#132213", borderRight: "1px solid #2d5a27"}}>
          <div className="px-3 py-4" style={{borderBottom: "1px solid #2d5a27"}}>
            <p className="text-xs font-bold uppercase tracking-widest" style={{color: "#4FAF3B"}}>Seed & Spoon</p>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            <p className="px-3 text-xs font-semibold uppercase tracking-widest mb-1" style={{color: "#4FAF3B88"}}>Channels</p>
            {loading ? (
              <p className="px-3 text-xs text-gray-500">Loading...</p>
            ) : channels.map(ch => (
              <button key={ch.id} onClick={() => setActiveChannel(ch)}
                style={{background: activeChannel?.id === ch.id ? '#2d5a27' : 'transparent'}} className={`w-full text-left px-3 py-1.5 text-sm transition-colors rounded mx-1 ${
                  activeChannel?.id === ch.id ? 'text-white font-semibold' : 'text-gray-400 hover:text-gray-100'
                }`}>
                # {ch.name}
              </button>
            ))}
          </div>
          <div className="px-3 py-3 flex items-center gap-2" style={{borderTop: "1px solid #2d5a27"}}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${avatarColor(displayName)}`}>
              {initials(displayName)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">{displayName}</p>
              <p className="text-xs" style={{color: "#4FAF3B"}}>● online</p>
            </div>
          </div>
        </div>

        {/* Main chat */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="px-4 py-3 flex items-center gap-2" style={{borderBottom: "1px solid #2d5a27", background: "#1e331e"}}>
            <span className="font-bold" style={{color: "#4FAF3B"}}>#</span>
            <span className="font-semibold text-white">{activeChannel?.name}</span>
            {activeChannel?.description && (
              <span className="text-xs hidden sm:block" style={{color: "#4FAF3B99"}}>— {activeChannel.description}</span>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4" style={{background: "#1a2e1a"}} onClick={() => { setHoveredId(null); setEmojiPickerId(null) }}>

            {/* Channel intro card */}
            {activeChannel?.intro && (
              <div className="mb-6 rounded-xl p-4" style={{background: "#E86A1D22", border: "1px solid #E86A1D55"}}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${avatarColor(activeChannel.intro_author || 'Janelle')}`}>
                    {initials(activeChannel.intro_author || 'Janelle')}
                  </div>
                  <div>
                    <span className="font-semibold text-sm" style={{color: "#4FAF3B"}}>{activeChannel.intro_author || 'Janelle'}</span>
                    <span className="text-xs text-gray-400 ml-2">· Channel intro</span>
                  </div>
                </div>
                <div className="text-gray-200 text-sm whitespace-pre-line leading-relaxed">
                  {activeChannel.intro}
                </div>
              </div>
            )}

            {/* Pinned messages */}
            {pinnedMessages.length > 0 && (
              <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-700/50 rounded-lg">
                <p className="text-xs font-semibold mb-2" style={{color: "#E86A1D"}}>📌 Pinned</p>
                {pinnedMessages.map(msg => (
                  <div key={msg.id} className="text-sm text-gray-200 py-0.5">
                    <span className="font-semibold text-white mr-2">{msg.username}</span>
                    {msg.content}
                    <button onClick={() => togglePin(msg)} className="ml-2 text-xs text-yellow-500 hover:text-yellow-300">unpin</button>
                  </div>
                ))}
              </div>
            )}

            {regularMessages.length === 0 && pinnedMessages.length === 0 && activeChannel && (
              <div className="text-center py-16">
                <p className="text-3xl mb-2">#</p>
                <p className="text-white font-bold">Welcome to #{activeChannel.name}!</p>
                {activeChannel.description && <p className="text-gray-400 text-sm mt-1">{activeChannel.description}</p>}
              </div>
            )}

            {regularMessages.map((msg, i) => {
              const prev = regularMessages[i - 1]
              const grouped = prev && prev.username === msg.username &&
                new Date(msg.created_at) - new Date(prev.created_at) < 300000
              const isOwn = msg.sender_id === user?.id
              const msgReactions = reactions[msg.id] || {}

              return (
                <div key={msg.id}
                  className="relative"
                  onClick={(e) => { e.stopPropagation(); setHoveredId(hoveredId === msg.id ? null : msg.id); setEmojiPickerId(null) }}>

                  {/* Action bar — shows on tap */}
                  {hoveredId === msg.id && (
                    <div className="absolute right-2 -top-3 flex items-center gap-1 rounded-lg px-1.5 py-1 z-10 shadow-lg" style={{background: "#1e331e", border: "1px solid #2d5a27"}}
                      onClick={e => e.stopPropagation()}>
                      <button onClick={() => setEmojiPickerId(emojiPickerId === msg.id ? null : msg.id)}
                        className="text-sm px-1 opacity-70 hover:opacity-100" title="React">
                        😀
                      </button>
                      {isOwn && (
                        <button onClick={() => { setEditingId(msg.id); setEditText(msg.content); setHoveredId(null) }}
                          className="text-xs px-1 opacity-70 hover:opacity-100" title="Edit">
                          ✏️
                        </button>
                      )}
                      <button onClick={() => togglePin(msg)}
                        className="text-xs px-1 opacity-70 hover:opacity-100" title={msg.is_pinned ? 'Unpin' : 'Pin'}>
                        📌
                      </button>
                      {isOwn && (
                        <button onClick={() => deleteMessage(msg.id)}
                          className="text-xs px-1 opacity-70 hover:opacity-100" title="Delete">
                          🗑️
                        </button>
                      )}
                    </div>
                  )}

                  {/* Emoji picker */}
                  {emojiPickerId === msg.id && (
                    <div className="absolute right-2 top-6 flex items-center gap-1 rounded-xl px-2 py-1.5 z-20 shadow-xl" style={{background: "#1e331e", border: "1px solid #2d5a27"}}
                      onClick={e => e.stopPropagation()}>
                      {QUICK_EMOJIS.map(emoji => (
                        <button key={emoji} onClick={() => addReaction(msg.id, emoji)}
                          className="text-xl hover:scale-125 transition-transform px-0.5">
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}

                  {grouped ? (
                    <div className="pl-10 px-1 pb-0.5">
                      {editingId === msg.id ? (
                        <EditBox value={editText} onChange={setEditText} onSave={() => saveEdit(msg)} onCancel={() => setEditingId(null)} />
                      ) : (
                        <p className="text-gray-100 text-sm">{msg.content}{msg.edited_at && <span className="text-xs ml-1" style={{color: "#4FAF3B66"}}>(edited)</span>}</p>
                      )}
                    </div>
                  ) : (
                    <div className="flex gap-3 pt-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${avatarColor(msg.username)}`}>
                        {initials(msg.username)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="font-semibold text-sm" style={{color: "#4FAF3B"}}>{msg.username}</span>
                          <span className="text-xs" style={{color: "#4FAF3B66"}}>{fmtTime(msg.created_at)}</span>
                        </div>
                        {editingId === msg.id ? (
                          <EditBox value={editText} onChange={setEditText} onSave={() => saveEdit(msg)} onCancel={() => setEditingId(null)} />
                        ) : (
                          <p className="text-gray-200 text-sm mt-0.5">{msg.content}{msg.edited_at && <span className="text-xs ml-1" style={{color: "#4FAF3B66"}}>(edited)</span>}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Reactions */}
                  {Object.keys(msgReactions).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1 pl-10">
                      {Object.entries(msgReactions).map(([emoji, users]) => (
                        <button key={emoji}
                          onClick={() => addReaction(msg.id, emoji)}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-all ${
                            users.includes(displayName)
                              ? 'text-white'" style={{background: '#2d5a2780', border: '1px solid #4FAF3B'}}  className2="
                              : 'text-gray-300'" style={{background: '#0f1f0f', border: '1px solid #2d5a27'}} className2="
                          }`}>
                          <span>{emoji}</span>
                          <span className="font-medium">{users.length}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3" style={{background: "#1e331e", borderTop: "1px solid #2d5a27"}}>
            <form onSubmit={sendMessage} className="flex gap-2">
              <input ref={inputRef}
                className="flex-1 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2" style={{background: "#0f1f0f", border: "1px solid #2d5a27", outline: "none"}} onFocus={e => e.target.style.borderColor='#4FAF3B'} onBlur={e => e.target.style.borderColor='#2d5a27'}
                placeholder={activeChannel ? `Message #${activeChannel.name}` : 'Loading...'}
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={!activeChannel}
              />
              <button type="submit" disabled={!input.trim() || sending || !activeChannel}
                className="px-4 py-2.5 text-white rounded-lg text-sm font-semibold disabled:opacity-40 transition-all" style={{background: "#2d5a27"}}>
                {sending ? '...' : 'Send'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

function EditBox({ value, onChange, onSave, onCancel }) {
  return (
    <div className="mt-1">
      <input
        autoFocus
        className="w-full text-white rounded px-3 py-1.5 text-sm focus:outline-none" style={{background: "#0f1f0f", border: "1px solid #4FAF3B"}}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') onSave(); if (e.key === 'Escape') onCancel() }}
      />
      <div className="flex gap-2 mt-1">
        <button onClick={onSave} className="text-xs hover:opacity-80" style={{color: "#4FAF3B"}}>Save</button>
        <button onClick={onCancel} className="text-xs opacity-60 hover:opacity-80 text-white">Cancel</button>
        <span className="text-xs" style={{color: "#4FAF3B66"}}>Enter to save · Esc to cancel</span>
      </div>
    </div>
  )
}
