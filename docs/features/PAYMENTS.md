# Feature: Payments

## Overview
Stripe integration with dual confirmation (webhook + verify endpoint fallback).

## Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| PAY-01 | Create Stripe Payment Intent for bookings | Must |
| PAY-02 | Webhook confirms booking on payment success | Must |
| PAY-03 | Verify endpoint as webhook fallback | Must |
| PAY-04 | Card details never touch server (PCI compliance) | Must |
| PAY-05 | Refunds process on cancellation | Should |
| PAY-06 | Simulate endpoint for testing | Should |

## Architecture

### Dual Confirmation Pattern
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │     │   Backend   │     │   Stripe    │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       │ 1. Create Intent  │                   │
       │ ─────────────────>│                   │
       │                   │ 2. Create PI      │
       │                   │ ─────────────────>│
       │ 3. Client Secret  │                   │
       │ <─────────────────│                   │
       │                   │                   │
       │ 4. Confirm Payment│                   │
       │ ─────────────────────────────────────>│
       │                   │                   │
       │                   │ 5a. Webhook       │
       │                   │ <─────────────────│
       │                   │                   │
       │ 5b. Verify (fallback)                 │
       │ ─────────────────>│                   │
       │                   │ 6. Check PI       │
       │                   │ ─────────────────>│
       │                   │                   │
       │ 7. Confirmed      │                   │
       │ <─────────────────│                   │
```

**Why Dual Confirmation?**
- Webhooks can fail during server cold starts (Render free tier)
- Verify endpoint provides immediate feedback to user
- Both paths are idempotent (safe to run multiple times)

## API Contract

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/payments/create-intent` | User | Create Payment Intent |
| POST | `/api/payments/webhook` | Stripe Sig | Handle Stripe events |
| POST | `/api/payments/verify` | None* | Verify & confirm booking |
| GET | `/api/payments/:bookingId/status` | Owner/Admin | Get payment status |
| POST | `/api/payments/simulate` | User | Test without Stripe |

*Verify endpoint security via Stripe API verification, not session auth.

### Request: POST /api/payments/create-intent
```json
{
  "bookingId": "507f1f77bcf86cd799439014"
}
```

### Response: POST /api/payments/create-intent
```json
{
  "success": true,
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx"
}
```

### Request: POST /api/payments/verify
```json
{
  "bookingId": "507f1f77bcf86cd799439014",
  "paymentIntentId": "pi_xxx"
}
```

## Webhook Events

| Event | Action |
|-------|--------|
| `payment_intent.succeeded` | Confirm booking, send email |
| `payment_intent.payment_failed` | Log failure |

### Webhook Security
```javascript
// Raw body required for signature verification
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// Verify signature
const event = stripe.webhooks.constructEvent(
  req.body,
  req.headers['stripe-signature'],
  process.env.STRIPE_WEBHOOK_SECRET
);
```

## Verify Endpoint Security

The verify endpoint does NOT use session auth. Security is enforced by:

1. **Stripe API Verification**: Checks payment status directly with Stripe
2. **Metadata Match**: Confirms `paymentIntent.metadata.bookingId` matches request

```javascript
const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
if (paymentIntent.metadata.bookingId !== bookingId) {
  return res.status(403).json({ message: 'Payment does not match booking' });
}
```

## Payment Intent Metadata

```javascript
await stripe.paymentIntents.create({
  amount: Math.round(grandTotal * 100),  // Cents
  currency: 'usd',
  metadata: {
    bookingId: booking._id.toString()    // Links payment to booking
  }
});
```

## Definition of Done

- [ ] Payment Intent creates with correct amount
- [ ] Client secret returned to frontend
- [ ] Webhook receives and processes events
- [ ] Webhook signature verification works
- [ ] Verify endpoint confirms booking
- [ ] Verify validates payment-booking match
- [ ] Booking status updates to "confirmed"
- [ ] Refunds process on cancellation
