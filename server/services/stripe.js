const Stripe = require('stripe');

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

const createPaymentIntent = async (amount, currency = 'usd', metadata = {}) => {
  if (!stripe) {
    console.log('Stripe not configured. Payment would be for:', amount, currency);
    return {
      success: true,
      clientSecret: 'test_client_secret',
      paymentIntentId: 'test_pi_' + Date.now(),
    };
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    console.error('Stripe payment intent error:', error);
    return { success: false, error: error.message };
  }
};

const confirmPayment = async (paymentIntentId) => {
  if (!stripe) {
    return { success: true, status: 'succeeded' };
  }

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return { success: true, status: paymentIntent.status };
  } catch (error) {
    console.error('Stripe confirm payment error:', error);
    return { success: false, error: error.message };
  }
};

const createRefund = async (paymentIntentId, amount = null) => {
  if (!stripe) {
    console.log('Stripe refund simulated for:', paymentIntentId, amount);
    return { success: true, refundId: 'test_refund_' + Date.now() };
  }

  try {
    const refundData = { payment_intent: paymentIntentId };
    if (amount) {
      refundData.amount = Math.round(amount * 100);
    }

    const refund = await stripe.refunds.create(refundData);
    return { success: true, refundId: refund.id };
  } catch (error) {
    console.error('Stripe refund error:', error);
    return { success: false, error: error.message };
  }
};

const constructWebhookEvent = (payload, signature) => {
  console.log('constructWebhookEvent called');
  console.log('Stripe configured:', !!stripe);
  console.log('Webhook secret configured:', !!process.env.STRIPE_WEBHOOK_SECRET);
  console.log('Signature present:', !!signature);
  console.log('Payload type:', typeof payload);
  console.log('Payload is Buffer:', Buffer.isBuffer(payload));

  if (!stripe) {
    console.log('Stripe not configured');
    return null;
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.log('STRIPE_WEBHOOK_SECRET not set');
    return null;
  }

  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log('Webhook event constructed successfully:', event.type);
    return event;
  } catch (error) {
    console.error('Webhook signature verification failed:', error.message);
    return null;
  }
};

module.exports = {
  stripe,
  createPaymentIntent,
  confirmPayment,
  createRefund,
  constructWebhookEvent,
};
