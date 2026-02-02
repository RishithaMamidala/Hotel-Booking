import { useState, useEffect } from 'react';
import { usersAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { format } from 'date-fns';
import { HiPencil, HiTrash, HiX, HiUser } from 'react-icons/hi';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editRole, setEditRole] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const response = await usersAPI.getAll({ page, limit: 20 });
      setUsers(response.data.users);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditRole(user.role);
    setShowModal(true);
  };

  const handleSaveRole = async () => {
    if (!selectedUser || editRole === selectedUser.role) return;

    setSaving(true);
    try {
      await usersAPI.update(selectedUser._id, { role: editRole });
      await fetchUsers(pagination.page);
      setShowModal(false);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      await usersAPI.delete(id);
      await fetchUsers(pagination.page);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: 'badge-danger',
      user: 'badge-info',
      guest: 'bg-gray-100 text-gray-700',
    };
    return badges[role] || 'badge';
  };

  if (loading && users.length === 0) {
    return <LoadingSpinner className="min-h-screen" />;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Manage Users</h1>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Joined
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-10 w-10 rounded-full mr-3"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                        <HiUser className="h-6 w-6 text-primary-600" />
                      </div>
                    )}
                    <span className="font-medium text-gray-900">{user.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600">{user.email}</td>
                <td className="px-6 py-4">
                  <span className={`badge ${getRoleBadge(user.role)} capitalize`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {format(new Date(user.createdAt), 'MMM d, yyyy')}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleEditUser(user)}
                    className="text-primary-600 hover:text-primary-800 mr-3"
                  >
                    <HiPencil className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <HiTrash className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => fetchUsers(page)}
              className={`px-4 py-2 rounded-lg ${
                pagination.page === page
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}

      {/* Edit Role Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">Edit User Role</h2>
              <button onClick={() => setShowModal(false)}>
                <HiX className="h-6 w-6 text-gray-400" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center mb-6">
                {selectedUser.avatar ? (
                  <img
                    src={selectedUser.avatar}
                    alt={selectedUser.name}
                    className="h-16 w-16 rounded-full mr-4"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center mr-4">
                    <HiUser className="h-10 w-10 text-primary-600" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-lg">{selectedUser.name}</p>
                  <p className="text-gray-500">{selectedUser.email}</p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User Role
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="input"
                >
                  <option value="guest">Guest</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveRole}
                  disabled={saving || editRole === selectedUser.role}
                  className="flex-1 btn btn-primary disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;
