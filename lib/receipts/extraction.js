// ---------------------------------------------------------------------------
// Receipt photo -> structured line items, via Claude vision (Phase 3 §2.2).
// Same forced-tool-use pattern as lib/spoonassist/recipeExtraction.js (the
// "Share a recipe" import) so the model's response is always well-formed
// JSON, just with an image content block instead of pasted text.
//
// Privacy hard rule (spec §2.2): the prompt instructs the model to never
// extract card/loyalty/member numbers, names, or barcodes -- scrubPII()
// below is the required SECOND layer, applied to every extracted string
// field regardless of what the model returned, before anything is persisted.
// ---------------------------------------------------------------------------

import Anthropic from '@anthropic-ai/sdk';

const MODEL = 'claude-haiku-4-5-20251001';
const MAX_RETRIES = 2;

const RECORD_RECEIPT_TOOL = {
  name: 'record_receipt',
  description: 'Records the store, date, and line items extracted from a grocery receipt photo.',
  input_schema: {
    type: 'object',
    properties: {
      found: {
        type: 'boolean',
        description: 'True only if the image is a readable grocery/retail receipt with at least one line item.',
      },
      store_name_raw: { type: 'string', description: 'Store name as printed on the receipt, e.g. "SHOPRITE OF NEWARK". Empty string if unreadable.' },
      store_address_raw: { type: 'string', description: 'Store address as printed, if present. Empty string otherwise.' },
      receipt_date: { type: 'string', description: 'Receipt date in YYYY-MM-DD format. Empty string if unreadable.' },
      currency: { type: 'string', description: 'Currency code, e.g. "USD". Default "USD" if not stated.' },
      line_items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            raw_text: { type: 'string', description: 'The item name/description exactly as printed, e.g. "CHKN BRST FAM PK".' },
            quantity: { type: 'number', description: 'Quantity or weight purchased. 1 if not stated.' },
            unit: { type: 'string', description: 'Unit for quantity, e.g. "lb", "oz", "each". "each" if not stated.' },
            unit_price: { type: 'number', description: 'Price per unit, if printed. 0 if not determinable.' },
            line_total: { type: 'number', description: 'Total price for this line as printed.' },
            is_food: { type: 'boolean', description: 'False for non-food items (paper towels, cleaning supplies, etc).' },
            on_sale: { type: 'boolean', description: 'True if the receipt marks this line as a sale/promo/discount price.' },
          },
          required: ['raw_text', 'line_total', 'is_food'],
        },
      },
      subtotal: { type: 'number', description: 'Receipt subtotal before tax, if printed. 0 if not determinable.' },
      extraction_notes: { type: 'string', description: 'Anything ambiguous or hard to read worth flagging. Empty string if nothing notable.' },
      contains_payment_or_loyalty_info: {
        type: 'boolean',
        description: 'True if the photo shows any payment card digits (full, masked, or partial), a loyalty/member/rewards number, or a barcode -- regardless of whether you transcribed them.',
      },
    },
    required: ['found', 'line_items', 'contains_payment_or_loyalty_info'],
  },
};

const RECEIPT_PROMPT =
  'This image is a photo of a grocery/retail receipt. Extract the store name, address, date, and every line ' +
  'item by calling record_receipt.\n\n' +
  'PRIVACY -- these must NEVER appear in any field you return, even if visible on the receipt: payment card ' +
  'numbers (full or partial/last-4), loyalty or member numbers, the customer\'s name, or barcode/UPC numbers. ' +
  'Skip those lines entirely -- do not transcribe them into extraction_notes either. Separately, set ' +
  'contains_payment_or_loyalty_info to true if any such payment card digits, loyalty/member/rewards number, or ' +
  'barcode is visible anywhere in the photo, even though you must not transcribe it.\n\n' +
  'Only extract purchased items (skip payment/tender lines, tax lines, totals, coupons -- those are not line ' +
  'items). If a line is illegible, omit it rather than guessing at a plausible-looking price.';

// Post-extraction scrub -- a second, deterministic layer independent of the
// model's compliance with the prompt above. Applied to every string field
// before anything is persisted (spec §2.2 "post-process with a regex scrub
// on all stored fields as a second layer").
const CARD_NUMBER_RE = /\b(?:\d[ -]?){13,19}\b/g;
const MASKED_CARD_RE = /\b[Xx*]{2,}[ -]?\d{2,4}\b/g;
const LOYALTY_LABEL_RE = /\b(loyalty|member|rewards?|card)\s*#?\s*:?\s*\d{4,}\b/gi;
const BARCODE_RE = /\b\d{8}(?:\d{4,5})?\b/g;

