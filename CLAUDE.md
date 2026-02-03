# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

```bash
# Install all dependencies (root, client, server)
npm run install:all

# Run both frontend and backend in development
npm run dev

# Run frontend only (from root)
npm run client

# Run backend only (from root)
npm run server

# Build frontend for production
npm run build

# Seed database with sample data
cd server && npm run seed

# Lint codebase
npm run lint
npm run lint:fix
```

## Architecture Overview

This is a MERN stack hotel booking application with session-based authentication via Google OAuth.

### Authentication Flow
- Google OAuth 2.0 via Passport.js (`server/config/passport.js`)
- Session cookies stored server-side with `express-session`
- Cross-origin cookie configuration: `sameSite: 'none'`, `secure: true` in production
- Frontend uses `withCredentials: true` on all API requests

### Payment Flow (Dual Confirmation)
Stripe payments use two parallel confirmation paths for reliability:
1. **Webhook** (`POST /api/payments/webhook`): Primary path, receives Stripe events
2. **Verify endpoint** (`POST /api/payments/verify`): Fallback that verifies directly with Stripe API

The verify endpoint exists because webhooks can fail during server cold starts on free-tier hosting. It does NOT require session auth—security comes from Stripe API verification.

**Critical:** The webhook route must receive raw body. In `server.js`, `express.raw()` middleware is applied BEFORE `express.json()`:
```javascript
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
```

### Booking State Machine
```
pending → confirmed → checked-in → checked-out
    ↓                      ↓
cancelled ←───────────────┘
```

### Key Data Relationships
- `Hotel` has many `Room` and `Extra` documents
- `Booking` references `User`, `Hotel`, and `Room`
- `Review` requires a completed `Booking` (one review per booking)
- Hotel `rating.average` is automatically recalculated via Review post-save hook

### Frontend State
- `AuthContext`: User authentication state, triggers Google OAuth redirect
- `BookingContext`: Multi-step booking flow state (hotel, room, dates, guests)
- API client (`client/src/services/api.js`): Axios with `withCredentials: true`

### Email Service
Emails are sent asynchronously to avoid blocking responses:
```javascript
sendBookingConfirmation(booking, user, hotel, room)
  .catch(err => console.error('Failed:', err.message));
```
If SMTP is not configured, emails are logged to console but the operation succeeds.

## Environment Variables

Backend requires: `MONGODB_URI`, `SESSION_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`, `CLIENT_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`

Frontend requires: `VITE_API_URL`, `VITE_STRIPE_PUBLIC_KEY`

## Testing Without External Services

- **Payments**: `POST /api/payments/simulate` confirms booking without Stripe
- **Emails**: Logged to console when SMTP not configured
- **OAuth**: Requires valid Google credentials (no mock available)

## Deployment

- **Frontend**: Vercel with `client/vercel.json` SPA rewrite
- **Backend**: Render with `render.yaml` configuration
- **Database**: MongoDB Atlas (whitelist `0.0.0.0/0` for Render's dynamic IPs)

## AI Project Rules

### Do NOT
- Add authentication middleware to `/api/payments/verify` endpoint
- Make email sending synchronous (use `.catch()` pattern)
- Place `express.raw()` after `express.json()` in server.js
- Use JWT instead of session-based auth (user preference)
- Remove `withCredentials: true` from API client

### Always
- Keep emails async to prevent timeout blocking
- Verify payment-booking match via Stripe API metadata
- Use `sameSite: 'none'` and `secure: true` for cookies in production
- Check feature specs in `docs/features/` before implementing changes

## Feature Specifications

See `docs/features/` for detailed specs:
- `AUTHENTICATION.md` - OAuth flow, session config
- `BOOKINGS.md` - State machine, pricing, cancellation
- `PAYMENTS.md` - Stripe integration, dual confirmation
- `HOTELS.md` - Search, availability, rooms
- `REVIEWS.md` - Rating calculation, validation
