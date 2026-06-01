/**
 * logActivity — write to the activity_logs table from anywhere in the app.
 */
export async function logActivity({ event_type, record_type, record_id, record_label, actor_id, actor_name, metadata }) {
  try {
    await fetch('/api/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_type, record_type, record_id, record_label, actor_id, actor_name, metadata }),
    })
  } catch (err) {
    console.error('Failed to log activity:', err)
  }
}

export const EVENT_ICONS = {
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
  'nda.signed':            '🔒',
}

export function getEventIcon(event_type) {
  return EVENT_ICONS[event_type] || '📍'
}
