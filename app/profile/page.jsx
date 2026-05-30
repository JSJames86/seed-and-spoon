'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, profile, changePassword } = useAuth();

  const [profileData, setProfileData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    phone: '',
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

  useEffect(() => {
    if (profile) {
      setProfileData({
        username: profile.username || '',
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || '',
      });
    }
  }, [profile]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileMessage('');
    setProfileLoading(true);
    try {
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, ...profileData }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update');
      setProfileMessage('Profile updated successfully!');
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile');
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
    if (passwordData.new_password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }
    setPasswordLoading(true);
    const result = await changePassword(passwordData.old_password, passwordData.new_password);
    if (result.success) {
      setPasswordMessage('Password changed successfully!');
      setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
    } else {
      setPasswordError(result.error || 'Failed to change password');
    }
    setPasswordLoading(false);
  };

  const inputClass = 'mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-soil focus:border-primary-soil sm:text-sm';
  const labelClass = 'block text-sm font-medium text-gray-700';

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-cream py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">

          <div className="mb-6">
            <Link
              href={profile?.role === 'admin' ? '/admin' : '/dashboard'}
              className="text-sm text-gray-500 hover:text-primary-soil transition-colors"
            >
              ← Back to {profile?.role === 'admin' ? 'Admin' : 'Dashboard'}
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-charcoal">Profile Settings</h1>
            <p className="mt-1 text-gray-500">{user?.email}</p>
          </div>

          {/* Personal Info */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-charcoal mb-4">Personal Information</h2>

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

              <div>
                <label htmlFor="username" className={labelClass}>Username</label>
                <input
                  id="username" name="username" type="text"
                  className={inputClass}
                  placeholder="e.g. janelle_spoon"
                  value={profileData.username}
                  onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                />
                <p className="mt-1 text-xs text-gray-400">This is how you appear across the platform</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="first_name" className={labelClass}>First Name</label>
                  <input
                    id="first_name" name="first_name" type="text"
                    className={inputClass}
                    value={profileData.first_name}
                    onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="last_name" className={labelClass}>Last Name</label>
                  <input
                    id="last_name" name="last_name" type="text"
                    className={inputClass}
                    value={profileData.last_name}
                    onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email" disabled
                  className={`${inputClass} bg-gray-50 text-gray-500 cursor-not-allowed`}
                  value={user?.email || ''}
                />
                <p className="mt-1 text-xs text-gray-400">Email cannot be changed here</p>
              </div>

              <div>
                <label htmlFor="phone" className={labelClass}>Phone</label>
                <input
                  id="phone" name="phone" type="tel"
                  className={inputClass}
                  placeholder="(555) 000-0000"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                />
              </div>

              <button
                type="submit" disabled={profileLoading}
                className="px-6 py-2.5 bg-[var(--green-primary)] text-white font-semibold rounded-lg hover:bg-[var(--leaf-mid)] disabled:opacity-50 transition-all"
              >
                {profileLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-charcoal mb-4">Change Password</h2>

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
                <label htmlFor="old_password" className={labelClass}>Current Password</label>
                <input
                  id="old_password" name="old_password" type="password" required
                  className={inputClass}
                  value={passwordData.old_password}
                  onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="new_password" className={labelClass}>New Password</label>
                <input
                  id="new_password" name="new_password" type="password" required
                  className={inputClass}
                  value={passwordData.new_password}
                  onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="confirm_password" className={labelClass}>Confirm New Password</label>
                <input
                  id="confirm_password" name="confirm_password" type="password" required
                  className={inputClass}
                  value={passwordData.confirm_password}
                  onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                />
              </div>

              <button
                type="submit" disabled={passwordLoading}
                className="px-6 py-2.5 bg-[var(--green-primary)] text-white font-semibold rounded-lg hover:bg-[var(--leaf-mid)] disabled:opacity-50 transition-all"
              >
                {passwordLoading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>

        </div>
      </div>
    </ProtectedRoute>
  );
}
