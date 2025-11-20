'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, updateProfile, changePassword } = useAuth();
  const router = useRouter();
  
  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileMessage('');
    setProfileLoading(true);

    const result = await updateProfile(profileData);

    if (result.success) {
      setProfileMessage('Profile updated successfully!');
    } else {
      setProfileError(result.error);
    }

    setProfileLoading(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordMessage('');

    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordError('New passwords do not match');
      return;
    }

    setPasswordLoading(true);

    const result = await changePassword(
      passwordData.old_password,
      passwordData.new_password
    );

    if (result.success) {
      setPasswordMessage('Password changed successfully!');
      setPasswordData({
        old_password: '',
        new_password: '',
        confirm_password: '',
      });
    } else {
      setPasswordError(result.error);
    }

    setPasswordLoading(false);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-cream py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-charcoal">Profile Settings</h1>
            <p className="mt-2 text-gray-600">Manage your account information and preferences</p>
          </div>

          {/* Profile Information Section */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-charcoal mb-4">Personal Information</h2>
            
            {profileMessage && (
              <div className="rounded-md bg-green-50 p-4 mb-4">
                <p className="text-sm text-green-800">{profileMessage}</p>
              </div>
            )}

            {profileError && (
              <div className="rounded-md bg-red-50 p-4 mb-4">
                <p className="text-sm text-red-800">{profileError}</p>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-soil focus:border-primary-soil sm:text-sm"
                    value={profileData.first_name}
                    onChange={handleProfileChange}
                  />
                </div>

                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-soil focus:border-primary-soil sm:text-sm"
                    value={profileData.last_name}
                    onChange={handleProfileChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-soil focus:border-primary-soil sm:text-sm"
                  value={profileData.email}
                  onChange={handleProfileChange}
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-soil focus:border-primary-soil sm:text-sm"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="w-full md:w-auto px-6 py-3 border border-transparent text-base font-bold rounded-lg text-white bg-primary-soil hover:bg-gradient-green focus:outline-none focus:ring-4 focus:ring-primary-soil/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  {profileLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-charcoal mb-4">Change Password</h2>
            
            {passwordMessage && (
              <div className="rounded-md bg-green-50 p-4 mb-4">
                <p className="text-sm text-green-800">{passwordMessage}</p>
              </div>
            )}

            {passwordError && (
              <div className="rounded-md bg-red-50 p-4 mb-4">
                <p className="text-sm text-red-800">{passwordError}</p>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label htmlFor="old_password" className="block text-sm font-medium text-gray-700">
                  Current Password
                </label>
                <input
                  id="old_password"
                  name="old_password"
                  type="password"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-soil focus:border-primary-soil sm:text-sm"
                  value={passwordData.old_password}
                  onChange={handlePasswordChange}
                />
              </div>

              <div>
                <label htmlFor="new_password" className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <input
                  id="new_password"
                  name="new_password"
                  type="password"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-soil focus:border-primary-soil sm:text-sm"
                  value={passwordData.new_password}
                  onChange={handlePasswordChange}
                />
              </div>

              <div>
                <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>
                <input
                  id="confirm_password"
                  name="confirm_password"
                  type="password"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-soil focus:border-primary-soil sm:text-sm"
                  value={passwordData.confirm_password}
                  onChange={handlePasswordChange}
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="w-full md:w-auto px-6 py-3 border border-transparent text-base font-bold rounded-lg text-white bg-primary-soil hover:bg-gradient-green focus:outline-none focus:ring-4 focus:ring-primary-soil/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  {passwordLoading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
