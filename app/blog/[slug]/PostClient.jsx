'use client';

import Link from 'next/link';
import { format } from 'date-fns';

export default function PostClient({ post }) {
  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Post unavailable.</p>
      </div>
    );
  }

  const date = post.published_at
    ? format(new Date(post.published_at), 'MMMM d, yyyy')
    : '';

  return (
    <div className="min-h-screen bg-white">
      {/* Cover */}
      {post.cover_image_url && (
        <div className="w-full max-h-[480px] overflow-hidden">
          <img
            src={post.cover_image_url}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <article className="max-w-3xl mx-auto px-4 py-12">
        {/* Back */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1 text-sm text-green-700 hover:text-green-900 font-medium mb-8 transition-colors"
        >
          ← Back to Blog
        </Link>

        {/* Meta */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          {post.author_name && <span>{post.author_name}</span>}
          {post.author_name && date && <span>·</span>}
          {date && <time dateTime={post.published_at}>{date}</time>}
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-8">
          {post.title}
        </h1>

        {/* Body */}
        <div
          className="prose prose-lg max-w-none
            prose-headings:font-bold prose-headings:text-gray-900
            prose-p:text-gray-700 prose-p:leading-relaxed
            prose-a:text-green-700 prose-a:no-underline hover:prose-a:underline
            prose-img:rounded-xl prose-img:shadow-md
            prose-blockquote:border-green-500 prose-blockquote:text-gray-600
            prose-ul:text-gray-700 prose-ol:text-gray-700
            prose-strong:text-gray-900"
          dangerouslySetInnerHTML={{ __html: post.body || '' }}
        />

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-100">
          <Link
            href="/blog"
            className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            ← More Posts
          </Link>
        </div>
      </article>
    </div>
  );
}
