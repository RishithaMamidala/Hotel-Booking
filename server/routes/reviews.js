const express = require('express');
const { body } = require('express-validator');
const {
  getReviewByBooking,
  getHotelReviews,
  createReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');
const { isAuthenticated } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// @route   GET /api/reviews/booking/:bookingId
// @desc    Get review for a specific booking
router.get('/booking/:bookingId', isAuthenticated, getReviewByBooking);

// @route   GET /api/reviews/hotel/:hotelId
// @desc    Get hotel reviews
router.get('/hotel/:hotelId', getHotelReviews);

// @route   POST /api/reviews
// @desc    Create review
router.post('/',
  isAuthenticated,
  [
    body('bookingId').notEmpty().withMessage('Booking ID is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Title is required (max 100 chars)'),
    body('comment').trim().isLength({ min: 1, max: 1000 }).withMessage('Comment is required (max 1000 chars)'),
  ],
  validate,
  createReview
);

// @route   PUT /api/reviews/:id
// @desc    Update review
router.put('/:id', isAuthenticated, updateReview);

// @route   DELETE /api/reviews/:id
// @desc    Delete review
router.delete('/:id', isAuthenticated, deleteReview);

module.exports = router;
