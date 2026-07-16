import { NextResponse } from 'next/server';
import { createAuthClient } from '@/lib/supabase-server';
import { getServiceClient } from '@/lib/spoonassist/priceEngine';
import { toUnitPriceRow } from '@/lib/pricing/cache';

async function requireAdmin(request) {
  const token = (request.headers.get('authorization') || '').replace('Bearer ', '').trim();
  if (!token) return null;
  const sessionClient = createAuthClient(token);
  if (!sessionClient) return null;
  const { data: { user } } = await sessionClient.auth.getUser();
  if (!user) return null;
  const service = getServiceClient();
  if (!service) return null;
  const { data: profile } = await service.from('profiles').select('role').eq('id', user.id).single();
  return profile?.role === 'admin' ? user : null;
}

// GET /api/receipts/moderation -- simple admin view (spec §3): receipt
// lines whose price failed the sanity-bounds check, held for review instead
// of landing in price_quotes automatically.
export async function GET(request) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const client = getServiceClient();
  const { data, error } = await client
    .from('receipt_line_items')
    .select('id, raw_text, quantity, unit, unit_price, line_total, normalized_name, flag_reason, created_at, receipt_upload_id, receipt_uploads(store_name_confirmed, store_chain_id, store_id, receipt_date)')
    .eq('price_status', 'flagged')
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ flagged: data ?? [] });
}

// POST /api/receipts/moderation -- body: { lineItemId, action: 'approve'|'reject' }
// approve writes the (previously-flagged) price into price_quotes anyway --
// a human overriding the automatic sanity bound; reject leaves it out.
export async function POST(request) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body?.lineItemId || !['approve', 'reject'].includes(body.action)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const client = getServiceClient();
  const { data: line, error: fetchError } = await client
    .from('receipt_line_items')
    .select('id, raw_text, quantity, unit, unit_price, line_total, on_sale, normalized_name, price_status, receipt_upload_id, receipt_uploads(store_chain_id, store_id, receipt_date)')
    .eq('id', body.lineItemId)
    .maybeSingle();

  if (fetchError || !line) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (line.price_status !== 'flagged') return NextResponse.json({ error: 'Line is not flagged' }, { status: 409 });

  if (body.action === 'reject') {
    await client.from('receipt_line_items').update({ price_status: 'rejected' }).eq('id', line.id);
    return NextResponse.json({ ok: true, action: 'rejected' });
  }

  const upload = line.receipt_uploads;
  const price = line.unit_price ?? (line.line_total && line.quantity ? line.line_total / line.quantity : null);
  if (!price || !upload?.store_chain_id) {
    return NextResponse.json({ error: 'Missing price or store -- cannot write' }, { status: 422 });
  }

  const receiptDateIso = upload.receipt_date ? new Date(upload.receipt_date).toISOString() : new Date().toISOString();
  const catalogItem = { productId: line.normalized_name, name: line.raw_text, quantity: line.quantity || 1, unit: line.unit || 'each' };
  const quote = {
    productId: line.normalized_name,
    chainId: upload.store_chain_id,
    storeId: upload.store_id || undefined,
    price,
    unit: catalogItem.unit,
    source: 'community_receipt',
    confidence: 0.9,
    asOf: receiptDateIso,
    meta: { on_sale: line.on_sale, receipt_upload_id: line.receipt_upload_id, raw_text: line.raw_text, moderator_approved: true },
  };

  const row = toUnitPriceRow(quote, catalogItem);
  const { data: inserted, error: insertError } = await client.from('price_quotes').insert(row).select('id').single();
  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });

  await client.from('receipt_line_items').update({ price_status: 'written', price_quote_id: inserted.id }).eq('id', line.id);
  return NextResponse.json({ ok: true, action: 'approved' });
}
