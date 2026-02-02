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

// Update hotel rating after review save
reviewSchema.post('save', async function () {
  const Hotel = mongoose.model('Hotel');
  const reviews = await this.constructor.find({ hotel: this.hotel });

  if (reviews.length > 0) {
    const average = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    await Hotel.findByIdAndUpdate(this.hotel, {
      rating: {
        average: Math.round(average * 10) / 10,
        count: reviews.length,
      },
    });
  }
});

module.exports = mongoose.model('Review', reviewSchema);
