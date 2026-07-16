import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/spoonassist/priceEngine';
import { isValidDeviceToken } from '@/lib/receipts/deviceToken';
import { checkRateLimit, getClientIp } from '@/lib/api-helpers';

// Client compresses to ~1600px long edge / JPEG ~0.8 before upload (spec
// §2.1) -- this cap is a generous server-side safety net, not the primary
// size control.
const MAX_BYTES = 8 * 1024 * 1024;
const DAILY_LIMIT_MS = 24 * 60 * 60 * 1000;

// POST /api/receipts/upload -- multipart form-data: file, deviceToken, zip?.
// Creates the receipt_uploads row and stores the image in the private
// 'receipts' bucket. Does NOT run extraction -- call /api/receipts/process
// next (kept separate so a slow vision call never blocks the upload
// response, spec §2.1/§2.2).
export async function POST(request) {
  let formData;
  try { formData = await request.formData(); } catch {
    return NextResponse.json({ error: 'Invalid upload' }, { status: 400 });
  }

  const deviceToken = formData.get('deviceToken');
  if (!isValidDeviceToken(deviceToken)) {
    return NextResponse.json({ error: 'Invalid device token' }, { status: 400 });
  }

  const deviceLimit = checkRateLimit(`receipt_upload:${deviceToken}`, 10, DAILY_LIMIT_MS);
  if (!deviceLimit.allowed) {
    return NextResponse.json({ error: 'Daily receipt scan limit reached. Try again tomorrow.' }, { status: 429 });
  }
  const ipLimit = checkRateLimit(`receipt_upload_ip:${getClientIp(request)}`, 30, DAILY_LIMIT_MS);
  if (!ipLimit.allowed) {
    return NextResponse.json({ error: 'Too many uploads from this network today. Try again tomorrow.' }, { status: 429 });
  }

  const file = formData.get('file');
  if (!file || typeof file === 'string') return NextResponse.json({ error: 'No image provided' }, { status: 400 });
  if (!file.type?.startsWith('image/')) return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: 'Image is too large' }, { status: 400 });

  const zip = typeof formData.get('zip') === 'string' ? formData.get('zip').trim() : null;

  const client = getServiceClient();
  if (!client) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

  const ext = (file.type.split('/')[1] || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const path = `${deviceToken}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await client.storage
    .from('receipts')
    .upload(path, buffer, { contentType: file.type, upsert: false });
  if (uploadError) {
    console.error('[/api/receipts/upload] storage upload failed:', uploadError.message);
    return NextResponse.json({ error: 'Could not store image' }, { status: 500 });
  }

  const { data: inserted, error: insertError } = await client
    .from('receipt_uploads')
    .insert({ device_token: deviceToken, storage_path: path, status: 'uploaded', zip: zip || null })
    .select('id')
    .single();

  if (insertError) {
    console.error('[/api/receipts/upload] insert failed:', insertError.message);
    await client.storage.from('receipts').remove([path]);
    return NextResponse.json({ error: 'Could not save receipt' }, { status: 500 });
  }

  return NextResponse.json({ receiptUploadId: inserted.id });
}
