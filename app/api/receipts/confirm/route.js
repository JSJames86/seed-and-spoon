import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/spoonassist/priceEngine';
import { isValidDeviceToken } from '@/lib/receipts/deviceToken';
import { checkPriceSanity } from '@/lib/receipts/sanityCheck';
import { persistAlias, lightNormalize } from '@/lib/receipts/matching';
import { toUnitPriceRow } from '@/lib/pricing/cache';
import { confidenceFor } from '@/lib/pricing/confidence';

// POST /api/receipts/confirm -- body:
//   { deviceToken, receiptUploadId, zip?,
//     store: { chainId, storeId, name } | { other: true, rawName },
//     lineItems: [{ id, included, normalizedName }] }
//
// Applies the user's review-screen edits, then for every included/matched
// line: runs the sanity-bounds check (spec §3) and writes a
// 'community_receipt' PriceQuote into price_quotes via
// lib/pricing/cache.ts's toUnitPriceRow() -- the same write-through shape
// Phase 1's providers use, so cachedQuoteProvider picks these up with zero
// resolver changes. as_of is the receipt_date, not the confirm timestamp
// (spec §2.5). Unmatched/excluded lines are logged to
// receipt_unmatched_lines; accepted matches are persisted to
// receipt_ingredient_aliases.
export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (!body || !isValidDeviceToken(body.deviceToken) || !body.receiptUploadId || !Array.isArray(body.lineItems)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const client = getServiceClient();
  if (!client) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

  const { data: upload, error: fetchError } = await client
    .from('receipt_uploads')
    .select('id, device_token, status, receipt_date, zip')
    .eq('id', body.receiptUploadId)
    .maybeSingle();

  if (fetchError || !upload) return NextResponse.json({ error: 'Receipt not found' }, { status: 404 });
  if (upload.device_token !== body.deviceToken) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (upload.status !== 'review') return NextResponse.json({ error: `Receipt is ${upload.status}, not ready to confirm` }, { status: 409 });

  const { data: storedLines, error: linesFetchError } = await client
    .from('receipt_line_items')
    .select('id, raw_text, quantity, unit, unit_price, line_total, on_sale, normalized_name, match_confidence, match_source, match_status')
    .eq('receipt_upload_id', upload.id);

  if (linesFetchError) return NextResponse.json({ error: 'Could not load receipt lines' }, { status: 500 });

  const editsById = new Map(body.lineItems.map((li) => [li.id, li]));
  const zip = body.zip || upload.zip;
  const receiptDateIso = upload.receipt_date ? new Date(upload.receipt_date).toISOString() : new Date().toISOString();

  const storeChainId = body.store?.other ? null : (body.store?.chainId ?? null);
  const storeId = body.store?.other ? null : (body.store?.storeId ?? null);
  const storeName = body.store?.other ? (body.store?.rawName ?? null) : (body.store?.name ?? null);

  let itemsWritten = 0;
  let itemsFlagged = 0;
  let itemsUnmatched = 0;

  for (const line of storedLines ?? []) {
    const edit = editsById.get(line.id);
    const included = edit ? edit.included !== false : true;
    const normalizedName = edit && 'normalizedName' in edit ? edit.normalizedName : line.normalized_name;

    if (!included) {
      continue; // user deleted this line -- no price write, no unmatched log (it's not "unmatched," it's excluded)
    }

    if (!normalizedName) {
      itemsUnmatched += 1;
      await client.from('receipt_unmatched_lines').insert({
        receipt_upload_id: upload.id,
        raw_text: line.raw_text,
        raw_text_normalized: lightNormalize(line.raw_text),
      });
      await client.from('receipt_line_items').update({ match_status: 'user_rejected' }).eq('id', line.id);
      continue;
    }

    // A match the model proposed and the user didn't reject (or a name the
    // user typed themselves) is worth remembering -- spec §2.4 "the system
    // gets cheaper and better with every receipt."
    const wasUserEdited = edit && edit.normalizedName && edit.normalizedName !== line.normalized_name;
    await persistAlias(client, line.raw_text, normalizedName, wasUserEdited ? 'user' : 'model');

    if (!storeChainId) {
      // No confirmed chain -- price still gets recorded as a regional
      // observation via receipt_line_items, but there's no chain to key a
      // price_quotes row on (spec §2.3: "hold these in review status").
      await client.from('receipt_line_items').update({ match_status: 'user_confirmed', normalized_name: normalizedName }).eq('id', line.id);
      continue;
    }

    const price = line.unit_price ?? (line.line_total && line.quantity ? line.line_total / line.quantity : null);
    if (!price || price <= 0) {
      await client.from('receipt_line_items').update({ match_status: 'user_confirmed', normalized_name: normalizedName, price_status: 'rejected', flag_reason: 'no_price' }).eq('id', line.id);
      continue;
    }

    const catalogItem = { productId: normalizedName, name: line.raw_text, quantity: line.quantity || 1, unit: line.unit || 'each' };

    const sanity = await checkPriceSanity({ ...catalogItem, price, chainId: storeChainId, zip });

    if (!sanity.ok) {
      itemsFlagged += 1;
      await client.from('receipt_line_items').update({
        match_status: 'user_confirmed',
        normalized_name: normalizedName,
        price_status: 'flagged',
        flag_reason: `price $${price.toFixed(2)} is ${sanity.ratio?.toFixed(2)}x the reference ($${sanity.reference?.toFixed(2)})`,
      }).eq('id', line.id);
      continue;
    }

    const quote = {
      productId: normalizedName,
      chainId: storeChainId,
      storeId: storeId || undefined,
      price,
      unit: catalogItem.unit,
      source: 'community_receipt',
      confidence: confidenceFor('community_receipt', receiptDateIso),
      asOf: receiptDateIso,
      meta: { on_sale: line.on_sale, receipt_upload_id: upload.id, raw_text: line.raw_text },
    };

    const row = toUnitPriceRow(quote, catalogItem);
    const { data: inserted, error: insertError } = await client.from('price_quotes').insert(row).select('id').single();

    if (insertError) {
      console.error('[/api/receipts/confirm] price_quotes insert failed:', insertError.message);
      await client.from('receipt_line_items').update({ price_status: 'rejected', flag_reason: 'write_failed' }).eq('id', line.id);
      continue;
    }

    itemsWritten += 1;
    await client.from('receipt_line_items').update({
      match_status: 'user_confirmed',
      normalized_name: normalizedName,
      price_status: 'written',
      price_quote_id: inserted.id,
    }).eq('id', line.id);
  }

  await client.from('receipt_uploads').update({
    status: 'confirmed',
    confirmed_at: new Date().toISOString(),
    store_chain_id: storeChainId,
    store_id: storeId,
    store_name_confirmed: storeName,
  }).eq('id', upload.id);

  return NextResponse.json({ itemsWritten, itemsFlagged, itemsUnmatched, storeName });
}
