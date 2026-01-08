'use client';

import { useState, useEffect } from 'react';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { api, endpoints } from '@/lib/apiClient';
import { RoleGuard, DonorOnly, VolunteerOnly, ClientOnly, AdminOnly, useRoleAccess } from '@/components/RoleGuard';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const { isAdmin, isDonor, isVolunteer, isClient } = useRoleAccess();

  const [donations, setDonations] = useState([]);
  const [recurringDonations, setRecurringDonations] = useState([]);
  const [volunteerHours, setVolunteerHours] = useState([]);
  const [volunteerTasks, setVolunteerTasks] = useState([]);
  const [clientResources, setClientResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchPromises = [];

        // Fetch donor data
        if (isDonor || isAdmin) {
          fetchPromises.push(
            api.get(endpoints.donations.history)
              .then(res => res.ok && setDonations(res.data || []))
              .catch(() => {}),
            api.get(endpoints.donations.recurring)
              .then(res => res.ok && setRecurringDonations(res.data || []))
              .catch(() => {})
          );
        }

        // Fetch volunteer data
        if (isVolunteer || isAdmin) {
          fetchPromises.push(
            api.get(endpoints.volunteers.hours)
              .then(res => res.ok && setVolunteerHours(res.data || []))
              .catch(() => {}),
            api.get(endpoints.volunteers.tasks)
              .then(res => res.ok && setVolunteerTasks(res.data || []))
              .catch(() => {})
          );
        }

        // Fetch client data
        if (isClient || isAdmin) {
          fetchPromises.push(
            api.get(endpoints.profile.get)
              .then(res => res.ok && setClientResources(res.data?.resources || []))
              .catch(() => {})
          );
        }

        await Promise.all(fetchPromises);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isDonor, isVolunteer, isClient, isAdmin]);

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
              Thank you for being a valued member of Seed & Spoon NJ
            </p>
            {profile?.role && (
              <div className="mt-2 flex gap-2">
                {(Array.isArray(profile.role) ? profile.role : [profile.role]).map((role) => (
                  <span
                    key={role}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                  >
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </span>
                ))}
              </div>
            )}
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
              <DonorOnly>
                <div>
                  <p className="text-sm text-gray-600">Total Donations</p>
                  <p className="font-medium">{user?.total_donated ? formatCurrency(user.total_donated) : '$0.00'}</p>
                </div>
              </DonorOnly>
              <VolunteerOnly>
                <div>
                  <p className="text-sm text-gray-600">Total Volunteer Hours</p>
                  <p className="font-medium">{profile?.total_hours || 0} hours</p>
                </div>
              </VolunteerOnly>
            </div>
            <div className="mt-4">
              <Link
                href="/profile"
                className="text-primary-soil hover:text-gradient-green font-medium text-sm"
              >
                Edit Profile
              </Link>
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-8">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Admin Dashboard Section */}
          <AdminOnly>
            <div className="bg-white rounded-lg shadow p-6 mb-8 border-l-4 border-purple-500">
              <h2 className="text-xl font-semibold text-charcoal mb-4 flex items-center">
                <span className="mr-2">Admin Dashboard</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Admin
                </span>
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link
                  href="/admin/users"
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center"
                >
                  <div className="text-2xl mb-2">Users</div>
                  <p className="text-sm text-gray-600">Manage Users</p>
                </Link>
                <Link
                  href="/admin/donations"
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center"
                >
                  <div className="text-2xl mb-2">Donations</div>
                  <p className="text-sm text-gray-600">View Donations</p>
                </Link>
                <Link
                  href="/admin/intakes"
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center"
                >
                  <div className="text-2xl mb-2">Intakes</div>
                  <p className="text-sm text-gray-600">Client Intakes</p>
                </Link>
                <Link
                  href="/admin/reports"
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center"
                >
                  <div className="text-2xl mb-2">Reports</div>
                  <p className="text-sm text-gray-600">View Reports</p>
                </Link>
              </div>
            </div>
          </AdminOnly>

          {/* Donor Section - Donation History & Recurring */}
          <DonorOnly>
            {/* Recurring Donations Section */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-semibold text-charcoal mb-4 flex items-center">
                <span className="mr-2">Active Recurring Donations</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Donor
                </span>
              </h2>
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
            <div className="bg-white rounded-lg shadow p-6 mb-8">
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Receipt
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {donation.receipt_url && (
                              <a
                                href={donation.receipt_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary-soil hover:underline"
                              >
                                Download
                              </a>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </DonorOnly>

          {/* Volunteer Section - Calendar, Hours, Tasks */}
          <VolunteerOnly>
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-semibold text-charcoal mb-4 flex items-center">
                <span className="mr-2">Volunteer Dashboard</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Volunteer
                </span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Hours Summary */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Hours This Month</h3>
                  <p className="text-3xl font-bold text-blue-600">
                    {volunteerHours.reduce((sum, h) => sum + (h.hours || 0), 0)}
                  </p>
                  <p className="text-sm text-gray-600">hours logged</p>
                </div>

                {/* Upcoming Tasks */}
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Upcoming Tasks</h3>
                  <p className="text-3xl font-bold text-green-600">
                    {volunteerTasks.filter(t => t.status === 'pending').length}
                  </p>
                  <p className="text-sm text-gray-600">tasks assigned</p>
                </div>

                {/* Quick Actions */}
                <div className="bg-orange-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Quick Actions</h3>
                  <div className="space-y-2">
                    <Link
                      href="/volunteer/log-hours"
                      className="block text-sm text-orange-600 hover:underline"
                    >
                      Log Hours
                    </Link>
                    <Link
                      href="/volunteer/calendar"
                      className="block text-sm text-orange-600 hover:underline"
                    >
                      View Calendar
                    </Link>
                  </div>
                </div>
              </div>

              {/* Recent Tasks */}
              {volunteerTasks.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-800 mb-3">Recent Tasks</h3>
                  <div className="space-y-2">
                    {volunteerTasks.slice(0, 5).map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-800">{task.title}</p>
                          <p className="text-sm text-gray-600">{task.date && formatDate(task.date)}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          task.status === 'completed' ? 'bg-green-100 text-green-800' :
                          task.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {task.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </VolunteerOnly>

          {/* Client Section - Intake Status & Resources */}
          <ClientOnly>
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-semibold text-charcoal mb-4 flex items-center">
                <span className="mr-2">Your Resources</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  Client
                </span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Intake Status */}
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Intake Status</h3>
                  <p className="text-lg font-medium text-green-600">
                    {profile?.intake_status || 'Active'}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Last updated: {profile?.last_contact ? formatDate(profile.last_contact) : 'N/A'}
                  </p>
                </div>

                {/* Next Pickup */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Next Pickup</h3>
                  <p className="text-lg font-medium text-blue-600">
                    {profile?.next_pickup ? formatDate(profile.next_pickup) : 'TBD'}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {profile?.pickup_location || 'Location to be assigned'}
                  </p>
                </div>
              </div>

              {/* Resources */}
              <div className="mt-6">
                <h3 className="font-semibold text-gray-800 mb-3">Available Resources</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link
                    href="/get-help"
                    className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center"
                  >
                    <div className="text-2xl mb-2">Find Food</div>
                    <p className="text-sm text-gray-600">Food resource map</p>
                  </Link>
                  <Link
                    href="/contact"
                    className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center"
                  >
                    <div className="text-2xl mb-2">Contact</div>
                    <p className="text-sm text-gray-600">Get support</p>
                  </Link>
                  <Link
                    href="/profile"
                    className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center"
                  >
                    <div className="text-2xl mb-2">Profile</div>
                    <p className="text-sm text-gray-600">Update info</p>
                  </Link>
                </div>
              </div>
            </div>
          </ClientOnly>
        </div>
      </div>
    </ProtectedRoute>
  );
}
