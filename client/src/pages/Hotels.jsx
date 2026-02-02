import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { hotelsAPI } from '../services/api';
import HotelCard from '../components/HotelCard';
import SearchBar from '../components/SearchBar';
import LoadingSpinner from '../components/LoadingSpinner';
import { HiFilter, HiX } from 'react-icons/hi';

function Hotels() {
  const [searchParams] = useSearchParams();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    rating: '',
    amenities: [],
  });

  const amenityOptions = [
    'WiFi',
    'Pool',
    'Gym',
    'Spa',
    'Restaurant',
    'Bar',
    'Parking',
    'Room Service',
    'Pet Friendly',
  ];

  useEffect(() => {
    fetchHotels();
  }, [searchParams, filters]);

  const fetchHotels = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 9,
        city: searchParams.get('city') || '',
        ...(searchParams.get('checkIn') && { checkIn: searchParams.get('checkIn') }),
        ...(searchParams.get('checkOut') && { checkOut: searchParams.get('checkOut') }),
        ...(searchParams.get('guests') && { guests: searchParams.get('guests') }),
        ...(filters.minPrice && { minPrice: filters.minPrice }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
        ...(filters.rating && { rating: filters.rating }),
        ...(filters.amenities.length > 0 && { amenities: filters.amenities.join(',') }),
      };

      const response = await hotelsAPI.getAll(params);
      setHotels(response.data.hotels);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching hotels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleAmenityToggle = (amenity) => {
    setFilters((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const clearFilters = () => {
    setFilters({
      minPrice: '',
      maxPrice: '',
      rating: '',
      amenities: [],
    });
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Search Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <SearchBar />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div
            className={`lg:w-64 ${
              showFilters ? 'fixed inset-0 z-50 bg-white p-4 overflow-auto' : 'hidden lg:block'
            }`}
          >
            <div className="flex justify-between items-center lg:hidden mb-4">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button onClick={() => setShowFilters(false)}>
                <HiX className="h-6 w-6" />
              </button>
            </div>

            <div className="card p-4 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-900">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary-600 hover:underline"
                >
                  Clear all
                </button>
              </div>

              {/* Price Range */}
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Price per night</h4>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="input text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="input text-sm"
                  />
                </div>
              </div>

              {/* Rating */}
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Minimum Rating</h4>
                <select
                  value={filters.rating}
                  onChange={(e) => handleFilterChange('rating', e.target.value)}
                  className="input text-sm"
                >
                  <option value="">Any rating</option>
                  <option value="4">4+ stars</option>
                  <option value="3">3+ stars</option>
                  <option value="2">2+ stars</option>
                </select>
              </div>

              {/* Amenities */}
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Amenities</h4>
                <div className="space-y-2">
                  {amenityOptions.map((amenity) => (
                    <label key={amenity} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.amenities.includes(amenity)}
                        onChange={() => handleAmenityToggle(amenity)}
                        className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-600">{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Hotels Grid */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                {pagination.total} hotels found
                {searchParams.get('city') && ` in ${searchParams.get('city')}`}
              </p>
              <button
                onClick={() => setShowFilters(true)}
                className="lg:hidden btn btn-secondary flex items-center"
              >
                <HiFilter className="h-5 w-5 mr-1" />
                Filters
              </button>
            </div>

            {loading ? (
              <LoadingSpinner className="py-12" />
            ) : hotels.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No hotels found matching your criteria.</p>
                <button onClick={clearFilters} className="mt-4 btn btn-primary">
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {hotels.map((hotel) => (
                    <HotelCard key={hotel._id} hotel={hotel} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="mt-8 flex justify-center gap-2">
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => fetchHotels(page)}
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hotels;
