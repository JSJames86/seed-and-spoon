'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';

const MEALS_PER_DOLLAR = 3; // $1 = ~3 meals
const SUGGESTED_AMOUNTS = [10, 25, 50, 100];

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const [donations, setDonations] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.email) {
      fetchDonations();
      fetchPosts();
    }
  }, [user]);

  const fetchDonations = async () => {
    try {
      const res = await fetch(`/api/donor/donations?email=${encodeURIComponent(user.email)}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load');
      setDonations(json.donations || []);
    } catch (err) {
      setError('Failed to load donation history');
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const { data } = await supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, published_at')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(3);
      setPosts(data || []);
    } catch {}
  };

  const totalGiven = donations
    .filter(d => d.status === 'completed')
    .reduce((sum, d) => sum + Number(d.amount), 0);

  const mealsProvided = Math.round(totalGiven * MEALS_PER_DOLLAR);
  const firstName = profile?.first_name || user?.email?.split('@')[0] || 'Friend';
  const canBlog = profile?.role === 'editor' || profile?.role === 'admin';

  const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
  const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-cream">

        {/* Impact Hero */}
        <div className="bg-[var(--green-primary)] text-white px-4 py-10">
          <div className="max-w-3xl mx-auto">
            <p className="text-green-200 text-sm font-medium uppercase tracking-widest mb-1">Welcome back</p>
            <h1 className="text-3xl font-bold mb-6">{firstName} 👋</h1>

            {totalGiven > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-xl p-5">
                  <p className="text-green-200 text-xs uppercase tracking-wide mb-1">Total Donated</p>
                  <p className="text-3xl font-bold">{fmt(totalGiven)}</p>
                </div>
                <div className="bg-white/10 rounded-xl p-5">
                  <p className="text-green-200 text-xs uppercase tracking-wide mb-1">Meals Provided</p>
                  <p className="text-3xl font-bold">~{mealsProvided.toLocaleString()}</p>
                  <p className="text-green-200 text-xs mt-1">to Newark families</p>
                </div>
              </div>
            ) : (
              <div className="bg-white/10 rounded-xl p-5">
                <p className="text-white/80 text-sm">You haven&apos;t donated yet — every dollar provides ~3 meals to Newark families.</p>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">

          {/* Give More CTA */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-charcoal mb-1">Make a difference today</h2>
            <p className="text-sm text-gray-500 mb-4">Your gift goes directly to meals, gardens, and food access in Newark.</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {SUGGESTED_AMOUNTS.map(amt => (
                <Link
                  key={amt}
                  href={`/donate?amount=${amt}`}
                  className="px-4 py-2 rounded-lg border border-[var(--green-primary)] text-[var(--green-primary)] text-sm font-semibold hover:bg-[var(--green-primary)] hover:text-white transition-all"
                >
                  ${amt}
                </Link>
              ))}
              <Link
                href="/donate"
                className="px-4 py-2 rounded-lg bg-[var(--green-primary)] text-white text-sm font-semibold hover:bg-[var(--leaf-mid)] transition-all"
              >
                Custom
              </Link>
            </div>
          </div>

          {/* Donation History */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-charcoal">Donation History</h2>
              {donations.length > 0 && (
                <span className="text-xs text-gray-400">{donations.length} donation{donations.length !== 1 ? 's' : ''}</span>
              )}
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-3 mb-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : donations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 text-sm mb-3">No donations yet</p>
                <Link href="/donate" className="text-[var(--green-primary)] font-semibold text-sm hover:underline">
                  Make your first donation →
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {donations.map(d => (
                  <div key={d.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-charcoal">{fmt(d.amount)}</p>
                      <p className="text-xs text-gray-400">
                        {d.donated_at ? fmtDate(d.donated_at) : '—'} · {d.donation_type?.replace('_', ' ')}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      d.status === 'completed' ? 'bg-green-100 text-green-700' :
                      d.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {d.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Updates Feed */}
          {posts.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-charcoal mb-4">Latest from Seed & Spoon</h2>
              <div className="space-y-4">
                {posts.map(post => (
                  <Link key={post.id} href={`/blog/${post.slug}`} className="block group">
                    <p className="text-sm font-semibold text-charcoal group-hover:text-[var(--green-primary)] transition-colors">
                      {post.title}
                    </p>
                    {post.excerpt && (
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{post.excerpt}</p>
                    )}
                    <p className="text-xs text-gray-300 mt-1">{post.published_at ? fmtDate(post.published_at) : ''}</p>
                  </Link>
                ))}
              </div>
              <Link href="/blog" className="block mt-4 text-xs text-[var(--green-primary)] font-semibold hover:underline">
                View all updates →
              </Link>
            </div>
          )}

          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-charcoal">Account</h2>
                <p className="text-xs text-gray-400 mt-0.5">{user?.email}</p>
                {profile?.role && (
                  <p className="text-xs text-gray-400 capitalize">{profile.role}</p>
                )}
              </div>
              <Link href="/profile" className="text-sm text-[var(--green-primary)] font-semibold hover:underline">
                Edit Profile →
              </Link>
            </div>
          </div>

          {/* Admin shortcut */}
          {profile?.role === 'admin' && (
            <Link href="/admin" className="block bg-charcoal text-white rounded-xl p-4 text-center text-sm font-semibold hover:bg-gray-800 transition-all">
              Go to Admin Dashboard →
            </Link>
          )}

        </div>
      </div>
    </ProtectedRoute>
  );
}
