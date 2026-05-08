// SpoonAssist feature flags — read server-side from env vars.
// Each flag controls whether a price source or integration is active.
// Add KROGER_CLIENT_ID/SECRET or INSTACART_API_KEY to .env.local to enable.

export const FEATURES = {
  kroger:    !!(process.env.KROGER_CLIENT_ID && process.env.KROGER_CLIENT_SECRET),
  instacart: !!process.env.INSTACART_API_KEY,
  usda:      true, // always on as final fallback
};
