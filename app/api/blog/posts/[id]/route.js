import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

async function getAuthorizedUser(request) {
  const apiKey = process.env.BLOG_API_KEY;
  const auth = request.headers.get('authorization') || '';
  const token = auth.replace('Bearer ', '').trim();
  if (apiKey && token === apiKey) return { role: 'admin', id: null };

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;

  const cookieStore = await cookies();
  const sessionClient = createServerClient(url, anon, {
    cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} },
  });

  const { data: { claims } } = await sessionClient.auth.getClaims();
  if (!claims) return null;

  const service = getServiceClient();
  const { data: profile } = await service
    .from('profiles')
    .select('role, first_name, last_name')
    .eq('id', claims.sub)
    .single();

  if (!profile || !['editor', 'admin'].includes(profile.role)) return null;
  return { ...profile, id: claims.sub };
}

// GET /api/blog/posts/[id] — get single post (for editor)
export async function GET(request, { params }) {
  const { id } = await params;
  const user = await getAuthorizedUser(request);
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = getServiceClient();
  if (!supabase) return Response.json({ error: 'Database not configured' }, { status: 503 });

  const { data, error } = await supabase.from('posts').select('*').eq('id', id).single();
  if (error) return Response.json({ error: 'Not found' }, { status: 404 });

  return Response.json({ post: data });
}

// PUT /api/blog/posts/[id] — update post
export async function PUT(request, { params }) {
  const { id } = await params;
  const user = await getAuthorizedUser(request);
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  let body;
  try { body = await request.json(); } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const supabase = getServiceClient();
  if (!supabase) return Response.json({ error: 'Database not configured' }, { status: 503 });

  // Editors can only update their own posts
  if (user.role === 'editor' && user.id) {
    const { data: existing } = await supabase.from('posts').select('author_id').eq('id', id).single();
    if (!existing || existing.author_id !== user.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  const updates = {};
  if (body.title !== undefined) updates.title = String(body.title).trim().slice(0, 300);
  if (body.slug !== undefined) updates.slug = String(body.slug).trim().slice(0, 80);
  if (body.cover_image_url !== undefined) updates.cover_image_url = body.cover_image_url;
  if (body.content !== undefined) updates.body = body.content;
  if (body.excerpt !== undefined) updates.excerpt = String(body.excerpt).trim().slice(0, 500);
  if (body.author_name !== undefined) updates.author_name = body.author_name;
  if (body.status !== undefined && ['draft', 'published'].includes(body.status)) {
    updates.status = body.status;
    if (body.status === 'published') {
      // Only set published_at if newly publishing
      const { data: existing } = await supabase.from('posts').select('status, published_at').eq('id', id).single();
      if (existing?.status !== 'published') {
        updates.published_at = new Date().toISOString();
      }
    }
  }

  const { data, error } = await supabase.from('posts').update(updates).eq('id', id).select().single();
  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ post: data });
}

// DELETE /api/blog/posts/[id] — delete post (admin only)
export async function DELETE(request, { params }) {
  const { id } = await params;
  const user = await getAuthorizedUser(request);
  if (!user || user.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const supabase = getServiceClient();
  if (!supabase) return Response.json({ error: 'Database not configured' }, { status: 503 });

  const { error } = await supabase.from('posts').delete().eq('id', id);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ ok: true });
}
