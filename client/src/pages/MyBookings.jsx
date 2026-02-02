import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../services/api';
import LoadingSpinner, { BookingCardSkeleton } from '../components/LoadingSpinner';
import { format } from 'date-fns';
import {
  HiCalendar,
  HiLocationMarker,
  HiCheck,
  HiX,
  HiClock,
  HiStar,
  HiPencil,
  HiArrowRight,
  HiInbox,
  HiSparkles,
} from 'react-icons/hi';

function MyBookings() {
  const { user } = useAuth();
  const location = useLocation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showSuccess, setShowSuccess] = useState(location.state?.success);

  useEffect(() => {
    fetchBookings();
  }, [user]);

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const fetchBookings = async () => {
    try {
      const response = await usersAPI.getBookings(user.id, { limit: 50 });
      setBookings(response.data.bookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') {
      return ['pending', 'confirmed'].includes(booking.status) && new Date(booking.checkIn) > new Date();
    }
    if (filter === 'past') {
      return booking.status === 'checked-out' || new Date(booking.checkOut) < new Date();
    }
    if (filter === 'cancelled') return booking.status === 'cancelled';
    return true;
  });

  const filters = [
    { id: 'all', label: 'All Bookings', count: bookings.length },
    { id: 'upcoming', label: 'Upcoming', count: bookings.filter(b => ['pending', 'confirmed'].includes(b.status) && new Date(b.checkIn) > new Date()).length },
    { id: 'past', label: 'Past', count: bookings.filter(b => b.status === 'checked-out' || new Date(b.checkOut) < new Date()).length },
    { id: 'cancelled', label: 'Cancelled', count: bookings.filter(b => b.status === 'cancelled').length },
  ];

  const getStatusConfig = (status) => {
    const configs = {
      pending: { class: 'badge-warning', icon: HiClock, text: 'Pending' },
      confirmed: { class: 'badge-info', icon: HiCheck, text: 'Confirmed' },
      'checked-in': { class: 'badge-success', icon: HiCheck, text: 'Checked In' },
      'checked-out': { class: 'badge-neutral', icon: HiCheck, text: 'Completed' },
      cancelled: { class: 'badge-danger', icon: HiX, text: 'Cancelled' },
    };
    return configs[status] || configs.pending;
  };

  if (loading) {
    return (
      <div className="bg-secondary-50 min-h-screen py-8">
        <div className="container-narrow">
          <div className="mb-8">
            <div className="h-10 w-48 skeleton rounded-xl mb-4" />
            <div className="flex gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 w-24 skeleton rounded-xl" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <BookingCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-secondary-50 min-h-screen py-8 sm:py-10">
      <div className="container-narrow">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-secondary-900 mb-2">
            My Bookings
          </h1>
          <p className="text-secondary-500">Manage and view all your hotel reservations</p>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 p-4 rounded-2xl bg-success-50 border border-success-200 flex items-center gap-3 animate-fade-in-down">
            <div className="w-10 h-10 rounded-xl bg-success-100 flex items-center justify-center flex-shrink-0">
              <HiCheck className="h-5 w-5 text-success-600" />
            </div>
            <div>
              <p className="font-medium text-success-800">Booking confirmed successfully!</p>
              <p className="text-sm text-success-600">Check your email for confirmation details.</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 -mx-4 px-4 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 min-w-max pb-2">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
                  filter === f.id
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                    : 'bg-white text-secondary-600 hover:bg-secondary-100 border border-secondary-200'
                }`}
              >
                {f.label}
                <span className={`px-1.5 py-0.5 rounded-md text-xs ${
                  filter === f.id ? 'bg-white/20 text-white' : 'bg-secondary-100 text-secondary-500'
                }`}>
                  {f.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-secondary-100 flex items-center justify-center mx-auto mb-4">
              <HiInbox className="h-8 w-8 text-secondary-400" />
            </div>
            <h3 className="text-lg font-semibold text-secondary-900 mb-2">No bookings found</h3>
            <p className="text-secondary-500 mb-6 max-w-sm mx-auto">
              {filter === 'all'
                ? "You haven't made any bookings yet. Start exploring our hotels!"
                : `No ${filter} bookings to show.`}
            </p>
            <Link to="/hotels" className="btn btn-primary">
              <HiSparkles className="h-4 w-4" />
              Browse Hotels
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => {
              const statusConfig = getStatusConfig(booking.status);
              const StatusIcon = statusConfig.icon;

              return (
                <Link
                  key={booking._id}
                  to={`/bookings/${booking._id}`}
                  className="card card-hover p-4 sm:p-5 flex flex-col sm:flex-row gap-4 group"
                >
                  {/* Image */}
                  <div className="sm:w-36 lg:w-44 flex-shrink-0">
                    <div className="aspect-video sm:aspect-[4/3] rounded-xl overflow-hidden">
                      <img
                        src={booking.hotel?.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'}
                        alt={booking.hotel?.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-secondary-900 text-lg truncate group-hover:text-primary-600 transition-colors">
                          {booking.hotel?.name || 'Hotel'}
                        </h3>
                        <div className="flex items-center gap-1.5 text-secondary-500 text-sm mt-0.5">
                          <HiLocationMarker className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{booking.hotel?.address?.city}, {booking.hotel?.address?.country}</span>
                        </div>
                      </div>
                      <span className={`badge ${statusConfig.class} flex-shrink-0`}>
                        <StatusIcon className="h-3.5 w-3.5" />
                        {statusConfig.text}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-secondary-600 mb-3">
                      <div className="flex items-center gap-1.5">
                        <HiCalendar className="h-4 w-4 text-secondary-400" />
                        <span>
                          {format(new Date(booking.checkIn), 'MMM d')} - {format(new Date(booking.checkOut), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <div className="text-secondary-400">|</div>
                      <span>{booking.room?.name || 'Room'}</span>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-secondary-400">
                          ID: <span className="font-mono">{booking.bookingId}</span>
                        </span>
                        {booking.status === 'checked-out' && (
                          <Link
                            to={`/review/${booking._id}`}
                            onClick={(e) => e.stopPropagation()}
                            className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                              booking.hasReview
                                ? 'text-primary-600 hover:text-primary-700'
                                : 'text-warning-600 hover:text-warning-700'
                            }`}
                          >
                            {booking.hasReview ? (
                              <>
                                <HiPencil className="h-4 w-4" />
                                Edit Review
                              </>
                            ) : (
                              <>
                                <HiStar className="h-4 w-4" />
                                Write Review
                              </>
                            )}
                          </Link>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-secondary-900">
                          ${booking.pricing?.grandTotal?.toFixed(2)}
                        </span>
                        <HiArrowRight className="h-4 w-4 text-secondary-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyBookings;
