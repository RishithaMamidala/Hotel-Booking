# Hotel Booking & Management System

A full-stack MERN hotel booking application with Google OAuth, Stripe payments, and admin dashboard.

## Live Demo

- **Frontend:** https://hotel-booking-tau-seven.vercel.app
- **Backend API:** https://hotel-booking-api-b83e.onrender.com/api

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                    │
│                         (Vercel - React SPA)                            │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐  │
│   │   Search    │  │   Booking   │  │   Payment   │  │    Admin     │  │
│   │   Hotels    │  │    Flow     │  │   (Stripe)  │  │  Dashboard   │  │
│   └─────────────┘  └─────────────┘  └─────────────┘  └──────────────┘  │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │ HTTPS (REST API)
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              BACKEND                                     │
│                       (Render - Express.js)                             │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐  │
│   │  Passport   │  │  Bookings   │  │  Payments   │  │    Email     │  │
│   │  (OAuth)    │  │  Controller │  │  Controller │  │   Service    │  │
│   └─────────────┘  └─────────────┘  └─────────────┘  └──────────────┘  │
└───────┬─────────────────┬─────────────────┬─────────────────┬───────────┘
        │                 │                 │                 │
        ▼                 ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│    Google    │  │   MongoDB    │  │    Stripe    │  │     SMTP     │
│    OAuth     │  │    Atlas     │  │   Payments   │  │  (SendGrid)  │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
```

## Features

- **Authentication** - Google OAuth 2.0 via Passport.js
- **Hotel Search** - Browse, filter by location/price/amenities
- **Room Booking** - Check availability, select extras, multi-step checkout
- **Payments** - Stripe integration with webhook confirmation
- **Reviews** - Post-stay reviews with verified badges
- **Admin Dashboard** - Manage hotels, rooms, bookings, users, analytics

## Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, React Router, Stripe Elements
**Backend:** Node.js, Express, Passport.js, Mongoose
**Database:** MongoDB
**Services:** Stripe (payments), Nodemailer (emails)

## Quick Start

```bash
# Install dependencies
npm run install:all

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Seed sample data (optional)
cd server && npm run seed

# Start development
npm run dev
```

**URLs:** Frontend `http://localhost:5173` | Backend `http://localhost:5000`

## Environment Variables

```env
# Required
MONGODB_URI=mongodb+srv://...
SESSION_SECRET=your-secret-min-32-chars
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
CLIENT_URL=http://localhost:5173
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLIC_KEY=pk_test_xxx

# Optional (emails logged to console if not set)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.xxx
EMAIL_FROM=noreply@hotel.com
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/google` | Initiate Google OAuth |
| GET | `/api/auth/google/callback` | OAuth callback |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/logout` | Logout |

### Hotels
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/hotels` | List hotels (with filters) |
| GET | `/api/hotels/:id` | Get hotel details |
| GET | `/api/hotels/:id/rooms` | Get hotel rooms |
| GET | `/api/hotels/:id/availability` | Check room availability |
| GET | `/api/hotels/:id/extras` | Get hotel extras |
| POST | `/api/hotels` | Create hotel (admin) |
| PUT | `/api/hotels/:id` | Update hotel (admin) |
| DELETE | `/api/hotels/:id` | Delete hotel (admin) |

### Rooms
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/rooms` | List rooms |
| GET | `/api/rooms/:id` | Get room details |
| POST | `/api/rooms` | Create room (admin) |
| PUT | `/api/rooms/:id` | Update room (admin) |
| DELETE | `/api/rooms/:id` | Delete room (admin) |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bookings` | List all bookings (admin) |
| GET | `/api/bookings/:id` | Get booking details |
| POST | `/api/bookings` | Create booking |
| PUT | `/api/bookings/:id` | Update booking |
| POST | `/api/bookings/:id/cancel` | Cancel booking |
| POST | `/api/bookings/:id/checkout` | Process checkout (admin) |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/create-intent` | Create Stripe payment intent |
| POST | `/api/payments/webhook` | Stripe webhook handler |
| POST | `/api/payments/verify` | Verify payment (webhook fallback) |
| GET | `/api/payments/:bookingId/status` | Get payment status |
| POST | `/api/payments/simulate` | Simulate payment (testing) |

### Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reviews/hotel/:hotelId` | Get hotel reviews |
| GET | `/api/reviews/booking/:bookingId` | Get review for booking |
| POST | `/api/reviews` | Create review |
| PUT | `/api/reviews/:id` | Update review |
| DELETE | `/api/reviews/:id` | Delete review |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List users (admin) |
| GET | `/api/users/:id` | Get user details |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user (admin) |
| GET | `/api/users/:id/bookings` | Get user's bookings |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Dashboard statistics |
| GET | `/api/admin/analytics` | Revenue analytics |
| GET | `/api/admin/reports` | Generate PDF reports |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |

## Deployment

- **Frontend:** Vercel (set root to `client`)
- **Backend:** Render (set root to `server`)
- **Database:** MongoDB Atlas

## Testing Without Services

- **Payments:** Use `POST /api/payments/simulate` to confirm bookings
- **Emails:** Logged to console when SMTP not configured
