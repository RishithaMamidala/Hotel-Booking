import { HiUsers, HiCheck, HiUserGroup } from 'react-icons/hi';

function RoomCard({ room, onSelect, selected, available }) {
  const defaultImage = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800';

  const roomTypeConfig = {
    single: { label: 'Single Room', color: 'badge-neutral' },
    double: { label: 'Double Room', color: 'badge-info' },
    suite: { label: 'Suite', color: 'badge-warning' },
    deluxe: { label: 'Deluxe Room', color: 'badge-success' },
    penthouse: { label: 'Penthouse', color: 'badge-danger' },
  };

  const config = roomTypeConfig[room.type] || roomTypeConfig.single;
  const isAvailable = available > 0;

  return (
    <div
      className={`card overflow-hidden transition-all duration-300 ${
        selected
          ? 'border-2 border-primary-500 ring-4 ring-primary-100 shadow-soft-lg'
          : 'border border-secondary-200 hover:border-secondary-300'
      } ${!isAvailable ? 'opacity-60' : 'cursor-pointer hover:shadow-soft-lg'}`}
      onClick={() => isAvailable && onSelect(room)}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div className="sm:w-1/3 lg:w-2/5 flex-shrink-0 relative overflow-hidden">
          <div className="aspect-video sm:aspect-square lg:aspect-[4/3] h-full">
            <img
              src={room.images?.[0] || defaultImage}
              alt={room.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>

          {/* Selected Indicator */}
          {selected && (
            <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center shadow-lg animate-scale-in">
              <HiCheck className="h-5 w-5 text-white" />
            </div>
          )}

          {/* Room Type Badge - Mobile */}
          <div className="absolute bottom-3 left-3 sm:hidden">
            <span className={`badge ${config.color}`}>{config.label}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 sm:w-2/3 lg:w-3/5 flex flex-col min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-secondary-900 mb-1 truncate">{room.name}</h3>
              <span className={`badge ${config.color} hidden sm:inline-flex`}>{config.label}</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-secondary-500 text-sm mb-4 line-clamp-2 leading-relaxed flex-grow">
            {room.description}
          </p>

          {/* Capacity */}
          <div className="flex items-center gap-4 text-sm text-secondary-600 mb-4">
            <div className="flex items-center gap-1.5">
              <HiUsers className="h-4 w-4 text-secondary-400" />
              <span>Up to {room.capacity.adults} adults</span>
            </div>
            {room.capacity.children > 0 && (
              <div className="flex items-center gap-1.5">
                <HiUserGroup className="h-4 w-4 text-secondary-400" />
                <span>{room.capacity.children} children</span>
              </div>
            )}
          </div>

          {/* Amenities */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {room.amenities?.slice(0, 4).map((amenity, index) => (
              <span key={index} className="badge badge-sm badge-neutral">
                {amenity}
              </span>
            ))}
            {room.amenities?.length > 4 && (
              <span className="badge badge-sm badge-neutral">
                +{room.amenities.length - 4} more
              </span>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-secondary-100">
            <div>
              <span className="text-2xl font-bold text-secondary-900">
                ${room.pricePerNight}
              </span>
              <span className="text-secondary-500 text-sm">/night</span>
            </div>
            <div>
              {!isAvailable ? (
                <span className="badge badge-danger">Not Available</span>
              ) : (
                <span className="badge badge-success">
                  <span className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse" />
                  {available} available
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoomCard;
