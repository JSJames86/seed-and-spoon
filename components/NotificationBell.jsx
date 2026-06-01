'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const TYPE_ICONS = {
  'donation.received':   '💚',
  'task.due':            '📌',
  'task.overdue':        '🚨',
  'grant.awarded':       '🏆',
  'grant.stage_changed': '📊',
  'invite.accepted':     '👋',
  'volunteer.approved':  '✅',
  'message.new':         '💬',
  'document.uploaded':   '📎',
}

function fmtTime(ts) {
  const d = new Date(ts)
  const diff = Date.now() - d
  if (diff < 60000) return 'just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return `${Math.floor(diff / 86400000)}d ago`
}

export default function NotificationBell() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const unread = notifications.filter(n => !n.is_read).length

  useEffect(() => {
    if (!user) return
    fetchNotifications()

    // Realtime subscription
    const sub = supabase
      .channel(`notifications:${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        setNotifications(prev => [payload.new, ...prev])
      })
      .subscribe()

    return () => supabase.removeChannel(sub)
  }, [user])

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const fetchNotifications = async () => {
    const res = await fetch(`/api/notifications?userId=${user.id}`)
    const data = await res.json()
    setNotifications(data.notifications || [])
  }

  const markAllRead = async () => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, markAllRead: true }),
    })
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  const markRead = async (id) => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
  }

  const clearAll = async () => {
    await fetch('/api/notifications', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id }),
    })
    setNotifications([])
    setOpen(false)
  }

  if (!user) return null

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => { setOpen(!open); if (!open && unread > 0) markAllRead() }}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <span className="text-xl">🔔</span>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <p className="font-semibold text-sm text-charcoal">Notifications</p>
            <div className="flex gap-2">
              {notifications.length > 0 && (
                <button onClick={clearAll} className="text-xs text-gray-400 hover:text-red-500 transition-colors">
                  Clear all
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-3xl mb-2">🔔</p>
                <p className="text-sm text-gray-400">No notifications yet</p>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={`px-4 py-3 border-b border-gray-50 last:border-0 transition-colors ${
                    !n.is_read ? 'bg-green-50' : 'hover:bg-gray-50'
                  }`}
                >
                  {n.href ? (
                    <Link href={n.href} onClick={() => setOpen(false)}>
                      <NotifContent n={n} />
                    </Link>
                  ) : (
                    <NotifContent n={n} />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function NotifContent({ n }) {
  return (
    <div className="flex gap-2.5">
      <span className="text-lg flex-shrink-0 mt-0.5">{TYPE_ICONS[n.type] || '📍'}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-charcoal leading-snug">{n.title}</p>
        {n.body && <p className="text-xs text-gray-400 mt-0.5 truncate">{n.body}</p>}
        <p className="text-xs text-gray-300 mt-1">{fmtTime(n.created_at)}</p>
      </div>
      {!n.is_read && <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-1.5" />}
    </div>
  )
}
