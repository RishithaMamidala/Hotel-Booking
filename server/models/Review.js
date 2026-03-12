const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    comment: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate reviews for same booking
reviewSchema.index({ user: 1, booking: 1 }, { unique: true });
reviewSchema.index({ hotel: 1, createdAt: -1 });

// Helper to recalculate and persist hotel rating
async function recalculateHotelRating(ReviewModel, hotelId) {
  const Hotel = mongoose.model('Hotel');
  const reviews = await ReviewModel.find({ hotel: hotelId });

  if (reviews.length > 0) {
    const average = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    await Hotel.findByIdAndUpdate(hotelId, {
      rating: {
        average: Math.round(average * 10) / 10,
        count: reviews.length,
      },
    });
  } else {
    // No reviews left — reset rating to 0
    await Hotel.findByIdAndUpdate(hotelId, {
      rating: { average: 0, count: 0 },
    });
  }
}

// Update hotel rating after review save
reviewSchema.post('save', async function () {
  await recalculateHotelRating(this.constructor, this.hotel);
});

// FIX 8: Update hotel rating after review deletion
reviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await recalculateHotelRating(doc.constructor, doc.hotel);
  }
});

reviewSchema.post('deleteOne', { document: true, query: false }, async function () {
  await recalculateHotelRating(this.constructor, this.hotel);
});

module.exports = mongoose.model('Review', reviewSchema);
