import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

async function getSessionClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  const cookieStore = await cookies();
  return createServerClient(url, anon, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: () => {},
    },
  });
}

function isValidApiKey(request) {
  const auth = request.headers.get('authorization') || '';
  const token = auth.replace('Bearer ', '').trim();
  const apiKey = process.env.BLOG_API_KEY;
  return apiKey && token === apiKey;
}

// GET /api/blog/posts — public, returns published posts
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
  const offset = parseInt(searchParams.get('offset') || '0');

  const supabase = getServiceClient();
  if (!supabase) {
    return Response.json({ posts: [], total: 0 });
  }

  const { data, error, count } = await supabase
    .from('posts')
    .select('id, title, slug, cover_image_url, excerpt, author_name, published_at, created_at', { count: 'exact' })
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    if (error.code === '42P01') return Response.json({ posts: [], total: 0 });
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ posts: data, total: count });
}

const VALID_PILLARS = ['understanding', 'nutrition', 'economic-mobility', 'social-determinants', 'systems-change'];

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 80);
}

// POST /api/blog/posts — create post (API key OR editor/admin session)
export async function POST(request) {
  let authorId = null;
  let authorName = 'Seed & Spoon Team';

  const apiKeyValid = isValidApiKey(request);

  if (!apiKeyValid) {
    const sessionClient = await getSessionClient();
    if (!sessionClient) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { claims } } = await sessionClient.auth.getClaims();
    if (!claims) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const serviceClient = getServiceClient();
    const { data: profile } = await serviceClient
      .from('profiles')
      .select('role, first_name, last_name')
      .eq('id', claims.sub)
      .single();

    if (!profile || !['editor', 'admin'].includes(profile.role)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    authorId = claims.sub;
    authorName = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || claims.email;
  }

  let body;
  try { body = await request.json(); } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { title, cover_image_url, content, excerpt, status = 'draft' } = body;
  if (!title?.trim()) return Response.json({ error: 'Title is required' }, { status: 400 });

  const slug = body.slug?.trim() || slugify(title);

  const row = {
    title: String(title).trim().slice(0, 300),
    slug,
    cover_image_url: cover_image_url || null,
    body: content || '',
    excerpt: excerpt ? String(excerpt).trim().slice(0, 500) : null,
    status: ['draft', 'published'].includes(status) ? status : 'draft',
    author_id: authorId,
    author_name: body.author_name || authorName,
    published_at: status === 'published' ? new Date().toISOString() : null,
    meta_title: body.meta_title ? String(body.meta_title).trim().slice(0, 70) : null,
    meta_description: body.meta_description ? String(body.meta_description).trim().slice(0, 160) : null,
    pillar: VALID_PILLARS.includes(body.pillar) ? body.pillar : null,
    tags: Array.isArray(body.tags) ? body.tags.map((t) => String(t).trim()).filter(Boolean).slice(0, 20) : [],
    author_orcid: body.author_orcid ? String(body.author_orcid).trim().slice(0, 20) : null,
  };

  const supabase = getServiceClient();
  if (!supabase) return Response.json({ error: 'Database not configured' }, { status: 503 });

  const { data, error } = await supabase.from('posts').insert([row]).select().single();
  if (error) {
    if (error.code === '23505') return Response.json({ error: 'Slug already exists' }, { status: 409 });
    return Response.json({ error: error.message }, { status: 500 });
  }

  if (data.status === 'published') {
    revalidatePath('/blog');
    revalidatePath(`/blog/${data.slug}`);
  }

  return Response.json({ post: data }, { status: 201 });
}
