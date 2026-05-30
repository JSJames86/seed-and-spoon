'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import BlogTab from './BlogTab';
import { supabase } from '@/lib/supabase';

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.email) fetchDonations();
  }, [user]);

  const fetchDonations = async () => {
    try {
      const { data, error: dbError } = await supabase
        .from('donations')
        .select('id, donor_name, amount, donation_type, status, donated_at')
        .eq('donor_email', user.email)
        .order('donated_at', { ascending: false })
        .limit(20);

      if (dbError) throw dbError;
      setDonations(data || []);
    } catch (err) {
      setError('Failed to load donation history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const canBlog = profile?.role === 'editor' || profile?.role === 'admin';

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-cream py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-charcoal">
              Welcome back, {profile?.first_name || user?.email}!
            </h1>
            <p className="mt-2 text-gray-600">Thank you for being a valued supporter of Seed & Spoon NJ</p>
          </div>

          <div className="flex gap-1 mb-8 border-b border-gray-200">
            {[
              { id: 'overview', label: 'Overview' },
              ...(canBlog ? [{ id: 'blog', label: 'Blog' }] : []),
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors -mb-px ${
                  activeTab === tab.id
                    ? 'border-green-600 text-green-700'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'blog' && canBlog && (
            <div className="bg-white rounded-lg shadow p-6">
              <BlogTab profile={profile} supabase={supabase} />
            </div>
          )}

          {activeTab === 'overview' && (
            <div>
              <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h2 className="text-xl font-semibold text-charcoal mb-4">Your Profile</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Role</p>
                    <p className="font-medium capitalize">{profile?.role || 'user'}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Link href="/profile" className="text-primary-soil hover:text-gradient-green font-medium text-sm">
                    Edit Profile →
                  </Link>
                </div>
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-4 mb-8">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-charcoal mb-4">Donation History</h2>
                {loading ? (
                  <p className="text-gray-600">Loading...</p>
                ) : donations.length === 0 ? (
                  <div>
                    <p className="text-gray-600 mb-4">You haven&apos;t made any donations yet.</p>
                    <Link href="/donate" className="inline-block bg-primary-soil text-white px-4 py-2 rounded-md hover:bg-gradient-green">
                      Make your first donation
                    </Link>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          {['Date', 'Type', 'Amount', 'Status'].map(h => (
                            <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {donations.map(d => (
                          <tr key={d.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {d.donated_at ? formatDate(d.donated_at) : '—'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                              {d.donation_type?.replace('_', ' ')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-charcoal">
                              {formatCurrency(d.amount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                d.status === 'completed' ? 'bg-green-100 text-green-800' :
                                d.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {d.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
