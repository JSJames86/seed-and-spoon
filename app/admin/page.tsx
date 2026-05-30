import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import type { ReactNode } from 'react'
import SendReceiptsButton from './SendReceiptsButton'

function getServiceClient() {
  const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

export default async function AdminPage() {
  const cookieStore = await cookies()

  const authClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )

  const { data: { user } } = await authClient.auth.getUser()
  if (!user) redirect('/login')

  const service = getServiceClient()

  const { data: profile } = await service
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/')

  const [
    { data: donations },
    { data: volunteers },
    { data: emailLogs },
  ] = await Promise.all([
    service
      .from('donations')
      .select('id, donor_name, donor_email, amount, donation_type, status, donated_at')
      .order('donated_at', { ascending: false })
      .limit(20),
    service
      .from('volunteer_applications')
      .select('id, name, email, interests, availability, status, created_at')
      .order('created_at', { ascending: false })
      .limit(20),
    service
      .from('email_logs')
      .select('id, recipient_email, subject, email_type, status, sent_at, error_message')
      .order('sent_at', { ascending: false })
      .limit(20),
  ])

  type Donation = { id: string; donor_name: string | null; donor_email: string | null; amount: number; donation_type: string; status: string; donated_at: string | null }
  type Volunteer = { id: string; name: string | null; email: string | null; interests: string[] | string | null; availability: string | null; status: string | null; created_at: string | null }
  type EmailLog = { id: string; recipient_email: string; subject: string; email_type: string; status: string; sent_at: string | null; error_message: string | null }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-charcoal mb-1">Admin Dashboard</h1>

      <div className="mb-8 p-4 bg-white rounded-lg border border-gray-200">
        <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">Actions</h2>
        <SendReceiptsButton />
      </div>
      <p className="text-sm text-gray-500 mb-10">Signed in as {user.email}</p>

      <Section title="Recent Donations">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <Th>Donor</Th>
              <Th>Email</Th>
              <Th>Amount</Th>
              <Th>Type</Th>
              <Th>Status</Th>
              <Th>Date</Th>
            </tr>
          </thead>
          <tbody>
            {((donations ?? []) as Donation[]).map((d) => (
              <tr key={d.id} className="border-b border-gray-100">
                <Td>{d.donor_name ?? '—'}</Td>
                <Td>{d.donor_email ?? '—'}</Td>
                <Td>${Number(d.amount).toFixed(2)}</Td>
                <Td>{d.donation_type}</Td>
                <Td>{d.status}</Td>
                <Td>{d.donated_at ? new Date(d.donated_at).toLocaleDateString() : '—'}</Td>
              </tr>
            ))}
            {!donations?.length && <EmptyRow cols={6} />}
          </tbody>
        </table>
      </Section>

      <Section title="Recent Volunteer Applications">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Interests</Th>
              <Th>Availability</Th>
              <Th>Date</Th>
            </tr>
          </thead>
          <tbody>
            {((volunteers ?? []) as Volunteer[]).map((v) => (
              <tr key={v.id} className="border-b border-gray-100">
                <Td>{v.name ?? '—'}</Td>
                <Td>{v.email ?? '—'}</Td>
                <Td>{Array.isArray(v.interests) ? v.interests.join(', ') : (v.interests ?? '—')}</Td>
                <Td>{v.availability ?? '—'}</Td>
                <Td>{v.created_at ? new Date(v.created_at).toLocaleDateString() : '—'}</Td>
              </tr>
            ))}
            {!volunteers?.length && <EmptyRow cols={5} />}
          </tbody>
        </table>
      </Section>

      <Section title="Recent Email Activity">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <Th>To</Th>
              <Th>Subject</Th>
              <Th>Type</Th>
              <Th>Status</Th>
              <Th>Sent At</Th>
            </tr>
          </thead>
          <tbody>
            {((emailLogs ?? []) as EmailLog[]).map((e) => (
              <tr key={e.id} className="border-b border-gray-100">
                <Td>{e.recipient_email}</Td>
                <Td>{e.subject}</Td>
                <Td>{e.email_type}</Td>
                <Td className={e.status === 'failed' ? 'text-red-600 font-medium' : 'text-green-700'}>
                  {e.status}
                </Td>
                <Td>{e.sent_at ? new Date(e.sent_at).toLocaleDateString() : '—'}</Td>
              </tr>
            ))}
            {!emailLogs?.length && <EmptyRow cols={5} />}
          </tbody>
        </table>
      </Section>
    </main>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="text-xl font-semibold text-charcoal mb-4">{title}</h2>
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">{children}</div>
    </section>
  )
}

function Th({ children }: { children: ReactNode }) {
  return (
    <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">
      {children}
    </th>
  )
}

function Td({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <td className={`px-4 py-3 text-gray-700 ${className}`}>{children}</td>
}

function EmptyRow({ cols }: { cols: number }) {
  return (
    <tr>
      <td colSpan={cols} className="px-4 py-8 text-center text-gray-400 italic text-sm">
        No records yet
      </td>
    </tr>
  )
}
