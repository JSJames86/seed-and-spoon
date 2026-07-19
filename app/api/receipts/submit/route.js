import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/spoonassist/priceEngine';
import { isValidDeviceToken } from '@/lib/receipts/deviceToken';
import { checkRateLimit, getClientIp } from '@/lib/api-helpers';

// POST /api/receipts/submit -- Send Us the Receipts, anonymous community
// receipt intake (distinct from /api/receipts/upload's personal-use,
// review-and-confirm flow). Multipart form-data: image, storeName,
// storeLocation?, homeZip?, deviceToken, consentVersion. No auth --
// ownership is the device token, same pattern as the rest of this domain.
// Extraction runs later, out of band, in app/api/receipts/submissions/process.

const BUCKET = 'receipts';
const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']);
const DAILY_LIMIT_MS = 24 * 60 * 60 * 1000;

export async function POST(request) {
  let form;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid upload' }, { status: 400 });
  }

  const deviceToken = String(form.get('deviceToken') ?? '').trim();
  if (!isValidDeviceToken(deviceToken)) {
    return NextResponse.json({ error: 'Invalid device token' }, { status: 400 });
  }

  const deviceLimit = checkRateLimit(`receipt_submission:${deviceToken}`, 10, DAILY_LIMIT_MS);
  if (!deviceLimit.allowed) {
    return NextResponse.json({ error: "That's plenty for today -- thank you! Try again tomorrow." }, { status: 429 });
  }
  const ipLimit = checkRateLimit(`receipt_submission_ip:${getClientIp(request)}`, 30, DAILY_LIMIT_MS);
  if (!ipLimit.allowed) {
    return NextResponse.json({ error: 'Too many uploads from this network today. Try again tomorrow.' }, { status: 429 });
  }

  const image = form.get('image');
  const storeName = String(form.get('storeName') ?? '').trim();
  const storeLocation = String(form.get('storeLocation') ?? '').trim();
  const homeZip = String(form.get('homeZip') ?? '').trim();
  const consentVersion = String(form.get('consentVersion') ?? '').trim();

  if (!image || typeof image === 'string') {
    return NextResponse.json({ error: 'A receipt photo is required.' }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(image.type)) {
    return NextResponse.json({ error: 'Upload a photo (JPG, PNG, or HEIC).' }, { status: 400 });
  }
  if (image.size > MAX_BYTES) {
    return NextResponse.json({ error: 'Photo is too large (10 MB max).' }, { status: 400 });
  }
  if (!storeName || storeName.length > 120) {
    return NextResponse.json({ error: 'Store name is required.' }, { status: 400 });
  }
  if (homeZip && !/^\d{5}$/.test(homeZip)) {
    return NextResponse.json({ error: 'ZIP should be 5 digits.' }, { status: 400 });
  }
  if (!consentVersion) {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }

  const client = getServiceClient();
  if (!client) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

  const ext = image.type === 'image/png' ? 'png'
    : image.type === 'image/webp' ? 'webp'
    : image.type.startsWith('image/hei') ? 'heic'
    : 'jpg';
  const now = new Date();
  const folder = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
  const storagePath = `submissions/${folder}/${crypto.randomUUID()}.${ext}`;

  const buffer = Buffer.from(await image.arrayBuffer());
  const { error: uploadError } = await client.storage
    .from(BUCKET)
    .upload(storagePath, buffer, { contentType: image.type, upsert: false });
  if (uploadError) {
    console.error('[/api/receipts/submit] storage upload failed:', uploadError.message);
    return NextResponse.json({ error: 'Upload failed. Try again.' }, { status: 500 });
  }

  const { error: insertError } = await client.from('receipt_submissions').insert({
    device_token: deviceToken,
    store_name: storeName,
    store_location: storeLocation || null,
    home_zip: homeZip || null,
    storage_path: storagePath,
    consent_version: consentVersion,
  });
  if (insertError) {
    console.error('[/api/receipts/submit] insert failed:', insertError.message);
    // Best-effort cleanup so we don't strand an orphaned image.
    await client.storage.from(BUCKET).remove([storagePath]);
    return NextResponse.json({ error: 'Something went wrong. Try again.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
