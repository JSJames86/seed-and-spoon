import { createClient } from '@supabase/supabase-js';
import PostClient from './PostClient';
import { notFound } from 'next/navigation';

// ISR floor — admin saves call revalidatePath() for immediate refresh,
// this just bounds staleness if that ever fails to fire.
export const revalidate = 300;

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const supabase = getSupabase();
  if (!supabase) return { title: 'Blog – Seed & Spoon NJ' };

  const { data } = await supabase
    .from('posts')
    .select('title, excerpt, cover_image_url, meta_title, meta_description')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!data) return { title: 'Blog – Seed & Spoon NJ' };

  const title = data.meta_title || data.title;
  const description = data.meta_description || data.excerpt || '';

  return {
    title: `${title} – Seed & Spoon NJ`,
    description,
    openGraph: {
      title,
      description,
      images: data.cover_image_url ? [data.cover_image_url] : [],
      url: `https://seedandspoon.org/blog/${slug}`,
      type: 'article',
    },
  };
}

export default async function PostPage({ params }) {
  const { slug } = await params;
  const supabase = getSupabase();

  if (!supabase) return <PostClient post={null} />;

  const { data: post, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error || !post) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.meta_description || post.excerpt || undefined,
    image: post.cover_image_url || undefined,
    datePublished: post.published_at || post.created_at,
    dateModified: post.updated_at || post.published_at || post.created_at,
    author: { '@type': 'Person', name: post.author_name || 'Seed & Spoon Team' },
    publisher: {
      '@type': 'Organization',
      name: 'Seed & Spoon NJ',
      logo: { '@type': 'ImageObject', url: 'https://seedandspoon.org/logo.png' },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://seedandspoon.org/blog/${slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <PostClient post={post} />
    </>
  );
}