export function scrubPII(text) {
  if (typeof text !== 'string' || !text) return text;
  return text
    .replace(CARD_NUMBER_RE, '[redacted]')
    .replace(MASKED_CARD_RE, '[redacted]')
    .replace(LOYALTY_LABEL_RE, '[redacted]')
    .replace(BARCODE_RE, '[redacted]')
    .trim();
}

function scrubExtraction(data) {
  return {
    ...data,
    store_name_raw: scrubPII(data.store_name_raw),
    store_address_raw: scrubPII(data.store_address_raw),
    extraction_notes: scrubPII(data.extraction_notes),
    line_items: data.line_items.map((item) => ({ ...item, raw_text: scrubPII(item.raw_text) })),
  };
}

function toBase64(buffer) {
  return Buffer.isBuffer(buffer) ? buffer.toString('base64') : Buffer.from(buffer).toString('base64');
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * @param {Buffer|ArrayBuffer} imageBuffer
 * @param {string} mediaType e.g. 'image/jpeg'
 * @returns {Promise<
 *   {receipt: {storeNameRaw:string, storeAddressRaw:string, receiptDate:string|null,
 *              currency:string, lineItems:object[], subtotal:number, extractionNotes:string,
 *              containsPaymentOrLoyaltyInfo:boolean}}
 *   | {error: 'not_configured'|'no_receipt_found'|'extraction_failed'}
 * >}
 */
export async function extractReceiptFromImage(imageBuffer, mediaType = 'image/jpeg') {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { error: 'not_configured' };

  const client = new Anthropic({ apiKey });
  const imageData = toBase64(imageBuffer);

  let response;
  let attempt = 0;
  while (attempt <= MAX_RETRIES) {
    try {
      response = await client.messages.create({
        model: MODEL,
        max_tokens: 4096,
        tools: [RECORD_RECEIPT_TOOL],
        tool_choice: { type: 'tool', name: 'record_receipt' },
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: imageData } },
            { type: 'text', text: RECEIPT_PROMPT },
          ],
        }],
      });
      break;
    } catch (err) {
      attempt += 1;
      console.error(`[receipts/extraction] Claude request failed (attempt ${attempt}):`, err.message);
      if (attempt > MAX_RETRIES) return { error: 'extraction_failed' };
      await sleep(2 ** attempt * 500); // 1s, 2s
    }
  }

  const toolUse = response.content.find((block) => block.type === 'tool_use');
  if (!toolUse) return { error: 'extraction_failed' };

  const data = toolUse.input;
  const lineItems = Array.isArray(data.line_items) ? data.line_items.filter((li) => li?.raw_text) : [];

  if (!data.found || lineItems.length === 0) {
    return { error: 'no_receipt_found' };
  }

  const scrubbed = scrubExtraction({ ...data, line_items: lineItems });

  return {
    receipt: {
      storeNameRaw: scrubbed.store_name_raw || null,
      storeAddressRaw: scrubbed.store_address_raw || null,
      receiptDate: /^\d{4}-\d{2}-\d{2}$/.test(scrubbed.receipt_date) ? scrubbed.receipt_date : null,
      currency: scrubbed.currency || 'USD',
      lineItems: scrubbed.line_items.map((li) => ({
        rawText: li.raw_text,
        quantity: Number.isFinite(li.quantity) && li.quantity > 0 ? li.quantity : 1,
        unit: typeof li.unit === 'string' && li.unit.trim() ? li.unit.trim() : 'each',
        unitPrice: Number.isFinite(li.unit_price) && li.unit_price > 0 ? li.unit_price : null,
        lineTotal: Number.isFinite(li.line_total) ? li.line_total : null,
        isFood: li.is_food !== false,
        onSale: li.on_sale === true,
      })),
      subtotal: Number.isFinite(scrubbed.subtotal) ? scrubbed.subtotal : null,
      extractionNotes: scrubbed.extraction_notes || null,
      containsPaymentOrLoyaltyInfo: data.contains_payment_or_loyalty_info === true,
    },
  };
}
