# Feature: Reviews

## Overview
Post-stay review system with automatic hotel rating calculation.

## Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| REV-01 | Users can review after completed stay | Must |
| REV-02 | One review per booking | Must |
| REV-03 | Hotel rating auto-updates on new review | Must |
| REV-04 | Reviews display on hotel page | Must |
| REV-05 | Users can edit/delete own reviews | Should |

## Data Schema

### Review Model
```javascript
{
  user: ObjectId,             // Ref: User
  hotel: ObjectId,            // Ref: Hotel
  booking: ObjectId,          // Ref: Booking (unique per user)
  rating: Number,             // 1-5, required
  title: String,              // Max 100 chars
  comment: String,            // Max 1000 chars
  isVerified: Boolean,        // Has completed booking
  createdAt: Date,
  updatedAt: Date
}
```

## API Contract

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/reviews/hotel/:hotelId` | No | Get hotel reviews |
| GET | `/api/reviews/booking/:bookingId` | User | Get review for booking |
| POST | `/api/reviews` | User | Create review |
| PUT | `/api/reviews/:id` | Owner | Update review |
| DELETE | `/api/reviews/:id` | Owner/Admin | Delete review |

### Request: POST /api/reviews
```json
{
  "bookingId": "507f1f77bcf86cd799439014",
  "rating": 5,
  "title": "Excellent stay!",
  "comment": "The hotel exceeded our expectations..."
}
```

### Response: GET /api/reviews/hotel/:hotelId
```json
{
  "success": true,
  "reviews": [
    {
      "_id": "...",
      "user": { "name": "John Doe", "avatar": "..." },
      "rating": 5,
      "title": "Excellent stay!",
      "comment": "...",
      "isVerified": true,
      "createdAt": "2026-02-20T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25
  }
}
```

## Validation Rules

| Field | Rule |
|-------|------|
| bookingId | Must be user's booking |
| bookingId | Booking status must be 'checked-out' |
| bookingId | No existing review for this booking |
| rating | Integer 1-5 |
| title | Required, max 100 characters |
| comment | Required, max 1000 characters |

## Auto-Rating Calculation

On review save, hotel rating updates automatically:

```javascript
reviewSchema.post('save', async function () {
  const reviews = await Review.find({ hotel: this.hotel });

  if (reviews.length > 0) {
    const average = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await Hotel.findByIdAndUpdate(this.hotel, {
      rating: {
        average: Math.round(average * 10) / 10,  // 1 decimal
        count: reviews.length
      }
    });
  }
});
```

## Indexes

```javascript
// Prevent duplicate reviews
reviewSchema.index({ user: 1, booking: 1 }, { unique: true });

// Efficient hotel review listing
reviewSchema.index({ hotel: 1, createdAt: -1 });
```

## Definition of Done

- [ ] Only checked-out bookings can be reviewed
- [ ] One review per booking enforced
- [ ] Hotel rating updates on new review
- [ ] Rating average calculates correctly
- [ ] Reviews paginate on hotel page
- [ ] Users can edit own reviews
- [ ] Users can delete own reviews
- [ ] Admins can delete any review
