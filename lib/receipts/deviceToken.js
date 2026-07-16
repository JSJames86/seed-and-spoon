// ---------------------------------------------------------------------------
// Anonymous device ownership token (see migration 20260716200001 header for
// why: SpoonAssist has no consumer account system). Client-side: a random
// opaque id persisted in localStorage, same pattern PlanProvider already
// uses for shopping-list state. Server-side: format validation only -- this
// is a soft ownership key for a low-stakes anonymous feature, not a
// cryptographic credential.
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'spoonassist_device_token_v1';
const TOKEN_RE = /^[a-f0-9-]{20,}$/i;

export function isValidDeviceToken(token) {
  return typeof token === 'string' && TOKEN_RE.test(token);
}

// Client-only. Call from a 'use client' component/effect.
export function getOrCreateDeviceToken() {
  if (typeof window === 'undefined') return null;
  try {
    const existing = window.localStorage.getItem(STORAGE_KEY);
    if (existing && isValidDeviceToken(existing)) return existing;
  } catch { /* storage unavailable */ }

  const token = (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}-${Math.random().toString(16).slice(2)}`;

  try {
    window.localStorage.setItem(STORAGE_KEY, token);
  } catch { /* storage unavailable -- token still usable for this session */ }

  return token;
}
