import { HiStar, HiBadgeCheck } from 'react-icons/hi';
import { format, formatDistanceToNow } from 'date-fns';

function ReviewCard({ review }) {
  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <HiStar
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-warning-400' : 'text-secondary-200'}`}
      />
    ));
  };

  const isRecent = new Date(review.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  return (
    <div className="card p-5 sm:p-6 hover:shadow-soft-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          {review.user?.avatar ? (
            <img
              src={review.user.avatar}
              alt={review.user.name}
              className="h-11 w-11 rounded-full object-cover ring-2 ring-white shadow-soft"
            />
          ) : (
            <div className="avatar avatar-md">
              {review.user?.name?.charAt(0).toUpperCase()}
            </div>
          )}

          {/* User Info */}
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-secondary-900">{review.user?.name}</span>
              {review.isVerified && (
                <div className="flex items-center gap-1 text-success-600" title="Verified Stay">
                  <HiBadgeCheck className="h-4 w-4" />
                </div>
              )}
            </div>
            <span className="text-sm text-secondary-500">
              {isRecent
                ? formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })
                : format(new Date(review.createdAt), 'MMM d, yyyy')
              }
            </span>
          </div>
        </div>

        {/* Rating Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-50 border border-primary-100">
          <div className="flex">
            {renderStars(review.rating)}
          </div>
          <span className="font-bold text-primary-700">{review.rating}</span>
        </div>
      </div>

      {/* Content */}
      <div>
        {review.title && (
          <h4 className="font-semibold text-secondary-900 mb-2 text-lg">{review.title}</h4>
        )}
        <p className="text-secondary-600 leading-relaxed">{review.comment}</p>
      </div>

      {/* Verified Badge */}
      {review.isVerified && (
        <div className="mt-4 pt-4 border-t border-secondary-100">
          <div className="flex items-center gap-2 text-sm text-success-600">
            <HiBadgeCheck className="h-4 w-4" />
            <span>Verified Guest - Stayed at this hotel</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReviewCard;
