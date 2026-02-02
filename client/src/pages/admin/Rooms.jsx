import { useState, useEffect } from 'react';
import { roomsAPI, hotelsAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { HiPlus, HiPencil, HiTrash, HiX } from 'react-icons/hi';

function AdminRooms() {
  const [rooms, setRooms] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState({
    hotel: '',
    name: '',
    type: 'double',
    description: '',
    capacity: { adults: 2, children: 0 },
    pricePerNight: 100,
    quantity: 1,
    amenities: [],
    images: [],
  });
  const [saving, setSaving] = useState(false);

  const roomTypes = ['single', 'double', 'suite', 'deluxe', 'penthouse'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [roomsRes, hotelsRes] = await Promise.all([
        roomsAPI.getAll({ limit: 100 }),
        hotelsAPI.getAll({ limit: 100 }),
      ]);
      setRooms(roomsRes.data.rooms);
      setHotels(hotelsRes.data.hotels);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (room = null) => {
    if (room) {
      setEditingRoom(room);
      setFormData({
        hotel: room.hotel?._id || room.hotel,
        name: room.name,
        type: room.type,
        description: room.description,
        capacity: room.capacity,
        pricePerNight: room.pricePerNight,
        quantity: room.quantity,
        amenities: room.amenities || [],
        images: room.images || [],
      });
    } else {
      setEditingRoom(null);
      setFormData({
        hotel: hotels[0]?._id || '',
        name: '',
        type: 'double',
        description: '',
        capacity: { adults: 2, children: 0 },
        pricePerNight: 100,
        quantity: 1,
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
      if (editingRoom) {
        await roomsAPI.update(editingRoom._id, formData);
      } else {
        await roomsAPI.create(formData);
      }
      await fetchData();
      setShowModal(false);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save room');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to deactivate this room?')) return;

    try {
      await roomsAPI.delete(id);
      await fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete room');
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
        <h1 className="text-3xl font-bold text-gray-900">Manage Rooms</h1>
        <button onClick={() => handleOpenModal()} className="btn btn-primary flex items-center">
          <HiPlus className="h-5 w-5 mr-1" />
          Add Room
        </button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Room
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Hotel
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Capacity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Qty
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
            {rooms.map((room) => (
              <tr key={room._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <img
                      src={room.images?.[0] || 'https://via.placeholder.com/60'}
                      alt={room.name}
                      className="h-10 w-10 rounded-lg object-cover mr-3"
                    />
                    <span className="font-medium text-gray-900">{room.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {room.hotel?.name || 'N/A'}
                </td>
                <td className="px-6 py-4">
                  <span className="badge bg-gray-100 text-gray-700 capitalize">{room.type}</span>
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {room.capacity.adults} adults
                  {room.capacity.children > 0 && `, ${room.capacity.children} children`}
                </td>
                <td className="px-6 py-4 font-medium">${room.pricePerNight}</td>
                <td className="px-6 py-4 text-gray-600">{room.quantity}</td>
                <td className="px-6 py-4">
                  <span className={`badge ${room.isActive ? 'badge-success' : 'badge-danger'}`}>
                    {room.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleOpenModal(room)}
                    className="text-primary-600 hover:text-primary-800 mr-3"
                  >
                    <HiPencil className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(room._id)}
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

      {/* Room Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-semibold">
                {editingRoom ? 'Edit Room' : 'Add New Room'}
              </h2>
              <button onClick={() => setShowModal(false)}>
                <HiX className="h-6 w-6 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hotel *
                </label>
                <select
                  value={formData.hotel}
                  onChange={(e) => setFormData({ ...formData, hotel: e.target.value })}
                  required
                  className="input"
                  disabled={!!editingRoom}
                >
                  <option value="">Select a hotel</option>
                  {hotels.map((hotel) => (
                    <option key={hotel._id} value={hotel._id}>
                      {hotel.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Room Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="input"
                    placeholder="e.g., Ocean View Suite"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Room Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    required
                    className="input"
                  >
                    {roomTypes.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
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

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adults *
                  </label>
                  <input
                    type="number"
                    value={formData.capacity.adults}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        capacity: { ...formData.capacity, adults: parseInt(e.target.value) },
                      })
                    }
                    required
                    min="1"
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Children
                  </label>
                  <input
                    type="number"
                    value={formData.capacity.children}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        capacity: { ...formData.capacity, children: parseInt(e.target.value) || 0 },
                      })
                    }
                    min="0"
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price/Night *
                  </label>
                  <input
                    type="number"
                    value={formData.pricePerNight}
                    onChange={(e) =>
                      setFormData({ ...formData, pricePerNight: parseFloat(e.target.value) })
                    }
                    required
                    min="0"
                    step="0.01"
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: parseInt(e.target.value) })
                    }
                    required
                    min="1"
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
                    id="newRoomAmenity"
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
                      const input = document.getElementById('newRoomAmenity');
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
                  placeholder="https://example.com/room-image.jpg"
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
                  {saving ? 'Saving...' : editingRoom ? 'Update Room' : 'Create Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminRooms;
