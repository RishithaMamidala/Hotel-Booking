import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { bookingsAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { format } from 'date-fns';
import {
  HiCalendar,
  HiLocationMarker,
  HiUsers,
  HiCreditCard,
  HiPhone,
  HiMail,
  HiPrinter,
  HiX,
  HiExclamationCircle,
} from 'react-icons/hi';

function BookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    try {
      const response = await bookingsAPI.getById(id);
      setBooking(response.data.booking);
    } catch (error) {
      console.error('Error fetching booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await bookingsAPI.cancel(id, cancelReason);
      await fetchBooking();
      setShowCancelModal(false);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  // Check if cancellation is at least 24 hours before check-in
  const isCancellationAllowed = () => {
    if (!booking) return false;
    const now = new Date();
    const checkInDate = new Date(booking.checkIn);
    const diffHours = (checkInDate - now) / (1000 * 60 * 60);
    return diffHours >= 24;
  };

  const canCancel = booking && ['pending', 'confirmed'].includes(booking.status) && isCancellationAllowed();
  const canReview = booking && booking.status === 'checked-out';

  if (loading) {
    return <LoadingSpinner className="min-h-screen" />;
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Booking not found</p>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge-warning',
      confirmed: 'badge-info',
      'checked-in': 'badge-success',
      'checked-out': 'badge bg-gray-100 text-gray-700',
      cancelled: 'badge-danger',
    };
    return badges[status] || 'badge';
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
            <p className="text-gray-500 font-mono">{booking.bookingId}</p>
          </div>
          <span className={`badge ${getStatusBadge(booking.status)} text-base px-4 py-2 mt-2 md:mt-0`}>
            {booking.status}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hotel Info */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4">Hotel Information</h2>
              <div className="flex gap-4">
                <img
                  src={booking.hotel?.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'}
                  alt={booking.hotel?.name}
                  className="w-32 h-24 object-cover rounded-lg"
                />
                <div>
                  <h3 className="font-semibold text-gray-900">{booking.hotel?.name}</h3>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <HiLocationMarker className="h-4 w-4 mr-1" />
                    {booking.hotel?.address?.street}, {booking.hotel?.address?.city}
                  </div>
                  <div className="text-sm text-gray-500">
                    {booking.hotel?.address?.state}, {booking.hotel?.address?.country}
                  </div>
                </div>
              </div>
            </div>

            {/* Stay Details */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4">Stay Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center text-gray-500 text-sm mb-1">
                    <HiCalendar className="h-4 w-4 mr-1" />
                    Check-in
                  </div>
                  <p className="font-medium">
                    {format(new Date(booking.checkIn), 'EEEE, MMMM d, yyyy')}
                  </p>
                  <p className="text-sm text-gray-500">
                    From {booking.hotel?.policies?.checkInTime || '15:00'}
                  </p>
                </div>
                <div>
                  <div className="flex items-center text-gray-500 text-sm mb-1">
                    <HiCalendar className="h-4 w-4 mr-1" />
                    Check-out
                  </div>
                  <p className="font-medium">
                    {format(new Date(booking.checkOut), 'EEEE, MMMM d, yyyy')}
                  </p>
                  <p className="text-sm text-gray-500">
                    Until {booking.hotel?.policies?.checkOutTime || '11:00'}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Room</p>
                  <p className="font-medium">{booking.room?.name} ({booking.room?.type})</p>
                </div>
                <div>
                  <div className="flex items-center text-gray-500 text-sm mb-1">
                    <HiUsers className="h-4 w-4 mr-1" />
                    Guests
                  </div>
                  <p className="font-medium">
                    {booking.guests.adults} Adult{booking.guests.adults > 1 ? 's' : ''}
                    {booking.guests.children > 0 && `, ${booking.guests.children} Child${booking.guests.children > 1 ? 'ren' : ''}`}
                  </p>
                </div>
              </div>

              {booking.specialRequests && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-500">Special Requests</p>
                  <p className="mt-1">{booking.specialRequests}</p>
                </div>
              )}

              {/* Cancellation Policy */}
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-start">
                  <HiExclamationCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Cancellation Policy</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Cancellations must be made at least 24 hours before check-in time.
                      Cancellations made less than 24 hours before check-in are not permitted.
                    </p>
                    {['pending', 'confirmed'].includes(booking.status) && !isCancellationAllowed() && (
                      <p className="text-sm text-red-600 mt-2 font-medium">
                        This booking can no longer be cancelled as it is within 24 hours of check-in.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <HiCreditCard className="h-5 w-5 mr-2" />
                Payment Information
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Room charges</span>
                  <span>${booking.pricing.roomTotal.toFixed(2)}</span>
                </div>
                {booking.pricing.extrasTotal > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Extras</span>
                    <span>${booking.pricing.extrasTotal.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Taxes & fees</span>
                  <span>${booking.pricing.taxes.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-2">
                  <span>Total</span>
                  <span className="text-primary-600">${booking.pricing.grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Payment Status</span>
                  <span className={`badge ${
                    booking.payment.status === 'paid' ? 'badge-success' :
                    booking.payment.status === 'refunded' ? 'badge-info' : 'badge-warning'
                  }`}>
                    {booking.payment.status}
                  </span>
                </div>
                {booking.payment.paidAt && (
                  <p className="text-sm text-gray-500 mt-1">
                    Paid on {format(new Date(booking.payment.paidAt), 'MMM d, yyyy')}
                  </p>
                )}
              </div>

              {booking.cancellation?.refundAmount > 0 && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-green-700">
                    Refund of ${booking.cancellation.refundAmount.toFixed(2)} has been processed
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-6 space-y-4">
              <h3 className="font-semibold">Actions</h3>

              {canReview && (
                <Link
                  to={`/review/${booking._id}`}
                  className="w-full btn btn-primary block text-center"
                >
                  Write a Review
                </Link>
              )}

              {canCancel && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="w-full btn btn-danger"
                >
                  Cancel Booking
                </button>
              )}

              <button
                onClick={() => window.print()}
                className="w-full btn btn-secondary flex items-center justify-center"
              >
                <HiPrinter className="h-5 w-5 mr-2" />
                Print Details
              </button>

              <Link
                to="/my-bookings"
                className="w-full btn btn-secondary block text-center"
              >
                Back to My Bookings
              </Link>
            </div>

            {/* Help */}
            <div className="card p-6 mt-6">
              <h3 className="font-semibold mb-4">Need Help?</h3>
              <div className="space-y-3 text-sm">
                <a href="#" className="flex items-center text-gray-600 hover:text-primary-600">
                  <HiPhone className="h-4 w-4 mr-2" />
                  +1 (800) 123-4567
                </a>
                <a href="#" className="flex items-center text-gray-600 hover:text-primary-600">
                  <HiMail className="h-4 w-4 mr-2" />
                  support@hotelbook.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Cancel Booking</h3>
              <button onClick={() => setShowCancelModal(false)}>
                <HiX className="h-6 w-6 text-gray-400" />
              </button>
            </div>

            <p className="text-gray-600 mb-4">
              Are you sure you want to cancel this booking? This action cannot be undone.
            </p>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4">
              <p className="text-sm text-amber-800">
                <strong>Cancellation Policy:</strong> Cancellations must be made at least 24 hours before check-in.
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for cancellation (optional)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                className="input"
                placeholder="Tell us why you're cancelling..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 btn btn-secondary"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1 btn btn-danger"
              >
                {cancelling ? 'Cancelling...' : 'Cancel Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookingDetails;
