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
  console.log('Webhook received');
  console.log('Has signature:', !!req.headers['stripe-signature']);
  console.log('Has webhook secret:', !!process.env.STRIPE_WEBHOOK_SECRET);
  console.log('Body type:', typeof req.body);
  console.log('Body is Buffer:', Buffer.isBuffer(req.body));

  const sig = req.headers['stripe-signature'];

  const event = constructWebhookEvent(req.body, sig);

  if (!event) {
    console.log('Event construction failed or no Stripe configured');
    // Return 200 to acknowledge receipt even if we can't process
    return res.json({ received: true, processed: false });
  }

  console.log('Event type:', event.type);

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        const bookingId = paymentIntent.metadata.bookingId;
        console.log('Payment succeeded for booking:', bookingId);
        if (bookingId) {
          const result = await confirmBooking(bookingId, paymentIntent.id);
          console.log('Booking confirmation result:', result);
        }
        break;

      case 'payment_intent.payment_failed':
        console.log('Payment failed:', event.data.object.id);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true, processed: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
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
// This endpoint doesn't require session auth - security comes from Stripe verification
const verifyAndConfirm = async (req, res) => {
  try {
    const { bookingId, paymentIntentId } = req.body;

    console.log('Verify endpoint called:', { bookingId, paymentIntentId });

    if (!bookingId || !paymentIntentId) {
      return res.status(400).json({ success: false, message: 'Missing bookingId or paymentIntentId' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // If already confirmed, return success
    if (booking.status === 'confirmed') {
      console.log('Booking already confirmed');
      return res.json({ success: true, booking, alreadyConfirmed: true });
    }

    // Verify with Stripe - this is our security check
    const { confirmPayment, stripe } = require('../services/stripe');

    if (!stripe) {
      // No Stripe configured - just confirm (test mode)
      console.log('No Stripe - confirming directly');
      const confirmedBooking = await confirmBooking(bookingId, paymentIntentId);
      return res.json({ success: true, booking: confirmedBooking.booking });
    }

    const result = await confirmPayment(paymentIntentId);
    console.log('Stripe verification result:', result);

    if (result.success && result.status === 'succeeded') {
      // Verify the payment intent belongs to this booking
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      if (paymentIntent.metadata.bookingId !== bookingId) {
        return res.status(403).json({ success: false, message: 'Payment does not match booking' });
      }

      // Confirm the booking
      const confirmedBooking = await confirmBooking(bookingId, paymentIntentId);
      console.log('Booking confirmed:', confirmedBooking);
      return res.json({ success: true, booking: confirmedBooking.booking });
    }

    res.status(400).json({
      success: false,
      message: 'Payment not verified',
      status: result.status
    });
  } catch (error) {
    console.error('Verify endpoint error:', error);
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
