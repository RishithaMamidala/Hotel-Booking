import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingsAPI, reviewsAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { HiStar, HiPencil } from 'react-icons/hi';

function WriteReview() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [existingReview, setExistingReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [error, setError] = useState(null);

  const isEditing = !!existingReview;

  useEffect(() => {
    fetchBookingAndReview();
  }, [bookingId]);

  const fetchBookingAndReview = async () => {
    try {
      const [bookingResponse, reviewResponse] = await Promise.all([
        bookingsAPI.getById(bookingId),
        reviewsAPI.getByBooking(bookingId),
      ]);

      setBooking(bookingResponse.data.booking);

      if (bookingResponse.data.booking.status !== 'checked-out') {
        setError('You can only review after checkout');
      }

      // If a review exists, prepopulate the form
      if (reviewResponse.data.review) {
        const review = reviewResponse.data.review;
        setExistingReview(review);
        setRating(review.rating);
        setTitle(review.title);
        setComment(review.comment);
      }
    } catch (error) {
      setError('Failed to load booking');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (isEditing) {
        // Update existing review
        await reviewsAPI.update(existingReview._id, {
          rating,
          title,
          comment,
        });
      } else {
        // Create new review
        await reviewsAPI.create({
          bookingId,
          rating,
          title,
          comment,
        });
      }
      navigate('/my-bookings', { state: { reviewSuccess: true } });
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'submit'} review`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner className="min-h-screen" />;
  }

  const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  return (
    <div className="bg-secondary-50 min-h-screen py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-2">
          {isEditing ? (
            <HiPencil className="h-8 w-8 text-primary-600" />
          ) : (
            <HiStar className="h-8 w-8 text-warning-500" />
          )}
          <h1 className="text-3xl font-bold text-secondary-900">
            {isEditing ? 'Edit Your Review' : 'Write a Review'}
          </h1>
        </div>
        <p className="text-secondary-600 mb-8">
          {isEditing
            ? `Update your review for ${booking?.hotel?.name}`
            : `Share your experience at ${booking?.hotel?.name}`}
        </p>

        {error && (
          <div className="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-2xl text-danger-700">
            {error}
          </div>
        )}

        {booking && booking.status === 'checked-out' && (
          <form onSubmit={handleSubmit} className="card p-6">
            {/* Hotel Info */}
            <div className="flex gap-4 mb-6 pb-6 border-b border-secondary-200">
              <img
                src={booking.hotel?.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200'}
                alt={booking.hotel?.name}
                className="w-20 h-20 object-cover rounded-xl"
              />
              <div>
                <h3 className="font-semibold text-secondary-900">{booking.hotel?.name}</h3>
                <p className="text-sm text-secondary-500">
                  {booking.hotel?.address?.city}, {booking.hotel?.address?.country}
                </p>
                <p className="text-sm text-secondary-500">
                  Room: {booking.room?.name}
                </p>
              </div>
            </div>

            {/* Rating */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Your Rating *
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <HiStar
                      className={`h-10 w-10 transition-colors ${
                        star <= (hoverRating || rating)
                          ? 'text-warning-400'
                          : 'text-secondary-300'
                      }`}
                    />
                  </button>
                ))}
                {(hoverRating || rating) > 0 && (
                  <span className="ml-2 text-secondary-600 font-medium">
                    {ratingLabels[hoverRating || rating]}
                  </span>
                )}
              </div>
            </div>

            {/* Title */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Review Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={100}
                className="input"
                placeholder="Summarize your experience"
              />
              <p className="text-xs text-secondary-400 mt-1">
                {title.length}/100 characters
              </p>
            </div>

            {/* Comment */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Your Review *
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                maxLength={1000}
                rows={5}
                className="input"
                placeholder="Tell others about your stay. What did you like or dislike?"
              />
              <p className="text-xs text-secondary-400 mt-1">
                {comment.length}/1000 characters
              </p>
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || rating === 0}
                className="flex-1 btn btn-primary disabled:opacity-50"
              >
                {submitting
                  ? isEditing
                    ? 'Updating...'
                    : 'Submitting...'
                  : isEditing
                  ? 'Update Review'
                  : 'Submit Review'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default WriteReview;
