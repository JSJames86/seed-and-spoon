'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';

function PostCard({ post }) {
  const date = post.published_at
    ? format(new Date(post.published_at), 'MMM d, yyyy')
    : '';

  return (
    <article className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col">
      {post.cover_image_url && (
        <Link href={`/blog/${post.slug}`} className="block aspect-video overflow-hidden">
          <img
            src={post.cover_image_url}
            alt={post.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </Link>
      )}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
          {post.author_name && <span>{post.author_name}</span>}
          {post.author_name && date && <span>·</span>}
          {date && <time dateTime={post.published_at}>{date}</time>}
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-3 leading-snug">
          <Link href={`/blog/${post.slug}`} className="hover:text-green-700 transition-colors">
            {post.title}
          </Link>
        </h2>
        {post.excerpt && (
          <p className="text-gray-600 text-sm leading-relaxed flex-1">{post.excerpt}</p>
        )}
        <Link
          href={`/blog/${post.slug}`}
          className="mt-4 text-green-600 hover:text-green-800 text-sm font-semibold transition-colors"
        >
          Read more →
        </Link>
      </div>
    </article>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-24">
      <p className="text-4xl mb-4">✏️</p>
      <h2 className="text-xl font-bold text-gray-900 mb-2">No posts yet</h2>
      <p className="text-gray-500">Check back soon — updates are on the way.</p>
    </div>
  );
}

export default function BlogClient() {
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const LIMIT = 9;

  useEffect(() => {
    setLoading(true);
    fetch(`/api/blog/posts?limit=${LIMIT}&offset=${offset}`)
      .then((r) => r.json())
      .then(({ posts: p = [], total: t = 0 }) => {
        setPosts(p);
        setTotal(t);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [offset]);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-green-700 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-green-200 uppercase tracking-widest text-sm font-semibold mb-3">
            From Our Team
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">Blog</h1>
          <p className="text-green-100 text-lg max-w-xl mx-auto">
            Stories, updates, and news from Seed &amp; Spoon NJ.
          </p>
        </div>
      </section>

      {/* Posts */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
                <div className="aspect-video bg-gray-200" />
                <div className="p-6 space-y-3">
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                  <div className="h-5 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>

            {/* Pagination */}
            {total > LIMIT && (
              <div className="flex justify-center gap-3 mt-12">
                <button
                  onClick={() => setOffset(Math.max(0, offset - LIMIT))}
                  disabled={offset === 0}
                  className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium disabled:opacity-40 hover:border-gray-400 transition"
                >
                  ← Previous
                </button>
                <span className="px-4 py-2 text-sm text-gray-500">
                  {Math.floor(offset / LIMIT) + 1} / {Math.ceil(total / LIMIT)}
                </span>
                <button
                  onClick={() => setOffset(offset + LIMIT)}
                  disabled={offset + LIMIT >= total}
                  className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium disabled:opacity-40 hover:border-gray-400 transition"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
