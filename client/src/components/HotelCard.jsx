import { Link, useSearchParams } from 'react-router-dom';
import { HiStar, HiLocationMarker, HiArrowRight } from 'react-icons/hi';

function HotelCard({ hotel }) {
  const [searchParams] = useSearchParams();
  const defaultImage = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800';

  // Build URL with search dates preserved
  const buildHotelUrl = () => {
    const params = new URLSearchParams();
    if (searchParams.get('checkIn')) params.set('checkIn', searchParams.get('checkIn'));
    if (searchParams.get('checkOut')) params.set('checkOut', searchParams.get('checkOut'));
    if (searchParams.get('guests')) params.set('guests', searchParams.get('guests'));
    const queryString = params.toString();
    return `/hotels/${hotel._id}${queryString ? `?${queryString}` : ''}`;
  };

  return (
    <Link
      to={buildHotelUrl()}
      className="card card-interactive group block"
    >
      {/* Image Container */}
      <div className="relative aspect-hotel overflow-hidden">
        <img
          src={hotel.images?.[0] || defaultImage}
          alt={hotel.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />

        {/* Rating Badge */}
        {hotel.rating?.count > 0 && (
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5">
            <HiStar className="h-4 w-4 text-warning-500" />
            <span className="font-bold text-secondary-900">{hotel.rating.average.toFixed(1)}</span>
            <span className="text-secondary-500 text-xs">({hotel.rating.count})</span>
          </div>
        )}

        {/* Price Badge */}
        {hotel.rooms?.[0]?.pricePerNight && (
          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl shadow-lg">
            <span className="text-xs text-secondary-500">from</span>
            <span className="font-bold text-secondary-900 ml-1">${hotel.rooms[0].pricePerNight}</span>
            <span className="text-xs text-secondary-500">/night</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5">
        {/* Location */}
        <div className="flex items-center gap-1.5 text-secondary-500 text-sm mb-2">
          <HiLocationMarker className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{hotel.address.city}, {hotel.address.country}</span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-secondary-900 mb-2 line-clamp-1 group-hover:text-primary-600 transition-colors">
          {hotel.name}
        </h3>

        {/* Description */}
        <p className="text-secondary-500 text-sm mb-4 line-clamp-2 leading-relaxed">
          {hotel.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3">
          {/* Amenities */}
          <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
            {hotel.amenities?.slice(0, 3).map((amenity, index) => (
              <span
                key={index}
                className="badge badge-sm badge-neutral truncate max-w-[100px]"
              >
                {amenity}
              </span>
            ))}
            {hotel.amenities?.length > 3 && (
              <span className="badge badge-sm badge-neutral">
                +{hotel.amenities.length - 3}
              </span>
            )}
          </div>

          {/* View Button */}
          <div className="flex-shrink-0">
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 group-hover:gap-2 transition-all">
              View
              <HiArrowRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default HotelCard;
