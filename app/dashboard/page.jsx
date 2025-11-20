'use client';

import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Button from '@/components/Button';

export default function DashboardPage() {
  const { user, profile } = useAuth();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-cream py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="heading-lg text-charcoal mb-2">
              Welcome back, {user?.first_name || user?.username}!
            </h1>
            <p className="body-md text-gray-600">
              Manage your account and view your activity
            </p>
          </div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="heading-sm text-charcoal mb-4">Profile</h2>
              <div className="space-y-3">
                <div>
                  <p className="body-sm text-gray-500">Username</p>
                  <p className="body-md font-bold text-charcoal">{user?.username}</p>
                </div>
                <div>
                  <p className="body-sm text-gray-500">Email</p>
                  <p className="body-md font-bold text-charcoal">{user?.email}</p>
                </div>
                {profile?.bio && (
                  <div>
                    <p className="body-sm text-gray-500">Bio</p>
                    <p className="body-md text-charcoal">{profile.bio}</p>
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                href="/dashboard/profile"
                className="w-full mt-4"
              >
                Edit Profile
              </Button>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="heading-sm text-charcoal mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Button variant="secondary" href="/donate" className="w-full">
                  Make a Donation
                </Button>
                <Button variant="outline" href="/volunteer" className="w-full">
                  Volunteer
                </Button>
                <Button variant="outline" href="/causes" className="w-full">
                  View Causes
                </Button>
              </div>
            </div>

            {/* Activity Card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="heading-sm text-charcoal mb-4">Recent Activity</h2>
              <p className="body-md text-gray-600">
                Your recent donations and volunteer activities will appear here.
              </p>
              <p className="body-sm text-gray-500 mt-4">
                No recent activity yet.
              </p>
            </div>
          </div>

          {/* Information Section */}
          <div className="mt-8 bg-white rounded-xl shadow-md p-6">
            <h2 className="heading-sm text-charcoal mb-4">Account Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="body-md font-bold text-charcoal mb-2">Member Since</h3>
                <p className="body-md text-gray-600">
                  {user?.date_joined
                    ? new Date(user.date_joined).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : 'N/A'
                  }
                </p>
              </div>
              <div>
                <h3 className="body-md font-bold text-charcoal mb-2">Account Status</h3>
                <p className="body-md text-gray-600">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
