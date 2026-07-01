import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

const ORGANIZATION_TYPES = [
  'Church / Faith community',
  'Community center',
  'Youth group',
  'Social / Civic group',
  'Educational institution',
  'Other',
]

const PARTNERSHIP_INTERESTS = [
  'Host a pickup site',
  'Refer families',
  'Offer commercial kitchen space',
  'Provide volunteers',
  'Funding collaboration',
]

interface CommunityPartnerRow {
  organization_name: string
  organization_type: string
  organization_type_other: string | null
  contact_name: string
  email: string
  phone: string | null
  city: string | null
  zip: string | null
  partnership_interests: string[]
  notes: string | null
  website: string | null
  consent: boolean
  status: 'new'
  source: 'community_partner_form'
  created_at: string
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  try {
    if (!body.organizationName || String(body.organizationName).trim() === '') {
      return Response.json({ error: 'Missing required field: organizationName' }, { status: 400 })
    }
    if (!body.organizationType || !ORGANIZATION_TYPES.includes(String(body.organizationType))) {
      return Response.json({ error: 'Missing or invalid field: organizationType' }, { status: 400 })
    }
    if (!body.contactName || String(body.contactName).trim() === '') {
      return Response.json({ error: 'Missing required field: contactName' }, { status: 400 })
    }
    if (!body.email || !EMAIL_RE.test(String(body.email))) {
      return Response.json({ error: 'Invalid email address' }, { status: 400 })
    }
    if (!body.consent) {
      return Response.json({ error: 'Consent is required' }, { status: 400 })
    }

    const interests = Array.isArray(body.partnershipInterests)
      ? body.partnershipInterests.filter((i) => PARTNERSHIP_INTERESTS.includes(String(i)))
      : []
    if (interests.length === 0) {
      return Response.json({ error: 'Select at least one way to partner' }, { status: 400 })
    }

    const row: CommunityPartnerRow = {
      organization_name: String(body.organizationName).trim().slice(0, 200),
      organization_type: String(body.organizationType).trim(),
      organization_type_other: body.organizationTypeOther
        ? String(body.organizationTypeOther).trim().slice(0, 200)
        : null,
      contact_name: String(body.contactName).trim().slice(0, 200),
      email: String(body.email).trim().toLowerCase().slice(0, 200),
      phone: body.phone ? String(body.phone).trim().slice(0, 30) : null,
      city: body.city ? String(body.city).trim().slice(0, 100) : null,
      zip: body.zip ? String(body.zip).trim().slice(0, 20) : null,
      partnership_interests: interests,
      notes: body.notes ? String(body.notes).trim().slice(0, 2000) : null,
      website: body.website ? String(body.website).trim().slice(0, 300) : null,
      consent: true,
      status: 'new',
      source: 'community_partner_form',
      created_at: new Date().toISOString(),
    }

    const supabase = getSupabase()
    if (supabase) {
      const { error } = await supabase.from('community_partners').insert([row])
      if (error) {
        if (error.code === '42P01') {
          // Table doesn't exist yet — accept gracefully
          return Response.json({ ok: true, stored: false })
        }
        console.error('[partners/community] Supabase insert error:', error)
        return Response.json({ error: 'Database error' }, { status: 500 })
      }
      return Response.json({ ok: true, stored: true })
    }

    // No Supabase configured — still accept the form gracefully
    return Response.json({ ok: true, stored: false })
  } catch (err) {
    console.error('[partners/community] Unexpected error:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
