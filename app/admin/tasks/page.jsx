'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const ADMIN_EMAIL = 'janelle.shanise@gmail.com'

const PRIORITY_STYLES = {
  low:    'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-700',
  high:   'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
}

const STATUS_STYLES = {
  open:        'bg-yellow-100 text-yellow-700',
  in_progress: 'bg-blue-100 text-blue-700',
  done:        'bg-green-100 text-green-700',
  cancelled:   'bg-gray-100 text-gray-500',
}

const RELATED_TYPES = ['general', 'donor', 'grant', 'volunteer', 'partner', 'property']

function isOverdue(due_date, status) {
  if (!due_date || status === 'done' || status === 'cancelled') return false
  return new Date(due_date) < new Date()
}

function fmtDate(d) {
  if (!d) return null
  const date = new Date(d + 'T00:00:00')
  const now = new Date()
  const diff = Math.ceil((date - now) / 86400000)
  if (diff < 0) return { label: `${Math.abs(diff)}d overdue`, overdue: true }
  if (diff === 0) return { label: 'Due today', today: true }
  if (diff === 1) return { label: 'Due tomorrow', soon: true }
  if (diff <= 7) return { label: `Due in ${diff}d`, soon: true }
  return { label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), overdue: false }
}

export default function TasksPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()

  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('open')
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [form, setForm] = useState({
    title: '', notes: '', priority: 'medium', due_date: '',
    related_type: 'general', related_label: '', assigned_name: ''
  })

  const isAdmin = user?.email === ADMIN_EMAIL || profile?.role === 'admin'
  const displayName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name || ''}`.trim()
    : user?.email?.split('@')[0] || 'Admin'

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/login'); return }
    if (!isAdmin && profile !== null) { router.push('/dashboard'); return }
    if (isAdmin) fetchTasks()
  }, [authLoading, user, profile, isAdmin]) // eslint-disable-line

  const fetchTasks = async () => {
    const res = await fetch('/api/tasks?status=all')
    const data = await res.json()
    setTasks(data.tasks || [])
    setLoading(false)
  }

  const submitTask = async () => {
    if (!form.title.trim()) return
    const payload = {
      ...form,
      created_by: user?.id,
      created_by_name: displayName,
      assigned_name: form.assigned_name || displayName,
      due_date: form.due_date || null,
    }

    if (editingTask) {
      const res = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingTask.id, ...payload }),
      })
      const data = await res.json()
      setTasks(prev => prev.map(t => t.id === editingTask.id ? data.task : t))
      setEditingTask(null)
    } else {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      setTasks(prev => [data.task, ...prev])
    }

    setForm({ title: '', notes: '', priority: 'medium', due_date: '', related_type: 'general', related_label: '', assigned_name: '' })
    setShowForm(false)
  }

  const updateStatus = async (task, status) => {
    const res = await fetch('/api/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: task.id, status }),
    })
    const data = await res.json()
    setTasks(prev => prev.map(t => t.id === task.id ? data.task : t))
  }

  const deleteTask = async (id) => {
    if (!confirm('Delete this task?')) return
    await fetch('/api/tasks', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const startEdit = (task) => {
    setEditingTask(task)
    setForm({
      title: task.title,
      notes: task.notes || '',
      priority: task.priority,
      due_date: task.due_date || '',
      related_type: task.related_type || 'general',
      related_label: task.related_label || '',
      assigned_name: task.assigned_name || '',
    })
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const filtered = tasks.filter(t => {
    if (filter === 'all') return true
    if (filter === 'overdue') return isOverdue(t.due_date, t.status)
    return t.status === filter
  })

  const counts = {
    open: tasks.filter(t => t.status === 'open').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    overdue: tasks.filter(t => isOverdue(t.due_date, t.status)).length,
    done: tasks.filter(t => t.status === 'done').length,
  }

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-700" />
    </div>
  )

  if (!isAdmin && profile) return null

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link href="/admin" className="text-sm text-gray-400 hover:text-gray-600">← Admin CRM</Link>
          <h1 className="text-xl font-bold text-charcoal">Tasks & Follow-ups</h1>
          <button onClick={() => { setShowForm(!showForm); setEditingTask(null); setForm({ title: '', notes: '', priority: 'medium', due_date: '', related_type: 'general', related_label: '', assigned_name: '' }) }}
            className="ml-auto px-4 py-2 bg-green-700 text-white text-sm font-semibold rounded-lg hover:bg-green-800 transition-all">
            + New Task
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">

        {/* New / Edit Task Form */}
        {showForm && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h2 className="font-semibold text-charcoal">{editingTask ? 'Edit Task' : 'New Task'}</h2>
            <input className={inputClass} placeholder="Task title *"
              value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
            <textarea className={inputClass} rows={2} placeholder="Notes (optional)"
              value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Priority</label>
                <select className={inputClass} value={form.priority}
                  onChange={e => setForm({...form, priority: e.target.value})}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Due Date</label>
                <input type="date" className={inputClass} value={form.due_date}
                  onChange={e => setForm({...form, due_date: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Related To</label>
                <select className={inputClass} value={form.related_type}
                  onChange={e => setForm({...form, related_type: e.target.value})}>
                  {RELATED_TYPES.map(t => <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Related Record</label>
                <input className={inputClass} placeholder="e.g. Tiffany Pinero"
                  value={form.related_label} onChange={e => setForm({...form, related_label: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Assign To</label>
              <input className={inputClass} placeholder={displayName}
                value={form.assigned_name} onChange={e => setForm({...form, assigned_name: e.target.value})} />
            </div>
            <div className="flex gap-2">
              <button onClick={submitTask}
                className="px-5 py-2 bg-green-700 text-white text-sm font-semibold rounded-lg hover:bg-green-800 transition-all">
                {editingTask ? 'Save Changes' : 'Create Task'}
              </button>
              <button onClick={() => { setShowForm(false); setEditingTask(null) }}
                className="px-5 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-all">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { key: 'open', label: 'Open', count: counts.open, color: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
            { key: 'in_progress', label: 'In Progress', count: counts.in_progress, color: 'text-blue-700 bg-blue-50 border-blue-200' },
            { key: 'overdue', label: 'Overdue', count: counts.overdue, color: 'text-red-700 bg-red-50 border-red-200' },
            { key: 'done', label: 'Done', count: counts.done, color: 'text-green-700 bg-green-50 border-green-200' },
          ].map(s => (
            <button key={s.key} onClick={() => setFilter(s.key)}
              className={`rounded-xl border p-3 text-center transition-all ${s.color} ${filter === s.key ? 'ring-2 ring-offset-1 ring-current' : 'opacity-70 hover:opacity-100'}`}>
              <p className="text-2xl font-bold">{s.count}</p>
              <p className="text-xs font-medium mt-0.5">{s.label}</p>
            </button>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 flex-wrap">
          {['all', 'open', 'in_progress', 'overdue', 'done', 'cancelled'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                filter === f ? 'bg-green-700 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}>
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Task List */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading tasks...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-2">✅</p>
            <p className="text-gray-400 text-sm">
              {filter === 'done' ? 'No completed tasks yet' : 'No tasks here'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(task => {
              const due = fmtDate(task.due_date)
              const overdue = isOverdue(task.due_date, task.status)
              return (
                <div key={task.id}
                  className={`bg-white rounded-xl border p-4 transition-all ${overdue ? 'border-red-200' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <button
                      onClick={() => updateStatus(task, task.status === 'done' ? 'open' : 'done')}
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                        task.status === 'done' ? 'bg-green-600 border-green-600 text-white' : 'border-gray-300 hover:border-green-500'
                      }`}>
                      {task.status === 'done' && <span className="text-xs">✓</span>}
                    </button>

                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm ${task.status === 'done' ? 'line-through text-gray-400' : 'text-charcoal'}`}>
                        {task.title}
                      </p>
                      {task.notes && <p className="text-xs text-gray-400 mt-0.5 truncate">{task.notes}</p>}
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${PRIORITY_STYLES[task.priority]}`}>
                          {task.priority}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${STATUS_STYLES[task.status]}`}>
                          {task.status.replace('_', ' ')}
                        </span>
                        {task.related_label && (
                          <span className="text-xs text-gray-400 capitalize">
                            {task.related_type}: {task.related_label}
                          </span>
                        )}
                        {task.assigned_name && (
                          <span className="text-xs text-gray-400">→ {task.assigned_name}</span>
                        )}
                        {due && (
                          <span className={`text-xs font-medium ${due.overdue ? 'text-red-600' : due.today || due.soon ? 'text-orange-600' : 'text-gray-400'}`}>
                            {due.label}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1 flex-shrink-0">
                      {task.status === 'open' && (
                        <button onClick={() => updateStatus(task, 'in_progress')}
                          className="px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded transition-all">
                          Start
                        </button>
                      )}
                      {task.status === 'in_progress' && (
                        <button onClick={() => updateStatus(task, 'done')}
                          className="px-2 py-1 text-xs text-green-700 hover:bg-green-50 rounded transition-all">
                          Done
                        </button>
                      )}
                      <button onClick={() => startEdit(task)}
                        className="px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 rounded transition-all">
                        Edit
                      </button>
                      <button onClick={() => deleteTask(task.id)}
                        className="px-2 py-1 text-xs text-red-500 hover:bg-red-50 rounded transition-all">
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
