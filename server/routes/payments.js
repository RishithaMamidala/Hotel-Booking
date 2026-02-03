const express = require('express');
const { body } = require('express-validator');
const {
  createIntent,
  handleWebhook,
  getPaymentStatus,
  simulatePayment,
} = require('../controllers/paymentController');
const { isAuthenticated } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// @route   POST /api/payments/create-intent
// @desc    Create Stripe payment intent
router.post('/create-intent',
  isAuthenticated,
  [
    body('bookingId').notEmpty().withMessage('Booking ID is required'),
  ],
  validate,
  createIntent
);

// @route   POST /api/payments/webhook
// @desc    Stripe webhook handler (raw body middleware applied in server.js)
router.post('/webhook', handleWebhook);

// @route   GET /api/payments/:bookingId/status
// @desc    Get payment status
router.get('/:bookingId/status', isAuthenticated, getPaymentStatus);

// @route   POST /api/payments/simulate
// @desc    Simulate payment (for testing)
router.post('/simulate',
  isAuthenticated,
  [
    body('bookingId').notEmpty().withMessage('Booking ID is required'),
  ],
  validate,
  simulatePayment
);

module.exports = router;
