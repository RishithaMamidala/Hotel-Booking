const Review = require('../models/Review');
const Booking = require('../models/Booking');
const User = require('../models/User');

// Get review by booking ID
const getReviewByBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    // Verify booking exists and belongs to user
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const review = await Review.findOne({ booking: bookingId }).populate('user', 'name avatar');

    res.json({ success: true, review: review || null });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get hotel reviews
const getHotelReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.find({ hotel: req.params.hotelId })
      .populate('user', 'name avatar')
      .skip(skip)
      .limit(parseInt(limit))
      .sort(sort);

    const total = await Review.countDocuments({ hotel: req.params.hotelId });

    // Calculate rating distribution
    const ratingDistribution = await Review.aggregate([
      { $match: { hotel: require('mongoose').Types.ObjectId.createFromHexString(req.params.hotelId) } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: -1 } },
    ]);

    res.json({
      success: true,
      reviews,
      ratingDistribution,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create review
const createReview = async (req, res) => {
  try {
    const { bookingId, rating, title, comment } = req.body;

    // Verify booking exists and belongs to user
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Check if booking is completed
    if (booking.status !== 'checked-out') {
      return res.status(400).json({
        success: false,
        message: 'Can only review after checkout',
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ booking: bookingId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Review already exists for this booking',
      });
    }

    const review = await Review.create({
      user: req.user._id,
      hotel: booking.hotel,
      booking: bookingId,
      rating,
      title,
      comment,
      isVerified: true,
    });

    // Add review to user's reviews
    await User.findByIdAndUpdate(req.user._id, {
      $push: { reviews: review._id },
    });

    const populatedReview = await Review.findById(review._id).populate('user', 'name avatar');

    res.status(201).json({ success: true, review: populatedReview });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update review
const updateReview = async (req, res) => {
  try {
    const { rating, title, comment } = req.body;

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Check authorization
    if (req.user.role !== 'admin' && review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    review.rating = rating || review.rating;
    review.title = title || review.title;
    review.comment = comment || review.comment;
    await review.save();

    const populatedReview = await Review.findById(review._id).populate('user', 'name avatar');

    res.json({ success: true, review: populatedReview });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete review
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Check authorization
    if (req.user.role !== 'admin' && review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    await Review.findByIdAndDelete(req.params.id);

    // Remove review from user's reviews
    await User.findByIdAndUpdate(review.user, {
      $pull: { reviews: review._id },
    });

    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getReviewByBooking,
  getHotelReviews,
  createReview,
  updateReview,
  deleteReview,
};
