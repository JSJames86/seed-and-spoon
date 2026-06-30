export const ORGANIZATION_TYPES = [
  'Church / Faith community',
  'Community center',
  'Youth group',
  'Social / Civic group',
  'Educational institution',
  'Other',
] as const

export type OrganizationType = (typeof ORGANIZATION_TYPES)[number]

export const PARTNERSHIP_INTERESTS = [
  'Host a pickup site',
  'Refer families',
  'Offer commercial kitchen space',
  'Provide volunteers',
  'Funding collaboration',
] as const

export type PartnershipInterest = (typeof PARTNERSHIP_INTERESTS)[number]

export interface CommunityPartnerPayload {
  organizationName: string
  organizationType: OrganizationType | ''
  organizationTypeOther?: string
  contactName: string
  email: string
  phone?: string
  city?: string
  zip?: string
  partnershipInterests: string[]
  notes?: string
  website?: string
  consent: boolean
}

export interface CommunityPartnerRow {
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
