import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../services/api';
import { HiUser, HiMail, HiCalendar, HiPencil, HiCheck } from 'react-icons/hi';
import { format } from 'date-fns';

function Profile() {
  const { user, checkAuth } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      await usersAPI.update(user.id, { name });
      await checkAuth();
      setEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="card">
          {/* Avatar Section */}
          <div className="p-6 border-b bg-gradient-to-r from-primary-500 to-primary-600">
            <div className="flex items-center">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-20 w-20 rounded-full border-4 border-white shadow-lg"
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center shadow-lg">
                  <HiUser className="h-12 w-12 text-primary-600" />
                </div>
              )}
              <div className="ml-4 text-white">
                <h2 className="text-2xl font-bold">{user?.name}</h2>
                <p className="opacity-90">{user?.role}</p>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-6 space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Full Name
              </label>
              {editing ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input flex-grow"
                  />
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn btn-primary"
                  >
                    {saving ? 'Saving...' : <HiCheck className="h-5 w-5" />}
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false);
                      setName(user?.name || '');
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <HiUser className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-gray-900">{user?.name}</span>
                  </div>
                  <button
                    onClick={() => setEditing(true)}
                    className="text-primary-600 hover:text-primary-700"
                  >
                    <HiPencil className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Email Address
              </label>
              <div className="flex items-center">
                <HiMail className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-gray-900">{user?.email}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Email is managed by your Google account
              </p>
            </div>

            {/* Member Since */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Member Since
              </label>
              <div className="flex items-center">
                <HiCalendar className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-gray-900">
                  {user?.createdAt ? format(new Date(user.createdAt), 'MMMM d, yyyy') : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className="card mt-6 p-6">
          <h3 className="text-lg font-semibold mb-4">Account Settings</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-gray-500">
                  Receive booking confirmations and updates
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
            <div className="flex justify-between items-center py-3">
              <div>
                <p className="font-medium">Marketing Emails</p>
                <p className="text-sm text-gray-500">
                  Receive special offers and promotions
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
