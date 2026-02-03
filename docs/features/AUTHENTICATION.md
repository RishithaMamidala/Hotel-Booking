# Feature: Authentication

## Overview
Google OAuth 2.0 authentication with session-based state management.

## Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| AUTH-01 | Users authenticate via Google OAuth 2.0 | Must |
| AUTH-02 | Session persists for 24 hours | Must |
| AUTH-03 | Cross-origin cookies work (Vercel ↔ Render) | Must |
| AUTH-04 | Users have roles: guest, user, admin | Must |
| AUTH-05 | Protected routes return 401 if unauthenticated | Must |

## Data Schema

### User Model
```javascript
{
  googleId: String,      // Unique Google identifier
  email: String,         // Required, unique, lowercase
  name: String,          // Required
  avatar: String,        // Google profile picture URL
  role: ['guest', 'user', 'admin'],  // Default: 'user'
  bookings: [ObjectId],  // Ref: Booking
  reviews: [ObjectId],   // Ref: Review
  createdAt: Date,
  updatedAt: Date
}
```

## API Contract

| Method | Endpoint | Auth | Response |
|--------|----------|------|----------|
| GET | `/api/auth/google` | No | Redirect to Google |
| GET | `/api/auth/google/callback` | No | Redirect to frontend |
| GET | `/api/auth/me` | No | User object or null |
| POST | `/api/auth/logout` | Yes | Success message |

### Response: GET /api/auth/me
```json
{
  "success": true,
  "user": {
    "_id": "...",
    "email": "user@gmail.com",
    "name": "John Doe",
    "avatar": "https://...",
    "role": "user"
  }
}
```

## Session Configuration

```javascript
{
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,           // Production only
    httpOnly: true,         // Prevent XSS
    sameSite: 'none',       // Cross-origin
    maxAge: 86400000        // 24 hours
  }
}
```

## Definition of Done

- [ ] Google OAuth flow redirects correctly
- [ ] Session cookie set with correct flags
- [ ] `/api/auth/me` returns user when authenticated
- [ ] Protected routes return 401 when not authenticated
- [ ] Cross-origin requests include credentials
- [ ] Logout destroys session
