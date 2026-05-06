'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { format } from 'date-fns';

// Load Tiptap editor client-side only (no SSR)
const RichEditor = dynamic(() => import('./RichEditor'), { ssr: false, loading: () => (
  <div className="border border-gray-300 rounded-lg h-64 bg-gray-50 animate-pulse" />
) });

function slugify(title) {
  return title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 80);
}

// ─── Post list ────────────────────────────────────────────────────────────────

function PostRow({ post, onEdit, onDelete, onToggleStatus }) {
  const [confirming, setConfirming] = useState(false);
  const date = post.published_at
    ? format(new Date(post.published_at), 'MMM d, yyyy')
    : format(new Date(post.created_at), 'MMM d, yyyy');

  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0 gap-4">
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 truncate">{post.title}</p>
        <p className="text-sm text-gray-500">{date}</p>
      </div>
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
        post.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
      }`}>
        {post.status}
      </span>
      <div className="flex gap-2 flex-shrink-0">
        <button
          onClick={() => onToggleStatus(post)}
          className="text-xs px-3 py-1.5 rounded border border-gray-300 hover:border-gray-400 text-gray-700 transition"
        >
          {post.status === 'published' ? 'Unpublish' : 'Publish'}
        </button>
        <button
          onClick={() => onEdit(post)}
          className="text-xs px-3 py-1.5 rounded border border-green-300 text-green-700 hover:bg-green-50 transition"
        >
          Edit
        </button>
        {!confirming ? (
          <button
            onClick={() => setConfirming(true)}
            className="text-xs px-3 py-1.5 rounded border border-red-200 text-red-600 hover:bg-red-50 transition"
          >
            Delete
          </button>
        ) : (
          <div className="flex gap-1">
            <button onClick={() => onDelete(post.id)} className="text-xs px-2 py-1.5 rounded bg-red-600 text-white hover:bg-red-700 transition">
              Confirm
            </button>
            <button onClick={() => setConfirming(false)} className="text-xs px-2 py-1.5 rounded border border-gray-300 text-gray-600 hover:bg-gray-50 transition">
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Post editor ──────────────────────────────────────────────────────────────

const EMPTY_POST = {
  id: null,
  title: '',
  slug: '',
  cover_image_url: '',
  excerpt: '',
  body: '',
  status: 'draft',
  author_name: '',
};

function PostEditor({ initial, onSave, onCancel }) {
  const [fields, setFields] = useState({ ...EMPTY_POST, ...initial });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [slugEdited, setSlugEdited] = useState(!!initial?.id);

  const set = (key, val) => setFields((p) => ({ ...p, [key]: val }));

  const handleTitleChange = (e) => {
    const t = e.target.value;
    set('title', t);
    if (!slugEdited) set('slug', slugify(t));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fields.title.trim()) { setError('Title is required.'); return; }
    setSaving(true);
    setError('');

    const payload = {
      title: fields.title,
      slug: fields.slug || slugify(fields.title),
      cover_image_url: fields.cover_image_url || null,
      content: fields.body,
      excerpt: fields.excerpt,
      status: fields.status,
      author_name: fields.author_name,
    };

    try {
      const url = fields.id ? `/api/blog/posts/${fields.id}` : '/api/blog/posts';
      const method = fields.id ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      onSave(data.post);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold text-gray-900">
          {fields.id ? 'Edit Post' : 'New Post'}
        </h3>
        <button type="button" onClick={onCancel} className="text-sm text-gray-500 hover:text-gray-700">
          ← Back to posts
        </button>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Title *</label>
        <input
          type="text"
          value={fields.title}
          onChange={handleTitleChange}
          placeholder="Post title"
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Slug */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Slug</label>
        <input
          type="text"
          value={fields.slug}
          onChange={(e) => { set('slug', e.target.value); setSlugEdited(true); }}
          placeholder="url-friendly-slug"
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <p className="text-xs text-gray-400 mt-1">seedandspoon.org/blog/{fields.slug || '…'}</p>
      </div>

      {/* Cover image */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Cover Image URL</label>
        <input
          type="url"
          value={fields.cover_image_url}
          onChange={(e) => set('cover_image_url', e.target.value)}
          placeholder="https://..."
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        {fields.cover_image_url && (
          <img src={fields.cover_image_url} alt="Cover preview" className="mt-2 rounded-lg max-h-40 object-cover" />
        )}
      </div>

      {/* Author */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Author Name</label>
        <input
          type="text"
          value={fields.author_name}
          onChange={(e) => set('author_name', e.target.value)}
          placeholder="Seed & Spoon Team"
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Excerpt */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Excerpt</label>
        <textarea
          value={fields.excerpt}
          onChange={(e) => set('excerpt', e.target.value)}
          rows={2}
          placeholder="Short summary shown in the blog listing..."
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
        />
      </div>

      {/* Body */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Content</label>
        <RichEditor
          content={fields.body}
          onChange={(html) => set('body', html)}
        />
      </div>

      {/* Status + Submit */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
        <div className="flex gap-2">
          {['draft', 'published'].map((s) => (
            <label
              key={s}
              className={`cursor-pointer rounded-full px-4 py-2 text-sm font-medium border transition-colors select-none ${
                fields.status === s
                  ? 'bg-green-600 border-green-600 text-white'
                  : 'bg-white border-gray-300 text-gray-700 hover:border-green-500'
              }`}
            >
              <input
                type="radio"
                value={s}
                checked={fields.status === s}
                onChange={() => set('status', s)}
                className="sr-only"
              />
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </label>
          ))}
        </div>

        {error && <p className="text-sm text-red-600 flex-1">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="ml-auto bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold py-3 px-8 rounded-lg transition"
        >
          {saving ? 'Saving…' : fields.id ? 'Save Changes' : 'Create Post'}
        </button>
      </div>
    </form>
  );
}

// ─── Contributors panel ───────────────────────────────────────────────────────

function ContributorsPanel({ supabase }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [editors, setEditors] = useState([]);

  const loadEditors = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email, role')
      .in('role', ['editor', 'admin'])
      .order('role');
    setEditors(data || []);
  }, [supabase]);

  useEffect(() => { loadEditors(); }, [loadEditors]);

  const grantEditor = async () => {
    if (!email.trim() || !supabase) return;
    setStatus('');
    const { data: user } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('email', email.trim().toLowerCase())
      .single();

    if (!user) { setStatus('No account found with that email.'); return; }
    if (user.role === 'admin') { setStatus('This user is already an admin.'); return; }

    await supabase.from('profiles').update({ role: 'editor' }).eq('id', user.id);
    setEmail('');
    setStatus('Editor access granted.');
    loadEditors();
  };

  const revokeEditor = async (id) => {
    if (!supabase) return;
    await supabase.from('profiles').update({ role: 'user' }).eq('id', id);
    loadEditors();
  };

  return (
    <div className="mt-10 border-t border-gray-100 pt-8">
      <h3 className="text-base font-bold text-gray-900 mb-4">Manage Blog Contributors</h3>

      <div className="flex gap-2 mb-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="user@email.com"
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          onClick={grantEditor}
          className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition"
        >
          Grant Editor
        </button>
      </div>
      {status && <p className="text-sm text-gray-600 mb-3">{status}</p>}

      {editors.length > 0 && (
        <div className="space-y-2">
          {editors.map((e) => (
            <div key={e.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 text-sm">
              <div>
                <span className="font-medium text-gray-900">{[e.first_name, e.last_name].filter(Boolean).join(' ') || e.email}</span>
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${e.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                  {e.role}
                </span>
              </div>
              {e.role === 'editor' && (
                <button onClick={() => revokeEditor(e.id)} className="text-xs text-red-600 hover:text-red-800 transition">
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main tab component ───────────────────────────────────────────────────────

export default function BlogTab({ profile, supabase }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null = list, {} = new post, post = editing

  const isAdmin = profile?.role === 'admin';

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      // Editors see all their own posts; admins see all
      const q = supabase.from('posts').select('id, title, slug, status, author_name, published_at, created_at').order('created_at', { ascending: false });
      const { data } = await q;
      setPosts(data || []);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  const handleSave = (post) => {
    loadPosts();
    setEditing(null);
  };

  const handleDelete = async (id) => {
    await fetch(`/api/blog/posts/${id}`, { method: 'DELETE' });
    loadPosts();
  };

  const handleToggleStatus = async (post) => {
    const newStatus = post.status === 'published' ? 'draft' : 'published';
    await fetch(`/api/blog/posts/${post.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    loadPosts();
  };

  const handleEdit = async (post) => {
    const res = await fetch(`/api/blog/posts/${post.id}`);
    const data = await res.json();
    setEditing(data.post ? { ...data.post, body: data.post.body || '' } : post);
  };

  if (editing !== null) {
    return (
      <PostEditor
        initial={editing}
        onSave={handleSave}
        onCancel={() => setEditing(null)}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Blog Posts</h2>
        <button
          onClick={() => setEditing(EMPTY_POST)}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-5 rounded-lg transition text-sm"
        >
          + New Post
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-3xl mb-3">✏️</p>
          <p className="font-medium">No posts yet.</p>
          <p className="text-sm mt-1">Click &quot;+ New Post&quot; to write your first one.</p>
        </div>
      ) : (
        <div>
          {posts.map((post) => (
            <PostRow
              key={post.id}
              post={post}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      )}

      {isAdmin && <ContributorsPanel supabase={supabase} />}
    </div>
  );
}
