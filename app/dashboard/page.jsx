'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [recurringDonations, setRecurringDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // TODO: Migrate to Supabase - currently uses legacy API endpoints
  const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          throw new Error('No access token found');
        }

        const [donationsRes, recurringRes] = await Promise.all([
          fetch(`${API_URL}/api/auth/donations/`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }),
          fetch(`${API_URL}/api/auth/recurring-donations/`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }),
        ]);

        if (donationsRes.ok) {
          const donationsData = await donationsRes.json();
          setDonations(donationsData);
        }

        if (recurringRes.ok) {
          const recurringData = await recurringRes.json();
          setRecurringDonations(recurringData);
        }
      } catch (err) {
        setError('Failed to load donation data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_URL]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-cream py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-charcoal">
              Welcome back, {user?.first_name || user?.username}!
            </h1>
            <p className="mt-2 text-gray-600">
              Thank you for being a valued supporter of Seed & Spoon NJ
            </p>
          </div>

          {/* Profile Summary Card */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-charcoal mb-4">Your Profile</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium">{user?.phone || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Member Since</p>
                <p className="font-medium">{user?.date_joined ? formatDate(user.date_joined) : 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Donations</p>
                <p className="font-medium">{user?.total_donated ? formatCurrency(user.total_donated) : '$0.00'}</p>
              </div>
            </div>
            <div className="mt-4">
              <Link
                href="/profile"
                className="text-primary-soil hover:text-gradient-green font-medium text-sm"
              >
                Edit Profile →
              </Link>
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-8">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Recurring Donations Section */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-charcoal mb-4">Active Recurring Donations</h2>
            {loading ? (
              <p className="text-gray-600">Loading...</p>
            ) : recurringDonations.length === 0 ? (
              <div>
                <p className="text-gray-600 mb-4">You don't have any active recurring donations.</p>
                <Link
                  href="/donate"
                  className="inline-block bg-primary-soil text-white px-4 py-2 rounded-md hover:bg-gradient-green"
                >
                  Set up monthly giving
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recurringDonations.map((recurring) => (
                  <div key={recurring.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-charcoal">
                          {formatCurrency(recurring.amount)} / month
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {recurring.campaign_name || 'General Support'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Since {formatDate(recurring.start_date)}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        recurring.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {recurring.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Donation History Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-charcoal mb-4">Donation History</h2>
            {loading ? (
              <p className="text-gray-600">Loading...</p>
            ) : donations.length === 0 ? (
              <div>
                <p className="text-gray-600 mb-4">You haven't made any donations yet.</p>
                <Link
                  href="/donate"
                  className="inline-block bg-primary-soil text-white px-4 py-2 rounded-md hover:bg-gradient-green"
                >
                  Make your first donation
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Campaign
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {donations.map((donation) => (
                      <tr key={donation.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(donation.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {donation.campaign_name || 'General Support'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-charcoal">
                          {formatCurrency(donation.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            donation.status === 'completed' ? 'bg-green-100 text-green-800' :
                            donation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {donation.status}
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
      </div>
    </ProtectedRoute>
  );
}
