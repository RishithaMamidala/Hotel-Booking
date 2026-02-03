const Booking = require('../models/Booking');
const { createPaymentIntent, constructWebhookEvent } = require('../services/stripe');
const { confirmBooking } = require('./bookingController');

// Create payment intent
const createIntent = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Verify booking belongs to user
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Check booking status
    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Payment already processed or booking cancelled',
      });
    }

    const result = await createPaymentIntent(
      booking.pricing.grandTotal,
      'usd',
      { bookingId: booking._id.toString() }
    );

    if (!result.success) {
      return res.status(500).json({ success: false, message: result.error });
    }

    res.json({
      success: true,
      clientSecret: result.clientSecret,
      paymentIntentId: result.paymentIntentId,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Stripe webhook handler
const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  const event = constructWebhookEvent(req.body, sig);

  if (!event) {
    // If no Stripe configured, simulate success
    const { bookingId, paymentIntentId } = req.body;
    if (bookingId) {
      await confirmBooking(bookingId, paymentIntentId || 'simulated');
    }
    return res.json({ received: true });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        const bookingId = paymentIntent.metadata.bookingId;
        if (bookingId) {
          await confirmBooking(bookingId, paymentIntent.id);
        }
        break;

      case 'payment_intent.payment_failed':
        console.log('Payment failed:', event.data.object.id);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get payment status
const getPaymentStatus = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check authorization
    if (req.user.role !== 'admin' && booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({
      success: true,
      payment: {
        status: booking.payment.status,
        paidAt: booking.payment.paidAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verify payment with Stripe and confirm booking (fallback for webhook)
const verifyAndConfirm = async (req, res) => {
  try {
    const { bookingId, paymentIntentId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check authorization
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // If already confirmed, return success
    if (booking.status === 'confirmed') {
      return res.json({ success: true, booking });
    }

    // Verify with Stripe
    const { confirmPayment } = require('../services/stripe');
    const result = await confirmPayment(paymentIntentId);

    if (result.success && result.status === 'succeeded') {
      // Confirm the booking
      const confirmedBooking = await confirmBooking(bookingId, paymentIntentId);
      return res.json({ success: true, booking: confirmedBooking.booking });
    }

    res.status(400).json({
      success: false,
      message: 'Payment not verified',
      status: result.status
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Simulate payment confirmation (for testing without Stripe)
const simulatePayment = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const result = await confirmBooking(bookingId, 'simulated_' + Date.now());

    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message });
    }

    res.json({ success: true, booking: result.booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createIntent,
  handleWebhook,
  getPaymentStatus,
  simulatePayment,
  verifyAndConfirm,
};
