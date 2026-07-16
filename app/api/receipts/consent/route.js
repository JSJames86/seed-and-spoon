import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/spoonassist/priceEngine';
import { isValidDeviceToken } from '@/lib/receipts/deviceToken';

const CONSENT_VERSION = 'v1';

// GET /api/receipts/consent?deviceToken=... -- has this device already
// accepted the current consent version?
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const deviceToken = searchParams.get('deviceToken') || '';
  if (!isValidDeviceToken(deviceToken)) {
    return NextResponse.json({ error: 'Invalid device token' }, { status: 400 });
  }

  const client = getServiceClient();
  if (!client) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

  const { data } = await client
    .from('receipt_consents')
    .select('consented_at')
    .eq('device_token', deviceToken)
    .eq('consent_version', CONSENT_VERSION)
    .maybeSingle();

  return NextResponse.json({ consented: !!data, consentedAt: data?.consented_at ?? null });
}

// POST /api/receipts/consent -- records the one-time consent screen (spec §4).
export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (!body || !isValidDeviceToken(body.deviceToken)) {
    return NextResponse.json({ error: 'Invalid device token' }, { status: 400 });
  }

  const client = getServiceClient();
  if (!client) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

  const { error } = await client
    .from('receipt_consents')
    .upsert(
      { device_token: body.deviceToken, consent_version: CONSENT_VERSION },
      { onConflict: 'device_token,consent_version' }
    );

  if (error) {
    console.error('[/api/receipts/consent] insert failed:', error.message);
    return NextResponse.json({ error: 'Could not record consent' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
