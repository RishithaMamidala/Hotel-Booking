# Feature: Bookings

## Overview
Multi-step booking flow with room selection, extras, and pricing calculation.

## Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| BOOK-01 | Users can create bookings for available rooms | Must |
| BOOK-02 | Pricing auto-calculates (room + extras + tax) | Must |
| BOOK-03 | Booking ID auto-generates (BK-00001 format) | Must |
| BOOK-04 | Users can cancel within policy window | Must |
| BOOK-05 | Status transitions follow state machine | Must |
| BOOK-06 | Users can only view their own bookings | Must |

## State Machine

```
pending → confirmed → checked-in → checked-out
    ↓         ↓            ↓
cancelled ←───┴────────────┘
```

| From | To | Trigger |
|------|-----|---------|
| pending | confirmed | Payment succeeded |
| pending | cancelled | User cancels / timeout |
| confirmed | checked-in | Admin check-in |
| confirmed | cancelled | User cancels (24hr+ before) |
| checked-in | checked-out | Admin checkout |
| checked-in | cancelled | Admin override |

## Data Schema

### Booking Model
```javascript
{
  bookingId: String,        // Auto: "BK-00001"
  user: ObjectId,           // Ref: User
  hotel: ObjectId,          // Ref: Hotel
  room: ObjectId,           // Ref: Room
  checkIn: Date,
  checkOut: Date,
  guests: {
    adults: Number,         // Min: 1
    children: Number        // Default: 0
  },
  extras: [{
    name: String,
    price: Number,
    quantity: Number
  }],
  pricing: {
    roomTotal: Number,      // nights × pricePerNight
    extrasTotal: Number,    // Σ(price × quantity)
    taxes: Number,          // 10% of subtotal
    grandTotal: Number
  },
  status: ['pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled'],
  payment: {
    stripePaymentId: String,
    status: ['pending', 'paid', 'refunded', 'partial-refund'],
    paidAt: Date
  },
  cancellation: {
    cancelledAt: Date,
    reason: String,
    refundAmount: Number
  },
  specialRequests: String
}
```

## API Contract

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/bookings` | Admin | List all bookings |
| GET | `/api/bookings/:id` | Owner/Admin | Get booking details |
| POST | `/api/bookings` | User | Create booking |
| PUT | `/api/bookings/:id` | Owner/Admin | Update booking |
| POST | `/api/bookings/:id/cancel` | Owner/Admin | Cancel booking |
| POST | `/api/bookings/:id/checkout` | Admin | Process checkout |

### Request: POST /api/bookings
```json
{
  "hotelId": "...",
  "roomId": "...",
  "checkIn": "2026-03-01",
  "checkOut": "2026-03-05",
  "guests": { "adults": 2, "children": 0 },
  "extras": [{ "name": "Breakfast", "price": 25, "quantity": 4 }],
  "specialRequests": "Late check-in"
}
```

### Response: POST /api/bookings
```json
{
  "success": true,
  "booking": {
    "_id": "...",
    "bookingId": "BK-00001",
    "status": "pending",
    "pricing": {
      "roomTotal": 796,
      "extrasTotal": 100,
      "taxes": 89.60,
      "grandTotal": 985.60
    }
  }
}
```

## Pricing Formula

```
nights = ceil((checkOut - checkIn) / (24 * 60 * 60 * 1000))
roomTotal = pricePerNight × nights
extrasTotal = Σ(extra.price × extra.quantity)
taxes = (roomTotal + extrasTotal) × 0.10
grandTotal = roomTotal + extrasTotal + taxes
```

## Cancellation Rules

| Condition | Refund |
|-----------|--------|
| 3+ days before check-in | 100% |
| < 3 days before check-in | 0% |
| < 24 hours before check-in | Not allowed |

## Definition of Done

- [ ] Booking creates with status "pending"
- [ ] Pricing calculates correctly
- [ ] BookingId auto-generates uniquely
- [ ] Cancellation respects 24hr rule
- [ ] Refund amount follows policy
- [ ] Users can only access own bookings
- [ ] Admin can access all bookings
