import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import { hotelsAPI, reviewsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import RoomCard from '../components/RoomCard';
import ReviewCard from '../components/ReviewCard';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  HiStar,
  HiLocationMarker,
  HiClock,
  HiCheck,
  HiCalendar,
  HiUsers,
  HiExclamationCircle,
} from 'react-icons/hi';
import 'react-datepicker/dist/react-datepicker.css';

function HotelDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, login } = useAuth();
  const { setHotel, setRoom, setDates, setGuests } = useBooking();

  const [hotel, setHotelData] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [activeTab, setActiveTab] = useState('rooms');

  const [checkIn, setCheckIn] = useState(
    searchParams.get('checkIn') ? new Date(searchParams.get('checkIn')) : null
  );
  const [checkOut, setCheckOut] = useState(
    searchParams.get('checkOut') ? new Date(searchParams.get('checkOut')) : null
  );
  const [guests, setGuestsState] = useState(
    Number(searchParams.get('guests')) || 2
  );

  useEffect(() => {
    fetchHotelDetails();
    fetchReviews();
  }, [id]);

  useEffect(() => {
    if (checkIn && checkOut) {
      fetchAvailability();
    }
  }, [checkIn, checkOut, guests]);

  const fetchHotelDetails = async () => {
    try {
      const response = await hotelsAPI.getById(id);
      setHotelData(response.data.hotel);
    } catch (error) {
      console.error('Error fetching hotel:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailability = async () => {
    try {
      const response = await hotelsAPI.checkAvailability(id, {
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString(),
        guests,
      });
      setAvailability(response.data.availability);
    } catch (error) {
      console.error('Error checking availability:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await reviewsAPI.getHotelReviews(id, { limit: 10 });
      setReviews(response.data.reviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
  };

  const handleBookNow = () => {
    if (!isAuthenticated) {
      login();
      return;
    }

    if (!checkIn || !checkOut || !selectedRoom) {
      alert('Please select dates and a room');
      return;
    }

    setHotel(hotel);
    setRoom(selectedRoom);
    setDates(checkIn, checkOut);
    setGuests({ adults: guests, children: 0 });
    navigate(`/book/${hotel._id}/${selectedRoom._id}`);
  };

  if (loading) {
    return <LoadingSpinner className="min-h-screen" />;
  }

  if (!hotel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Hotel not found</p>
      </div>
    );
  }

  const defaultImage = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200';

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Image */}
      <div className="h-64 sm:h-80 md:h-96 relative overflow-hidden">
        <img
          src={hotel.images?.[0] || defaultImage}
          alt={hotel.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 line-clamp-2">{hotel.name}</h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <div className="flex items-center text-sm sm:text-base">
                <HiLocationMarker className="h-4 w-4 sm:h-5 sm:w-5 mr-1 flex-shrink-0" />
                <span className="truncate max-w-[200px] sm:max-w-none">{hotel.address.city}, {hotel.address.country}</span>
              </div>
              {hotel.rating?.count > 0 && (
                <div className="flex items-center bg-white/20 px-2 py-1 rounded text-sm sm:text-base">
                  <HiStar className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 mr-1 flex-shrink-0" />
                  <span className="font-semibold">{hotel.rating.average.toFixed(1)}</span>
                  <span className="ml-1 hidden sm:inline">({hotel.rating.count} reviews)</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">About This Hotel</h2>
              <p className="text-gray-600">{hotel.description}</p>

              {/* Amenities */}
              <div className="mt-6">
                <h3 className="font-semibold mb-3">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {hotel.amenities?.map((amenity, index) => (
                    <span key={index} className="flex items-center bg-gray-100 px-3 py-1 rounded-full text-sm">
                      <HiCheck className="h-4 w-4 text-green-500 mr-1" />
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>

              {/* Policies */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <HiClock className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Check-in</p>
                    <p className="font-medium">{hotel.policies?.checkInTime || '15:00'}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <HiClock className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Check-out</p>
                    <p className="font-medium">{hotel.policies?.checkOutTime || '11:00'}</p>
                  </div>
                </div>
              </div>

              {/* Cancellation Policy */}
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start">
                  <HiExclamationCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-amber-800">Cancellation Policy</p>
                    <p className="text-sm text-amber-700 mt-1">
                      Cancellations must be made at least 24 hours before check-in time.
                      Cancellations made less than 24 hours before check-in are not permitted.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="card">
              <div className="border-b flex">
                <button
                  onClick={() => setActiveTab('rooms')}
                  className={`px-6 py-4 font-medium transition-colors ${
                    activeTab === 'rooms'
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Rooms
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`px-6 py-4 font-medium transition-colors ${
                    activeTab === 'reviews'
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Reviews ({hotel.rating?.count || 0})
                </button>
              </div>

              <div className="p-6">
                {activeTab === 'rooms' ? (
                  <div className="space-y-4">
                    {!checkIn || !checkOut ? (
                      <p className="text-center text-gray-500 py-8">
                        Please select check-in and check-out dates to see available rooms
                      </p>
                    ) : availability.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">
                        No rooms available for the selected dates
                      </p>
                    ) : (
                      availability.map((item) => (
                        <RoomCard
                          key={item.room._id}
                          room={item.room}
                          available={item.available}
                          selected={selectedRoom?._id === item.room._id}
                          onSelect={() => handleRoomSelect(item.room)}
                        />
                      ))
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">
                        No reviews yet. Be the first to review!
                      </p>
                    ) : (
                      reviews.map((review) => (
                        <ReviewCard key={review._id} review={review} />
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h3 className="text-lg font-semibold mb-4">Book Your Stay</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <HiCalendar className="inline h-4 w-4 mr-1" />
                    Check-in
                  </label>
                  <DatePicker
                    selected={checkIn}
                    onChange={(date) => setCheckIn(date)}
                    selectsStart
                    startDate={checkIn}
                    endDate={checkOut}
                    minDate={new Date()}
                    placeholderText="Select date"
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <HiCalendar className="inline h-4 w-4 mr-1" />
                    Check-out
                  </label>
                  <DatePicker
                    selected={checkOut}
                    onChange={(date) => setCheckOut(date)}
                    selectsEnd
                    startDate={checkIn}
                    endDate={checkOut}
                    minDate={checkIn || new Date()}
                    placeholderText="Select date"
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <HiUsers className="inline h-4 w-4 mr-1" />
                    Guests
                  </label>
                  <select
                    value={guests}
                    onChange={(e) => setGuestsState(Number(e.target.value))}
                    className="input"
                  >
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'Guest' : 'Guests'}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedRoom && (
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Selected Room:</span>
                      <span className="font-medium">{selectedRoom.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Price per night:</span>
                      <span className="font-medium">${selectedRoom.pricePerNight}</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleBookNow}
                  disabled={!checkIn || !checkOut || !selectedRoom}
                  className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAuthenticated ? 'Book Now' : 'Sign In to Book'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HotelDetails;
