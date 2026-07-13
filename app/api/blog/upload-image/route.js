import { createClient } from '@supabase/supabase-js';
import { createAuthClient } from '@/lib/supabase-server';

const MAX_BYTES = 5 * 1024 * 1024;

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

async function getAuthorizedUser(request) {
  const token = (request.headers.get('authorization') || '').replace('Bearer ', '').trim();
  if (!token) return null;

  const sessionClient = createAuthClient(token);
  if (!sessionClient) return null;

  const { data: { user } } = await sessionClient.auth.getUser();
  if (!user) return null;

  const service = getServiceClient();
  const { data: profile } = await service.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || !['editor', 'admin'].includes(profile.role)) return null;
  return user;
}

// POST /api/blog/upload-image — editor/admin only, returns a public URL
export async function POST(request) {
  const user = await getAuthorizedUser(request);
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = getServiceClient();
  if (!supabase) return Response.json({ error: 'Storage not configured' }, { status: 503 });

  let formData;
  try { formData = await request.formData(); } catch {
    return Response.json({ error: 'Invalid upload' }, { status: 400 });
  }

  const file = formData.get('file');
  if (!file || typeof file === 'string') return Response.json({ error: 'No file provided' }, { status: 400 });
  if (!file.type?.startsWith('image/')) return Response.json({ error: 'File must be an image' }, { status: 400 });
  if (file.size > MAX_BYTES) return Response.json({ error: 'Image must be under 5MB' }, { status: 400 });

  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const path = `posts/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from('blog-images')
    .upload(path, buffer, { contentType: file.type, upsert: false });
  if (error) return Response.json({ error: error.message }, { status: 500 });

  const { data } = supabase.storage.from('blog-images').getPublicUrl(path);
  return Response.json({ url: data.publicUrl });
}
