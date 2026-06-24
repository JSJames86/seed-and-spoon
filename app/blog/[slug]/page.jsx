import { createClient } from '@supabase/supabase-js';
import PostClient from './PostClient';
import { notFound } from 'next/navigation';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const supabase = getSupabase();
  if (!supabase) return { title: 'Blog – Seed & Spoon' };

  const { data } = await supabase
    .from('posts')
    .select('title, excerpt, cover_image_url')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!data) return { title: 'Blog – Seed & Spoon' };

  return {
    title: `${data.title} – Seed & Spoon`,
    description: data.excerpt || '',
    openGraph: {
      title: data.title,
      description: data.excerpt || '',
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

  return <PostClient post={post} />;
}
