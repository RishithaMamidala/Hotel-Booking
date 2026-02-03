# Hotel Booking Application - Technical Documentation

**Version:** 1.0.0
**Last Updated:** February 2026
**Architecture:** MERN Stack (MongoDB, Express.js, React, Node.js)

---

## Table of Contents

1. [System Architecture](#1-system-architecture)
2. [Features Implemented](#2-features-implemented)
3. [Data Flows](#3-data-flows)
4. [Database Design](#4-database-design)
5. [API Endpoints](#5-api-endpoints)
6. [Deployment Configuration](#6-deployment-configuration)
7. [Security Measures](#7-security-measures)

---

## 1. System Architecture

### Overview

The application is deployed across three services:
- **Frontend:** React SPA hosted on Vercel
- **Backend:** Express.js API hosted on Render
- **Database:** MongoDB Atlas (cloud-hosted)

### Technology Choices

| Layer | Technology | Reason |
|-------|------------|--------|
| Frontend | React 18 + Vite | Fast development, modern tooling |
| Styling | Tailwind CSS | Utility-first, rapid prototyping |
| Routing | React Router v6 | Standard for React SPAs |
| State | Context API | Simple auth and booking state |
| Backend | Express.js | Lightweight, flexible Node.js framework |
| Auth | Passport.js + Google OAuth | Secure, no password storage needed |
| Sessions | express-session | Server-side session management |
| Database | MongoDB + Mongoose | Flexible schema, good for nested data |
| Payments | Stripe | Industry standard, PCI compliant |
| Email | Nodemailer | Simple SMTP integration |

### Component Structure

**Frontend** consists of:
- Reusable components (Header, Footer, Cards, Forms)
- Page components (Home, Hotels, Booking Flow, Profile)
- Context providers (Auth, Booking)
- API service layer (Axios client)

**Backend** consists of:
- Route handlers for each resource
- Controllers with business logic
- Mongoose models with validation
- Middleware for auth and validation
- Services for Stripe and email

---

## 2. Features Implemented

### User Features

| Feature | Description |
|---------|-------------|
| Google Sign-In | OAuth 2.0 authentication, no passwords |
| Hotel Search | Text search, filters by city/price/amenities |
| Room Availability | Real-time check for selected dates |
| Multi-step Booking | Select room → Add extras → Payment |
| Stripe Payments | Secure card processing via Payment Intents |
| Booking Management | View bookings, cancel with refund |
| Reviews | Post reviews after checkout, 1-5 stars |

### Admin Features

| Feature | Description |
|---------|-------------|
| Dashboard | Stats overview, recent bookings |
| Hotel Management | Create, update, soft-delete hotels |
| Room Management | Configure room types and pricing |
| Booking Management | View all bookings, process check-in/out |
| User Management | View users, change roles |
| Reports | PDF generation for analytics |

### Technical Features

| Feature | Description |
|---------|-------------|
| Dual Payment Confirmation | Webhook + verify endpoint for reliability |
| Async Email Sending | Non-blocking to prevent timeouts |
| Auto-generated Booking IDs | Format: BK-00001 |
| Auto-calculated Ratings | Hotel rating updates on new reviews |
| Soft Deletes | Hotels/rooms use isActive flag |
| Input Validation | All endpoints validated with express-validator |

---

## 3. Data Flows

### Authentication Flow

1. User clicks "Sign in with Google"
2. Browser redirects to Google consent screen
3. User authenticates with Google
4. Google redirects back with authorization code
5. Backend exchanges code for user profile
6. Backend creates/finds user in database
7. Session cookie is set
8. User redirected to frontend

**Session Configuration:**
- 24-hour expiration
- HTTP-only (not accessible via JavaScript)
- Secure flag in production (HTTPS only)
- SameSite=none for cross-origin (Vercel ↔ Render)

### Booking Flow

1. User searches for hotels
2. User selects hotel and views rooms
3. User checks availability for dates
4. User selects room and optional extras
5. Backend creates booking with status "pending"
6. Backend creates Stripe Payment Intent
7. Frontend displays Stripe payment form
8. User completes payment
9. Stripe webhook OR verify endpoint confirms booking
10. Booking status changes to "confirmed"
11. Confirmation email sent asynchronously

### Payment Confirmation (Dual Path)

**Why two paths?** Webhooks can fail during Render's cold starts.

**Path A - Webhook (Primary):**
Stripe sends event → Backend receives → Confirms booking

**Path B - Verify (Fallback):**
Client calls /verify → Backend checks Stripe API → Confirms booking

Both paths are idempotent (safe to run multiple times).

### Cancellation Flow

1. User requests cancellation
2. Backend validates: booking not cancelled, 24+ hours before check-in
3. Backend calculates refund based on hotel policy
4. Stripe refund processed (if paid)
5. Booking status changes to "cancelled"
6. Cancellation email sent asynchronously

---

## 4. Database Design

### Collections

| Collection | Purpose |
|------------|---------|
| users | User accounts (Google OAuth) |
| hotels | Hotel listings with policies |
| rooms | Room types belonging to hotels |
| extras | Add-ons (breakfast, parking, etc.) |
| bookings | Reservations with pricing |
| reviews | User reviews for hotels |

### Key Relationships

- Hotel → has many → Rooms
- Hotel → has many → Extras
- User → has many → Bookings
- User → has many → Reviews
- Booking → belongs to → User, Hotel, Room
- Review → belongs to → User, Hotel, Booking

### Indexes Created

| Collection | Index | Purpose |
|------------|-------|---------|
| hotels | text(name, city, country) | Search functionality |
| hotels | city | Filter by location |
| rooms | hotel + isActive | List active rooms |
| rooms | pricePerNight | Price filtering |
| bookings | user + status | User's bookings |
| bookings | hotel + dates | Availability check |
| reviews | user + booking (unique) | One review per booking |
| reviews | hotel + createdAt | Hotel reviews listing |

### Booking Status Flow

```
pending → confirmed → checked-in → checked-out
    ↓         ↓            ↓
    └────→ cancelled ←─────┘
```

### Payment Status Flow

```
pending → paid → refunded
            ↓
      partial-refund
```

---

## 5. API Endpoints

### Authentication

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | /api/auth/google | No | Start OAuth flow |
| GET | /api/auth/google/callback | No | OAuth callback |
| GET | /api/auth/me | No | Get current user |
| POST | /api/auth/logout | Yes | End session |

### Hotels

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | /api/hotels | No | List with filters |
| GET | /api/hotels/:id | No | Get details |
| GET | /api/hotels/:id/rooms | No | Get rooms |
| GET | /api/hotels/:id/availability | No | Check dates |
| GET | /api/hotels/:id/extras | No | Get add-ons |
| POST | /api/hotels | Admin | Create hotel |
| PUT | /api/hotels/:id | Admin | Update hotel |
| DELETE | /api/hotels/:id | Admin | Soft delete |

### Bookings

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | /api/bookings | Admin | List all |
| GET | /api/bookings/:id | Owner/Admin | Get details |
| POST | /api/bookings | User | Create booking |
| PUT | /api/bookings/:id | Owner/Admin | Update |
| POST | /api/bookings/:id/cancel | Owner/Admin | Cancel |
| POST | /api/bookings/:id/checkout | Admin | Process checkout |

### Payments

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | /api/payments/create-intent | User | Create payment |
| POST | /api/payments/webhook | Stripe | Handle events |
| POST | /api/payments/verify | None* | Verify & confirm |
| GET | /api/payments/:id/status | Owner | Check status |
| POST | /api/payments/simulate | User | Test mode |

*Verify endpoint secured via Stripe API verification, not session.

### Reviews

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | /api/reviews/hotel/:id | No | Hotel reviews |
| GET | /api/reviews/booking/:id | User | Booking review |
| POST | /api/reviews | User | Create review |
| PUT | /api/reviews/:id | Owner | Update |
| DELETE | /api/reviews/:id | Owner/Admin | Delete |

### Users

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | /api/users | Admin | List users |
| GET | /api/users/:id | Owner/Admin | Get user |
| PUT | /api/users/:id | Owner/Admin | Update |
| DELETE | /api/users/:id | Admin | Delete |
| GET | /api/users/:id/bookings | Owner/Admin | User bookings |

### Admin

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | /api/admin/dashboard | Admin | Statistics |
| GET | /api/admin/analytics | Admin | Revenue data |
| GET | /api/admin/reports | Admin | PDF reports |

---

## 6. Deployment Configuration

### Frontend (Vercel)

| Setting | Value |
|---------|-------|
| Root Directory | client |
| Build Command | npm run build |
| Output Directory | dist |
| Framework | Vite |
| Node Version | 18.x |

**Environment Variables:**
- VITE_API_URL (backend URL)
- VITE_STRIPE_PUBLIC_KEY

**SPA Rewrite:** All routes redirect to index.html for client-side routing.

### Backend (Render)

| Setting | Value |
|---------|-------|
| Root Directory | server |
| Build Command | npm install |
| Start Command | npm start |
| Health Check | /api/health |

**Environment Variables:**
- NODE_ENV=production
- MONGODB_URI
- SESSION_SECRET
- GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL
- CLIENT_URL
- STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
- SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM (optional)

### Database (MongoDB Atlas)

| Setting | Value |
|---------|-------|
| Cluster Tier | M0 (Free) |
| Network Access | 0.0.0.0/0 (for Render) |
| Database User | Read/Write permissions |

### Google OAuth

**Authorized Origins:**
- http://localhost:5173 (dev)
- https://hotel-booking-tau-seven.vercel.app (prod)

**Authorized Redirect URIs:**
- http://localhost:5000/api/auth/google/callback (dev)
- https://hotel-booking-api-b83e.onrender.com/api/auth/google/callback (prod)

### Stripe

**Webhook Endpoint:** https://hotel-booking-api-b83e.onrender.com/api/payments/webhook

**Events Subscribed:**
- payment_intent.succeeded
- payment_intent.payment_failed

---

## 7. Security Measures

### Authentication

| Measure | Implementation |
|---------|----------------|
| OAuth 2.0 | No passwords stored |
| Session cookies | HTTP-only, secure, sameSite=none |
| CSRF protection | Handled by Passport state parameter |
| Trust proxy | Enabled for Render's reverse proxy |

### Authorization

| Resource | Rules |
|----------|-------|
| Bookings | Owner or admin can access |
| Reviews | Owner can edit/delete |
| Hotels/Rooms | Admin only for mutations |
| Users | Admin for list/delete, owner for own data |

### Payment Security

| Measure | Implementation |
|---------|----------------|
| PCI Compliance | Card details never touch server |
| Stripe Elements | Client-side card handling |
| Webhook verification | Signature validation |
| Payment-booking match | Verified via Stripe metadata |

### Input Validation

All POST/PUT endpoints use express-validator for:
- Required field checks
- Type validation
- Length limits
- Sanitization (trim, escape)

### CORS Configuration

- Allowed origins: localhost, CLIENT_URL, *.vercel.app
- Credentials: true (for cookies)
- Methods: Standard REST methods

---

## Appendix: Live URLs

| Service | URL |
|---------|-----|
| Frontend | https://hotel-booking-tau-seven.vercel.app |
| Backend API | https://hotel-booking-api-b83e.onrender.com/api |
| Health Check | https://hotel-booking-api-b83e.onrender.com/api/health |

---

**Document Revision History:**

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Feb 2026 | Initial documentation |
