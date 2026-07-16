import { NextResponse } from 'next/server';
import { providers } from '@/lib/pricing/registry';

// GET /api/pricing/health -- spec Phase 1 §9 acceptance criterion. One
// entry per registered provider (registry order = priority order); pulling
// a provider from lib/pricing/registry.ts removes it from this list too.
export async function GET() {
  const results = await Promise.all(
    providers.map(async (p) => {
      let healthy = false;
      try {
        healthy = await p.healthy();
      } catch (err) {
        console.error(`[/api/pricing/health] provider "${p.id}" health check threw:`, err.message);
      }
      return { id: p.id, healthy, supportedChains: p.supportedChains };
    })
  );

  return NextResponse.json({ providers: results }, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
