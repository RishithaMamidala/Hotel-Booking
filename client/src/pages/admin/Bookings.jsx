import { useState, useEffect } from 'react';
import { bookingsAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { format } from 'date-fns';
import { HiEye, HiFilter, HiCheck, HiX } from 'react-icons/hi';

function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const fetchBookings = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (statusFilter) params.status = statusFilter;

      const response = await bookingsAPI.getAll(params);
      setBookings(response.data.bookings);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewBooking = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    setUpdating(true);
    try {
      await bookingsAPI.update(bookingId, { status: newStatus });
      await fetchBookings(pagination.page);
      if (selectedBooking?._id === bookingId) {
        setSelectedBooking({ ...selectedBooking, status: newStatus });
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleCheckout = async (bookingId) => {
    setUpdating(true);
    try {
      await bookingsAPI.checkout(bookingId);
      await fetchBookings(pagination.page);
      setShowModal(false);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to process checkout');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge-warning',
      confirmed: 'badge-info',
      'checked-in': 'badge-success',
      'checked-out': 'bg-gray-100 text-gray-700',
      cancelled: 'badge-danger',
    };
    return badges[status] || 'badge';
  };

  if (loading && bookings.length === 0) {
    return <LoadingSpinner className="min-h-screen" />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manage Bookings</h1>
        <div className="flex items-center gap-2">
          <HiFilter className="h-5 w-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input w-40"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="checked-in">Checked In</option>
            <option value="checked-out">Checked Out</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Booking ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Guest
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Hotel / Room
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Dates
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Amount
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {bookings.map((booking) => (
              <tr key={booking._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">
                  {booking.bookingId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <p className="font-medium">{booking.user?.name || 'N/A'}</p>
                    <p className="text-sm text-gray-500">{booking.user?.email}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium">{booking.hotel?.name || 'N/A'}</p>
                    <p className="text-sm text-gray-500">{booking.room?.name}</p>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <p>{format(new Date(booking.checkIn), 'MMM d')}</p>
                  <p className="text-gray-500">to {format(new Date(booking.checkOut), 'MMM d, yyyy')}</p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`badge ${getStatusBadge(booking.status)}`}>
                    {booking.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-medium">
                  ${booking.pricing?.grandTotal?.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleViewBooking(booking)}
                    className="text-primary-600 hover:text-primary-800"
                  >
                    <HiEye className="h-5 w-5" />
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
              onClick={() => fetchBookings(page)}
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

      {/* Booking Detail Modal */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
              <div>
                <h2 className="text-xl font-semibold">Booking Details</h2>
                <p className="text-gray-500 font-mono">{selectedBooking.bookingId}</p>
              </div>
              <button onClick={() => setShowModal(false)}>
                <HiX className="h-6 w-6 text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className={`badge ${getStatusBadge(selectedBooking.status)} text-base px-4 py-2`}>
                  {selectedBooking.status}
                </span>
                <div className="flex gap-2">
                  {selectedBooking.status === 'confirmed' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedBooking._id, 'checked-in')}
                      disabled={updating}
                      className="btn btn-primary btn-sm flex items-center"
                    >
                      <HiCheck className="h-4 w-4 mr-1" />
                      Check In
                    </button>
                  )}
                  {selectedBooking.status === 'checked-in' && (
                    <button
                      onClick={() => handleCheckout(selectedBooking._id)}
                      disabled={updating}
                      className="btn btn-primary btn-sm flex items-center"
                    >
                      <HiCheck className="h-4 w-4 mr-1" />
                      Check Out
                    </button>
                  )}
                </div>
              </div>

              {/* Guest Info */}
              <div>
                <h3 className="font-semibold mb-2">Guest Information</h3>
                <p><strong>Name:</strong> {selectedBooking.user?.name}</p>
                <p><strong>Email:</strong> {selectedBooking.user?.email}</p>
                <p><strong>Guests:</strong> {selectedBooking.guests.adults} adults
                  {selectedBooking.guests.children > 0 && `, ${selectedBooking.guests.children} children`}
                </p>
              </div>

              {/* Stay Details */}
              <div>
                <h3 className="font-semibold mb-2">Stay Details</h3>
                <p><strong>Hotel:</strong> {selectedBooking.hotel?.name}</p>
                <p><strong>Room:</strong> {selectedBooking.room?.name} ({selectedBooking.room?.type})</p>
                <p><strong>Check-in:</strong> {format(new Date(selectedBooking.checkIn), 'EEEE, MMMM d, yyyy')}</p>
                <p><strong>Check-out:</strong> {format(new Date(selectedBooking.checkOut), 'EEEE, MMMM d, yyyy')}</p>
              </div>

              {/* Payment */}
              <div>
                <h3 className="font-semibold mb-2">Payment</h3>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Room Total</span>
                    <span>${selectedBooking.pricing.roomTotal.toFixed(2)}</span>
                  </div>
                  {selectedBooking.pricing.extrasTotal > 0 && (
                    <div className="flex justify-between">
                      <span>Extras</span>
                      <span>${selectedBooking.pricing.extrasTotal.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Taxes</span>
                    <span>${selectedBooking.pricing.taxes.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-2">
                    <span>Total</span>
                    <span>${selectedBooking.pricing.grandTotal.toFixed(2)}</span>
                  </div>
                </div>
                <p className="mt-2 text-sm">
                  <strong>Payment Status:</strong>{' '}
                  <span className={`badge ${
                    selectedBooking.payment.status === 'paid' ? 'badge-success' :
                    selectedBooking.payment.status === 'refunded' ? 'badge-info' : 'badge-warning'
                  }`}>
                    {selectedBooking.payment.status}
                  </span>
                </p>
              </div>

              {/* Special Requests */}
              {selectedBooking.specialRequests && (
                <div>
                  <h3 className="font-semibold mb-2">Special Requests</h3>
                  <p className="text-gray-600">{selectedBooking.specialRequests}</p>
                </div>
              )}

              {/* Cancellation Info */}
              {selectedBooking.cancellation?.cancelledAt && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 text-red-700">Cancellation Details</h3>
                  <p><strong>Cancelled:</strong> {format(new Date(selectedBooking.cancellation.cancelledAt), 'MMM d, yyyy')}</p>
                  {selectedBooking.cancellation.reason && (
                    <p><strong>Reason:</strong> {selectedBooking.cancellation.reason}</p>
                  )}
                  {selectedBooking.cancellation.refundAmount > 0 && (
                    <p><strong>Refund:</strong> ${selectedBooking.cancellation.refundAmount.toFixed(2)}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminBookings;
