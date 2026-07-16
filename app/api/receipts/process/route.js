import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/spoonassist/priceEngine';
import { isValidDeviceToken } from '@/lib/receipts/deviceToken';
import { checkRateLimit, getClientIp } from '@/lib/api-helpers';
import { extractReceiptFromImage } from '@/lib/receipts/extraction';
import { matchLineItems } from '@/lib/receipts/matching';
import { matchStore } from '@/lib/receipts/storeMatch';

const DAILY_LIMIT_MS = 24 * 60 * 60 * 1000;
const RESUMABLE_STATUSES = new Set(['uploaded', 'failed']);

// POST /api/receipts/process -- body: { receiptUploadId, deviceToken, zip? }
// Runs extraction (Claude vision) + ingredient matching for one receipt,
// populates receipt_line_items, and moves status to 'review' (or 'failed').
// Separate from /api/receipts/upload so a slow vision call never blocks the
// upload response (spec §2.1/§2.2). Per-IP limited in addition to
// per-device (spec §3: "it calls a paid API").
export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (!body || !isValidDeviceToken(body.deviceToken) || !body.receiptUploadId) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const ipLimit = checkRateLimit(`receipt_process_ip:${getClientIp(request)}`, 30, DAILY_LIMIT_MS);
  if (!ipLimit.allowed) {
    return NextResponse.json({ error: 'Too many receipt scans from this network today. Try again tomorrow.' }, { status: 429 });
  }

  const client = getServiceClient();
  if (!client) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

  const { data: upload, error: fetchError } = await client
    .from('receipt_uploads')
    .select('id, device_token, storage_path, status, zip')
    .eq('id', body.receiptUploadId)
    .maybeSingle();

  if (fetchError || !upload) return NextResponse.json({ error: 'Receipt not found' }, { status: 404 });
  if (upload.device_token !== body.deviceToken) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (!RESUMABLE_STATUSES.has(upload.status)) {
    return NextResponse.json({ error: `Receipt is already ${upload.status}` }, { status: 409 });
  }
  if (!upload.storage_path) return NextResponse.json({ error: 'Receipt image is no longer available' }, { status: 410 });

  await client.from('receipt_uploads').update({ status: 'processing' }).eq('id', upload.id);

  const { data: fileBlob, error: downloadError } = await client.storage.from('receipts').download(upload.storage_path);
  if (downloadError || !fileBlob) {
    console.error('[/api/receipts/process] download failed:', downloadError?.message);
    await client.from('receipt_uploads').update({ status: 'failed', failure_reason: 'download_failed' }).eq('id', upload.id);
    return NextResponse.json({ error: "Couldn't read this receipt -- try uploading again." }, { status: 502 });
  }

  const buffer = Buffer.from(await fileBlob.arrayBuffer());
  const mediaType = fileBlob.type || 'image/jpeg';

  const extraction = await extractReceiptFromImage(buffer, mediaType);
  if (extraction.error) {
    const messages = {
      not_configured: 'Receipt scanning is not available right now.',
      no_receipt_found: "We couldn't find a readable receipt in that photo -- try a clearer, well-lit shot.",
      extraction_failed: "Couldn't read this receipt -- try a clearer photo.",
    };
    await client.from('receipt_uploads').update({ status: 'failed', failure_reason: extraction.error }).eq('id', upload.id);
    return NextResponse.json({ error: messages[extraction.error] ?? messages.extraction_failed }, { status: extraction.error === 'not_configured' ? 503 : 422 });
  }

  const { receipt } = extraction;
  const zip = body.zip || upload.zip;

  const [storeGuess, matches] = await Promise.all([
    matchStore(receipt.storeNameRaw, zip),
    matchLineItems(
      receipt.lineItems.filter((li) => li.isFood).map((li) => ({ rawText: li.rawText })),
      client
    ),
  ]);

  const matchByRawText = new Map(matches.map((m) => [m.rawText, m]));
  const foodLines = receipt.lineItems.filter((li) => li.isFood);

  const lineItemRows = foodLines.map((li) => {
    const match = matchByRawText.get(li.rawText);
    return {
      receipt_upload_id: upload.id,
      raw_text: li.rawText,
      quantity: li.quantity,
      unit: li.unit,
      unit_price: li.unitPrice,
      line_total: li.lineTotal,
      is_food: true,
      on_sale: li.onSale,
      normalized_name: match?.normalizedName ?? null,
      match_confidence: match?.matchConfidence ?? null,
      match_source: match?.matchSource ?? null,
      match_status: match?.matchStatus ?? 'unmatched',
    };
  });

  const { data: insertedLines, error: linesError } = lineItemRows.length
    ? await client.from('receipt_line_items').insert(lineItemRows).select('id, raw_text, quantity, unit, unit_price, line_total, on_sale, normalized_name, match_confidence, match_status')
    : { data: [], error: null };

  if (linesError) {
    console.error('[/api/receipts/process] line item insert failed:', linesError.message);
    await client.from('receipt_uploads').update({ status: 'failed', failure_reason: 'save_failed' }).eq('id', upload.id);
    return NextResponse.json({ error: 'Could not save extracted items -- try again.' }, { status: 500 });
  }

  await client
    .from('receipt_uploads')
    .update({
      status: 'review',
      store_name_raw: receipt.storeNameRaw,
      store_chain_id: storeGuess?.chainId ?? null,
      store_id: storeGuess?.storeId ?? null,
      receipt_date: receipt.receiptDate,
      subtotal: receipt.subtotal,
      extraction_notes: receipt.extractionNotes,
      processed_at: new Date().toISOString(),
    })
    .eq('id', upload.id);

  return NextResponse.json({
    receiptUploadId: upload.id,
    store: {
      nameRaw: receipt.storeNameRaw,
      matchedChainId: storeGuess?.chainId ?? null,
      matchedName: storeGuess?.name ?? null,
    },
    receiptDate: receipt.receiptDate,
    subtotal: receipt.subtotal,
    extractionNotes: receipt.extractionNotes,
    lineItems: insertedLines,
    skippedNonFoodCount: receipt.lineItems.length - foodLines.length,
  });
}
