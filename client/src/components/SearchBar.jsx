import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import { HiSearch, HiLocationMarker, HiCalendar, HiUsers } from 'react-icons/hi';
import 'react-datepicker/dist/react-datepicker.css';

function SearchBar({ className = '', variant = 'default' }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Initialize state from URL params
  const [destination, setDestination] = useState(searchParams.get('city') || '');
  const [checkIn, setCheckIn] = useState(
    searchParams.get('checkIn') ? new Date(searchParams.get('checkIn')) : null
  );
  const [checkOut, setCheckOut] = useState(
    searchParams.get('checkOut') ? new Date(searchParams.get('checkOut')) : null
  );
  const [guests, setGuests] = useState(parseInt(searchParams.get('guests')) || 2);

  // Update state when URL params change (e.g., when navigating back)
  useEffect(() => {
    setDestination(searchParams.get('city') || '');
    setCheckIn(searchParams.get('checkIn') ? new Date(searchParams.get('checkIn')) : null);
    setCheckOut(searchParams.get('checkOut') ? new Date(searchParams.get('checkOut')) : null);
    setGuests(parseInt(searchParams.get('guests')) || 2);
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (destination) params.set('city', destination);
    if (checkIn) params.set('checkIn', checkIn.toISOString());
    if (checkOut) params.set('checkOut', checkOut.toISOString());
    if (guests) params.set('guests', guests);
    navigate(`/hotels?${params.toString()}`);
  };

  const isHero = variant === 'hero';

  return (
    <form
      onSubmit={handleSearch}
      className={`${isHero ? 'glass' : 'bg-white border border-secondary-200'} rounded-2xl lg:rounded-3xl shadow-soft-xl p-4 sm:p-5 lg:p-6 ${className}`}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 lg:gap-4">
        {/* Destination */}
        <div className="lg:col-span-4">
          <label className="block text-xs font-semibold text-secondary-500 uppercase tracking-wider mb-2">
            Where to?
          </label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <HiLocationMarker className="h-5 w-5 text-secondary-400" />
            </div>
            <input
              type="text"
              placeholder="City, hotel, or destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="input pl-11 h-12"
            />
          </div>
        </div>

        {/* Check-in */}
        <div className="lg:col-span-2">
          <label className="block text-xs font-semibold text-secondary-500 uppercase tracking-wider mb-2">
            Check-in
          </label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10">
              <HiCalendar className="h-5 w-5 text-secondary-400" />
            </div>
            <DatePicker
              selected={checkIn}
              onChange={(date) => setCheckIn(date)}
              selectsStart
              startDate={checkIn}
              endDate={checkOut}
              minDate={new Date()}
              placeholderText="Add date"
              className="input pl-11 h-12"
              dateFormat="MMM d, yyyy"
            />
          </div>
        </div>

        {/* Check-out */}
        <div className="lg:col-span-2">
          <label className="block text-xs font-semibold text-secondary-500 uppercase tracking-wider mb-2">
            Check-out
          </label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10">
              <HiCalendar className="h-5 w-5 text-secondary-400" />
            </div>
            <DatePicker
              selected={checkOut}
              onChange={(date) => setCheckOut(date)}
              selectsEnd
              startDate={checkIn}
              endDate={checkOut}
              minDate={checkIn || new Date()}
              placeholderText="Add date"
              className="input pl-11 h-12"
              dateFormat="MMM d, yyyy"
            />
          </div>
        </div>

        {/* Guests */}
        <div className="lg:col-span-2">
          <label className="block text-xs font-semibold text-secondary-500 uppercase tracking-wider mb-2">
            Guests
          </label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <HiUsers className="h-5 w-5 text-secondary-400" />
            </div>
            <select
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="input pl-11 h-12 appearance-none cursor-pointer"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'Guest' : 'Guests'}
                </option>
              ))}
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="h-4 w-4 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Search Button */}
        <div className="sm:col-span-2 lg:col-span-2 flex items-end">
          <button
            type="submit"
            className="w-full btn btn-primary btn-lg h-12 shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40"
          >
            <HiSearch className="h-5 w-5" />
            <span className="hidden sm:inline">Search</span>
          </button>
        </div>
      </div>
    </form>
  );
}

export default SearchBar;
