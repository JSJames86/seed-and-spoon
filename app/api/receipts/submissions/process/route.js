import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/spoonassist/priceEngine';
import { extractReceiptFromImage } from '@/lib/receipts/extraction';
import { matchLineItems, persistAlias, lightNormalize } from '@/lib/receipts/matching';
import { matchStore } from '@/lib/receipts/storeMatch';
import { checkPriceSanity } from '@/lib/receipts/sanityCheck';
import { toUnitPriceRow } from '@/lib/pricing/cache';
import { confidenceFor } from '@/lib/pricing/confidence';

const BUCKET = 'receipts';
const BATCH_SIZE = 20;
// No review screen in this flow (INTEGRATION-NOTES.md §1), unlike the
// personal price-confirmation pipeline -- so only lines the matcher itself
// is confident about (the same bar receipt_line_items.match_status calls
// 'auto_matched') get written to price_quotes. Softer matches are logged
// for the aliasing signal and otherwise dropped, same as an unreviewed
// personal-flow line would be.
const AUTO_MATCH_STATUS = 'auto_matched';

// GET /api/receipts/submissions/process -- extraction hand-off for Send Us
// the Receipts. Reads image, price_quotes source='community_receipt' -- the
// price_quotes.source check constraint has no 'send-us-the-receipts' value
// (INTEGRATION-NOTES.md §1 suggested tagging rows that way, but that's not
// a real source in lib/pricing/confidence.ts or the DB constraint); the
// campaign is instead tagged in meta.campaign so it stays queryable without
// touching the resolver's source-based confidence logic. Cron-triggered
// like /api/receipts/cleanup.
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

  const { data: pending, error: fetchError } = await client
    .from('receipt_submissions')
    .select('id, store_name, store_location, home_zip, purchase_date, storage_path')
    .eq('status', 'pending')
    .not('storage_path', 'is', null)
    .order('created_at', { ascending: true })
    .limit(BATCH_SIZE);

  if (fetchError) {
    console.error('[/api/receipts/submissions/process] fetch failed:', fetchError.message);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
  if (!pending?.length) return NextResponse.json({ processed: 0, extracted: 0, rejected: 0 });

  let extracted = 0;
  let rejected = 0;

  for (const submission of pending) {
    const outcome = await processOne(client, submission);
    if (outcome === 'not_configured') break; // nothing will succeed this run -- stop the batch, leave the rest pending
    if (outcome === 'extracted') extracted += 1;
    if (outcome === 'rejected') rejected += 1;
  }

  return NextResponse.json({ processed: extracted + rejected, extracted, rejected });
}

async function processOne(client, submission) {
  const { data: fileBlob, error: downloadError } = await client.storage
    .from(BUCKET)
    .download(submission.storage_path);
  if (downloadError || !fileBlob) {
    console.error('[/api/receipts/submissions/process] download failed:', downloadError?.message);
    await client.from('receipt_submissions')
      .update({ status: 'rejected', rejection_reason: 'download_failed' })
      .eq('id', submission.id);
    return 'rejected';
  }

  const buffer = Buffer.from(await fileBlob.arrayBuffer());
  const mediaType = fileBlob.type || 'image/jpeg';

  const extraction = await extractReceiptFromImage(buffer, mediaType);
  if (extraction.error === 'not_configured') return 'not_configured';
  if (extraction.error) {
    await client.from('receipt_submissions')
      .update({ status: 'rejected', rejection_reason: extraction.error })
      .eq('id', submission.id);
    return 'rejected';
  }

  const { receipt } = extraction;

  if (receipt.containsPaymentOrLoyaltyInfo) {
    // "If we can see it, we discard it" -- delete the image immediately,
    // don't wait for the 30-day cleanup job.
    await client.storage.from(BUCKET).remove([submission.storage_path]);
    await client.from('receipt_submissions').update({
      status: 'rejected',
      rejection_reason: 'visible_payment_info',
      storage_path: null,
      image_deleted_at: new Date().toISOString(),
    }).eq('id', submission.id);
    return 'rejected';
  }

  const zip = submission.home_zip;
  const foodLines = receipt.lineItems.filter((li) => li.isFood);
  const receiptDateIso = receipt.receiptDate
    ? new Date(receipt.receiptDate).toISOString()
    : new Date().toISOString();

  const [storeGuess, matches] = await Promise.all([
    matchStore(receipt.storeNameRaw || submission.store_name, zip),
    matchLineItems(foodLines.map((li) => ({ rawText: li.rawText })), client),
  ]);

  const matchByRawText = new Map(matches.map((m) => [m.rawText, m]));

  for (const li of foodLines) {
    const match = matchByRawText.get(li.rawText);

    if (!match?.normalizedName || match.matchStatus !== AUTO_MATCH_STATUS) {
      await client.from('receipt_unmatched_lines').insert({
        raw_text: li.rawText,
        raw_text_normalized: lightNormalize(li.rawText),
      });
      continue;
    }

    await persistAlias(client, li.rawText, match.normalizedName, 'model');

    if (!storeGuess?.chainId) continue; // price_quotes.chain_id is NOT NULL -- nothing to write without a store match

    const price = li.unitPrice ?? (li.lineTotal && li.quantity ? li.lineTotal / li.quantity : null);
    if (!price || price <= 0) continue;

    const catalogItem = { productId: match.normalizedName, name: li.rawText, quantity: li.quantity || 1, unit: li.unit || 'each' };
    const sanity = await checkPriceSanity({ ...catalogItem, price, chainId: storeGuess.chainId, zip });
    if (!sanity.ok) continue;

    const quote = {
      productId: match.normalizedName,
      chainId: storeGuess.chainId,
      storeId: storeGuess.storeId || undefined,
      price,
      unit: catalogItem.unit,
      source: 'community_receipt',
      confidence: confidenceFor('community_receipt', receiptDateIso),
      asOf: receiptDateIso,
      meta: {
        campaign: 'send-us-the-receipts',
        receipt_submission_id: submission.id,
        home_zip: zip || null,
        on_sale: li.onSale,
        raw_text: li.rawText,
      },
    };

    const { error: insertError } = await client.from('price_quotes').insert(toUnitPriceRow(quote, catalogItem));
    if (insertError) {
      console.error('[/api/receipts/submissions/process] price_quotes insert failed:', insertError.message);
    }
  }

  await client.from('receipt_submissions').update({
    status: 'extracted',
    extracted_at: new Date().toISOString(),
    purchase_date: submission.purchase_date || receipt.receiptDate || null,
    store_chain_id: storeGuess?.chainId ?? null,
    store_id: storeGuess?.storeId ?? null,
  }).eq('id', submission.id);

  return 'extracted';
}
