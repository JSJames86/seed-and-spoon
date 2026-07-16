import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/spoonassist/priceEngine';

const RETENTION_DAYS = 30;
const BATCH_SIZE = 200;

// GET /api/receipts/cleanup -- deletes receipt photos older than 30 days
// (spec §4: "Receipt images: retain 30 days for dispute/debug, then
// auto-delete. Extracted price data persists; images don't."). Scheduled
// via vercel.json `crons` (daily) -- Vercel sends
// `Authorization: Bearer $CRON_SECRET` for cron-triggered requests when
// CRON_SECRET is set; checked here since this deletes data (the repo's
// other cron route, /api/foodbanks, is a read-only refresh and doesn't need
// this).
export async function GET(request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = request.headers.get('authorization');
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const client = getServiceClient();
  if (!client) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const { data: expired, error: fetchError } = await client
    .from('receipt_uploads')
    .select('id, storage_path')
    .not('storage_path', 'is', null)
    .lt('created_at', cutoff)
    .limit(BATCH_SIZE);

  if (fetchError) {
    console.error('[/api/receipts/cleanup] fetch failed:', fetchError.message);
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 });
  }
  if (!expired?.length) return NextResponse.json({ deleted: 0 });

  const paths = expired.map((r) => r.storage_path);
  const { error: removeError } = await client.storage.from('receipts').remove(paths);
  if (removeError) {
    console.error('[/api/receipts/cleanup] storage remove failed:', removeError.message);
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 });
  }

  const ids = expired.map((r) => r.id);
  const { error: updateError } = await client
    .from('receipt_uploads')
    .update({ storage_path: null, image_deleted_at: new Date().toISOString() })
    .in('id', ids);

  if (updateError) console.error('[/api/receipts/cleanup] row update failed:', updateError.message);

  return NextResponse.json({ deleted: expired.length });
}
