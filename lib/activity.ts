/**
 * logActivity — write to the activity_logs table from anywhere in the app.
 * Call this after any significant event.
 */
export async function logActivity(params: {
  event_type: string
  record_type: string
  record_id?: string
  record_label?: string
  actor_id?: string
  actor_name?: string
  metadata?: Record<string, unknown>
}) {
  try {
    await fetch('/api/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })
  } catch (err) {
    console.error('Failed to log activity:', err)
  }
}

export const EVENT_ICONS: Record<string, string> = {
  'donation.received':     '💚',
  'donation.recurring':    '🔄',
  'email.sent':            '📧',
  'grant.created':         '📋',
  'grant.stage_changed':   '📊',
  'grant.awarded':         '🏆',
  'volunteer.registered':  '🙋',
  'volunteer.approved':    '✅',
  'volunteer.shift':       '👩‍🍳',
  'document.signed':       '✍️',
  'document.uploaded':     '📎',
  'invite.sent':           '📨',
  'invite.accepted':       '👋',
  'delivery.dispatched':   '🚗',
  'delivery.completed':    '📦',
  'cohort.enrolled':       '🌱',
  'cohort.completed':      '🎉',
  'message.sent':          '💬',
  'platform.launched':     '🚀',
  'task.created':          '📌',
  'task.completed':        '✔️',
  'user.created':          '👤',
  'nda.signed':            '🔒',
}

export function getEventIcon(event_type: string): string {
  return EVENT_ICONS[event_type] || '📍'
}

export function getEventLabel(event_type: string, record_label?: string): string {
  const labels: Record<string, string> = {
    'donation.received':    `Donation received from ${record_label || 'donor'}`,
    'email.sent':           `Email sent to ${record_label || 'recipient'}`,
    'grant.created':        `Grant added: ${record_label || ''}`,
    'grant.stage_changed':  `Grant stage updated: ${record_label || ''}`,
    'grant.awarded':        `Grant awarded: ${record_label || ''}`,
    'volunteer.registered': `${record_label || 'Volunteer'} registered`,
    'volunteer.approved':   `${record_label || 'Volunteer'} approved`,
    'document.signed':      `${record_label || 'User'} signed document`,
    'document.uploaded':    `Document uploaded: ${record_label || ''}`,
    'invite.sent':          `Invite sent to ${record_label || ''}`,
    'invite.accepted':      `${record_label || 'User'} joined the platform`,
    'delivery.dispatched':  `Delivery dispatched to ${record_label || 'household'}`,
    'delivery.completed':   `Delivery completed for ${record_label || 'household'}`,
    'cohort.enrolled':      `${record_label || 'Family'} enrolled in cohort`,
    'platform.launched':    'Platform went live',
    'message.sent':         `Message sent in ${record_label || 'channel'}`,
  }
  return labels[event_type] || `${event_type.replace('.', ' ')}: ${record_label || ''}`
}
