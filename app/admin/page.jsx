'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import SendReceiptsButton from './SendReceiptsButton'

const ADMIN_EMAIL = 'janelle.shanise@gmail.com'

export default function AdminPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const [donations, setDonations] = useState([])
  const [volunteers, setVolunteers] = useState([])
  const [emailLogs, setEmailLogs] = useState([])
  const [dataLoading, setDataLoading] = useState(true)

  const isAdmin = user?.email === ADMIN_EMAIL || profile?.role === 'admin'

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/login'); return }
    if (!isAdmin && profile !== null) { router.push('/dashboard'); return }
    if (isAdmin) fetchData()
  }, [authLoading, user, profile, isAdmin]) // eslint-disable-line

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/data')
      const json = await res.json()
      setDonations(json.donations ?? [])
      setVolunteers(json.volunteers ?? [])
      setEmailLogs(json.emailLogs ?? [])
    } catch (err) {
      console.error('Failed to load admin data:', err)
    } finally {
      setDataLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-soil" />
      </div>
    )
  }

  if (!user || (!isAdmin && profile !== null)) return null

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-charcoal mb-1">Admin Dashboard</h1>
      <p className="text-sm text-gray-500 mb-8">Signed in as {user.email}</p>

      <div className="mb-8 p-4 bg-white rounded-lg border border-gray-200">
        <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">Actions</h2>
        <SendReceiptsButton />
      </div>

      <Section title="Recent Donations">
        {dataLoading ? <Loading /> : (
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b border-gray-200">
              <Th>Donor</Th><Th>Email</Th><Th>Amount</Th><Th>Type</Th><Th>Status</Th><Th>Date</Th>
            </tr></thead>
            <tbody>
              {donations.map(d => (
                <tr key={d.id} className="border-b border-gray-100">
                  <Td>{d.donor_name ?? '—'}</Td>
                  <Td>{d.donor_email ?? '—'}</Td>
                  <Td>${Number(d.amount).toFixed(2)}</Td>
                  <Td>{d.donation_type}</Td>
                  <Td>{d.status}</Td>
                  <Td>{d.donated_at ? new Date(d.donated_at).toLocaleDateString() : '—'}</Td>
                </tr>
              ))}
              {!donations.length && <EmptyRow cols={6} />}
            </tbody>
          </table>
        )}
      </Section>

      <Section title="Recent Volunteer Applications">
        {dataLoading ? <Loading /> : (
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b border-gray-200">
              <Th>Name</Th><Th>Email</Th><Th>Interests</Th><Th>Availability</Th><Th>Date</Th>
            </tr></thead>
            <tbody>
              {volunteers.map(v => (
                <tr key={v.id} className="border-b border-gray-100">
                  <Td>{v.name ?? '—'}</Td>
                  <Td>{v.email ?? '—'}</Td>
                  <Td>{Array.isArray(v.interests) ? v.interests.join(', ') : (v.interests ?? '—')}</Td>
                  <Td>{v.availability ?? '—'}</Td>
                  <Td>{v.created_at ? new Date(v.created_at).toLocaleDateString() : '—'}</Td>
                </tr>
              ))}
              {!volunteers.length && <EmptyRow cols={5} />}
            </tbody>
          </table>
        )}
      </Section>

      <Section title="Recent Email Activity">
        {dataLoading ? <Loading /> : (
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b border-gray-200">
              <Th>To</Th><Th>Subject</Th><Th>Type</Th><Th>Status</Th><Th>Sent At</Th>
            </tr></thead>
            <tbody>
              {emailLogs.map(e => (
                <tr key={e.id} className="border-b border-gray-100">
                  <Td>{e.recipient_email}</Td>
                  <Td>{e.subject}</Td>
                  <Td>{e.email_type}</Td>
                  <Td className={e.status === 'failed' ? 'text-red-600 font-medium' : 'text-green-700'}>{e.status}</Td>
                  <Td>{e.sent_at ? new Date(e.sent_at).toLocaleDateString() : '—'}</Td>
                </tr>
              ))}
              {!emailLogs.length && <EmptyRow cols={5} />}
            </tbody>
          </table>
        )}
      </Section>
    </main>
  )
}

function Section({ title, children }) {
  return (
    <section className="mb-12">
      <h2 className="text-xl font-semibold text-charcoal mb-4">{title}</h2>
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">{children}</div>
    </section>
  )
}
function Th({ children }) {
  return <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">{children}</th>
}
function Td({ children, className = '' }) {
  return <td className={`px-4 py-3 text-gray-700 ${className}`}>{children}</td>
}
function EmptyRow({ cols }) {
  return <tr><td colSpan={cols} className="px-4 py-8 text-center text-gray-400 italic text-sm">No records yet</td></tr>
}
function Loading() {
  return <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
}
