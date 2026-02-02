const express = require('express');
const { body } = require('express-validator');
const {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBooking,
  cancelBooking,
  processCheckout,
} = require('../controllers/bookingController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// @route   GET /api/bookings
// @desc    Get all bookings (admin)
router.get('/', isAuthenticated, isAdmin, getAllBookings);

// @route   GET /api/bookings/:id
// @desc    Get booking by ID
router.get('/:id', isAuthenticated, getBookingById);

// @route   POST /api/bookings
// @desc    Create booking
router.post('/',
  isAuthenticated,
  [
    body('hotelId').notEmpty().withMessage('Hotel ID is required'),
    body('roomId').notEmpty().withMessage('Room ID is required'),
    body('checkIn').isISO8601().withMessage('Valid check-in date is required'),
    body('checkOut').isISO8601().withMessage('Valid check-out date is required'),
    body('guests.adults').isInt({ min: 1 }).withMessage('At least 1 adult guest is required'),
  ],
  validate,
  createBooking
);

// @route   PUT /api/bookings/:id
// @desc    Update booking
router.put('/:id', isAuthenticated, updateBooking);

// @route   POST /api/bookings/:id/cancel
// @desc    Cancel booking
router.post('/:id/cancel', isAuthenticated, cancelBooking);

// @route   POST /api/bookings/:id/checkout
// @desc    Process checkout (admin)
router.post('/:id/checkout', isAuthenticated, isAdmin, processCheckout);

module.exports = router;
