import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim()
  if (!q || q.length < 2) return NextResponse.json({ results: [] })

  const supabase = serviceClient()
  const search = `%${q}%`

  const [donors, grants, volunteers, documents, tasks, messages] = await Promise.all([
    supabase.from('donations').select('id, donor_name, donor_email, amount, donated_at')
      .or(`donor_name.ilike.${search},donor_email.ilike.${search}`)
      .limit(5),

    supabase.from('grants').select('id, title, funder, amount, stage')
      .or(`title.ilike.${search},funder.ilike.${search},notes.ilike.${search}`)
      .limit(5),

    supabase.from('volunteer_applications').select('id, name, email, status, interests')
      .or(`name.ilike.${search},email.ilike.${search}`)
      .limit(5),

    supabase.from('documents').select('id, title, description, category, file_path')
      .or(`title.ilike.${search},description.ilike.${search},category.ilike.${search}`)
      .limit(5),

    supabase.from('tasks').select('id, title, notes, status, priority, due_date, assigned_name')
      .or(`title.ilike.${search},notes.ilike.${search},related_label.ilike.${search},assigned_name.ilike.${search}`)
      .limit(5),

    supabase.from('messages').select('id, content, username, channel_id, created_at')
      .ilike('content', search)
      .limit(5),
  ])

  const results = [
    ...(donors.data || []).map(r => ({
      type: 'donor', icon: '💚', id: r.id,
      title: r.donor_name || r.donor_email,
      subtitle: `$${Number(r.amount).toFixed(2)} · ${r.donor_email}`,
      href: '/admin?tab=Donors',
    })),
    ...(grants.data || []).map(r => ({
      type: 'grant', icon: '📋', id: r.id,
      title: r.title,
      subtitle: `${r.funder} · ${r.stage} · $${Number(r.amount || 0).toLocaleString()}`,
      href: '/admin?tab=Grants',
    })),
    ...(volunteers.data || []).map(r => ({
      type: 'volunteer', icon: '🙋', id: r.id,
      title: r.name || r.email,
      subtitle: `${r.status} · ${r.email}`,
      href: '/admin?tab=Volunteers',
    })),
    ...(documents.data || []).map(r => ({
      type: 'document', icon: '📎', id: r.id,
      title: r.title,
      subtitle: r.description || r.category,
      href: `/api/documents/url?path=${encodeURIComponent(r.file_path)}`,
      external: true,
    })),
    ...(tasks.data || []).map(r => ({
      type: 'task', icon: '📌', id: r.id,
      title: r.title,
      subtitle: `${r.priority} · ${r.status}${r.due_date ? ` · due ${r.due_date}` : ''}`,
      href: '/admin/tasks',
    })),
    ...(messages.data || []).map(r => ({
      type: 'message', icon: '💬', id: r.id,
      title: r.content.slice(0, 60) + (r.content.length > 60 ? '...' : ''),
      subtitle: `from ${r.username}`,
      href: '/messages',
    })),
  ]

  return NextResponse.json({ results, query: q })
}
