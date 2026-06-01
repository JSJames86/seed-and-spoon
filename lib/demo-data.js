export const DEMO_MODE_KEY = 'ss_demo_mode'

export const DEMO_DONORS = [
  { id: 'd1', donor_name: 'Maria Rodriguez', donor_email: 'maria@example.com', amount: 100, donation_type: 'one_time', status: 'completed', donated_at: '2026-05-15' },
  { id: 'd2', donor_name: 'James Okafor', donor_email: 'james@example.com', amount: 50, donation_type: 'recurring', status: 'completed', donated_at: '2026-05-20' },
  { id: 'd3', donor_name: 'Priya Patel', donor_email: 'priya@example.com', amount: 250, donation_type: 'one_time', status: 'completed', donated_at: '2026-05-22' },
  { id: 'd4', donor_name: 'Devon Williams', donor_email: 'devon@example.com', amount: 75, donation_type: 'recurring', status: 'completed', donated_at: '2026-05-28' },
  { id: 'd5', donor_name: 'Angela Kim', donor_email: 'angela@example.com', amount: 500, donation_type: 'one_time', status: 'completed', donated_at: '2026-05-30' },
]

export const DEMO_GRANTS = [
  { id: 'g1', title: 'Community Food Access Initiative', funder: 'Robert Wood Johnson Foundation', amount: 25000, stage: 'submitted', due_date: '2026-06-30', notes: 'Full proposal submitted' },
  { id: 'g2', title: 'Youth Workforce Development Grant', funder: 'New Jersey Health Foundation', amount: 15000, stage: 'awarded', due_date: '2026-07-15', notes: 'Awarded — reporting due Q4' },
  { id: 'g3', title: 'Community Spark Grant', funder: 'Walmart Foundation', amount: 5000, stage: 'loi', due_date: '2026-06-15', notes: 'LOI submitted' },
  { id: 'g4', title: 'SDOH Food Security Program', funder: 'Horizon Blue Cross', amount: 50000, stage: 'prospect', due_date: '2026-08-01', notes: 'Research phase' },
]

export const DEMO_VOLUNTEERS = [
  { id: 'v1', name: 'Tasha Greene', email: 'tasha@example.com', status: 'approved', interests: ['kitchen', 'delivery'], availability: 'Weekends' },
  { id: 'v2', name: 'Carlos Mendes', email: 'carlos@example.com', status: 'active', interests: ['kitchen'], availability: 'Saturdays' },
  { id: 'v3', name: 'Destiny Brown', email: 'destiny@example.com', status: 'pending', interests: ['delivery', 'admin'], availability: 'Flexible' },
]

export const DEMO_TASKS = [
  { id: 't1', title: 'Follow up with RWJF program officer', notes: 'Call scheduled for next week', priority: 'high', status: 'in_progress', due_date: '2026-06-10', related_type: 'grant', related_label: 'Community Food Access Initiative', assigned_name: 'Janelle' },
  { id: 't2', title: 'Submit 501(c)(3) follow-up documentation', notes: 'IRS requested additional info', priority: 'urgent', status: 'open', due_date: '2026-06-07', related_type: 'general', assigned_name: 'Janelle' },
  { id: 't3', title: 'Onboard 2 new kitchen volunteers', notes: 'Carlos and Tasha — schedule orientation', priority: 'medium', status: 'open', due_date: '2026-06-20', related_type: 'volunteer', assigned_name: 'Janelle' },
]

export const DEMO_TIMELINE = [
  { id: 'a1', event_type: 'grant.awarded', record_type: 'grant', record_label: 'Youth Workforce Development Grant', actor_name: 'System', metadata: { amount: 15000, funder: 'NJ Health Foundation' }, created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 'a2', event_type: 'donation.received', record_type: 'donor', record_label: 'Angela Kim', actor_name: 'Stripe', metadata: { amount: 500 }, created_at: new Date(Date.now() - 172800000).toISOString() },
  { id: 'a3', event_type: 'volunteer.approved', record_type: 'volunteer', record_label: 'Carlos Mendes', actor_name: 'Admin', metadata: { status: 'active' }, created_at: new Date(Date.now() - 259200000).toISOString() },
  { id: 'a4', event_type: 'invite.accepted', record_type: 'user', record_label: 'Tasha Greene', actor_name: 'Tasha Greene', metadata: { role: 'volunteer' }, created_at: new Date(Date.now() - 345600000).toISOString() },
  { id: 'a5', event_type: 'document.uploaded', record_type: 'user', record_label: 'Program SOPs v2', actor_name: 'Admin', metadata: { category: 'sops' }, created_at: new Date(Date.now() - 432000000).toISOString() },
]

export const DEMO_STATS = {
  totalRaised: 975,
  uniqueDonors: 5,
  activeVolunteers: 2,
  grantsAwarded: 15000,
}
