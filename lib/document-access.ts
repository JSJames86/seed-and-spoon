// Who can see which internal documents. A document's access_level is the
// minimum tier required; higher tiers see everything below them.
const ROLE_TIER: Record<string, number> = {
  volunteer: 1,
  employee: 2,
  staff: 2,
  board: 3,
  executive_director: 4,
  admin: 4,
}

const LEVEL_TIER: Record<string, number> = {
  volunteer: 1,
  staff: 2,
  board: 3,
  admin: 4,
}

export function roleTier(role: string | null | undefined): number {
  return ROLE_TIER[role ?? ''] ?? 0
}

/** Unknown/missing access levels are treated as admin-only (fail closed). */
export function levelTier(level: string | null | undefined): number {
  return LEVEL_TIER[level ?? ''] ?? 4
}

export function allowedLevels(role: string | null | undefined): string[] {
  const tier = roleTier(role)
  return Object.entries(LEVEL_TIER)
    .filter(([, t]) => t <= tier)
    .map(([level]) => level)
}
