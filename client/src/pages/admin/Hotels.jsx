import { useState, useEffect } from 'react';
import { hotelsAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { HiPlus, HiPencil, HiTrash, HiX, HiStar, HiLocationMarker } from 'react-icons/hi';

function AdminHotels() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      zipCode: '',
    },
    amenities: [],
    images: [],
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      const response = await hotelsAPI.getAll({ limit: 100 });
      setHotels(response.data.hotels);
    } catch (error) {
      console.error('Error fetching hotels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (hotel = null) => {
    if (hotel) {
      setEditingHotel(hotel);
      setFormData({
        name: hotel.name,
        description: hotel.description,
        address: hotel.address,
        amenities: hotel.amenities || [],
        images: hotel.images || [],
      });
    } else {
      setEditingHotel(null);
      setFormData({
        name: '',
        description: '',
        address: { street: '', city: '', state: '', country: '', zipCode: '' },
        amenities: [],
        images: [],
      });
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingHotel) {
        await hotelsAPI.update(editingHotel._id, formData);
      } else {
        await hotelsAPI.create(formData);
      }
      await fetchHotels();
      setShowModal(false);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save hotel');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to deactivate this hotel?')) return;

    try {
      await hotelsAPI.delete(id);
      await fetchHotels();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete hotel');
    }
  };

  const handleAddAmenity = (amenity) => {
    if (amenity && !formData.amenities.includes(amenity)) {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, amenity],
      });
    }
  };

  const handleRemoveAmenity = (amenity) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.filter((a) => a !== amenity),
    });
  };

  if (loading) {
    return <LoadingSpinner className="min-h-screen" />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manage Hotels</h1>
        <button onClick={() => handleOpenModal()} className="btn btn-primary flex items-center">
          <HiPlus className="h-5 w-5 mr-1" />
          Add Hotel
        </button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Hotel
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Rating
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {hotels.map((hotel) => (
              <tr key={hotel._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <img
                      src={hotel.images?.[0] || 'https://via.placeholder.com/60'}
                      alt={hotel.name}
                      className="h-12 w-12 rounded-lg object-cover mr-3"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{hotel.name}</p>
                      <p className="text-sm text-gray-500 truncate max-w-xs">
                        {hotel.description}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center text-gray-600">
                    <HiLocationMarker className="h-4 w-4 mr-1" />
                    {hotel.address.city}, {hotel.address.country}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {hotel.rating?.count > 0 ? (
                    <div className="flex items-center">
                      <HiStar className="h-4 w-4 text-yellow-500 mr-1" />
                      <span>{hotel.rating.average.toFixed(1)}</span>
                      <span className="text-gray-400 ml-1">({hotel.rating.count})</span>
                    </div>
                  ) : (
                    <span className="text-gray-400">No reviews</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={`badge ${hotel.isActive ? 'badge-success' : 'badge-danger'}`}>
                    {hotel.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleOpenModal(hotel)}
                    className="text-primary-600 hover:text-primary-800 mr-3"
                  >
                    <HiPencil className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(hotel._id)}
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

      {/* Hotel Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-semibold">
                {editingHotel ? 'Edit Hotel' : 'Add New Hotel'}
              </h2>
              <button onClick={() => setShowModal(false)}>
                <HiX className="h-6 w-6 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hotel Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={3}
                  className="input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street *
                  </label>
                  <input
                    type="text"
                    value={formData.address.street}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, street: e.target.value },
                      })
                    }
                    required
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.address.city}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, city: e.target.value },
                      })
                    }
                    required
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    value={formData.address.state}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, state: e.target.value },
                      })
                    }
                    required
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country *
                  </label>
                  <input
                    type="text"
                    value={formData.address.country}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, country: e.target.value },
                      })
                    }
                    required
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zip Code *
                  </label>
                  <input
                    type="text"
                    value={formData.address.zipCode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, zipCode: e.target.value },
                      })
                    }
                    required
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amenities
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="badge bg-primary-100 text-primary-700 flex items-center"
                    >
                      {amenity}
                      <button
                        type="button"
                        onClick={() => handleRemoveAmenity(amenity)}
                        className="ml-1"
                      >
                        <HiX className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="newAmenity"
                    placeholder="Add amenity"
                    className="input flex-grow"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddAmenity(e.target.value);
                        e.target.value = '';
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById('newAmenity');
                      handleAddAmenity(input.value);
                      input.value = '';
                    }}
                    className="btn btn-secondary"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  value={formData.images[0] || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, images: e.target.value ? [e.target.value] : [] })
                  }
                  placeholder="https://example.com/image.jpg"
                  className="input"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 btn btn-primary"
                >
                  {saving ? 'Saving...' : editingHotel ? 'Update Hotel' : 'Create Hotel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminHotels;
