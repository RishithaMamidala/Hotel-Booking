# Feature: Hotels & Rooms

## Overview
Hotel listings with rooms, availability checking, and extras/add-ons.

## Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| HTL-01 | List hotels with search and filters | Must |
| HTL-02 | Show hotel details with rooms | Must |
| HTL-03 | Check room availability for dates | Must |
| HTL-04 | Display hotel extras/add-ons | Must |
| HTL-05 | Admin can CRUD hotels and rooms | Must |
| HTL-06 | Soft delete (isActive flag) | Should |

## Data Schemas

### Hotel Model
```javascript
{
  name: String,               // Required
  description: String,        // Required
  address: {
    street: String,
    city: String,             // Indexed for search
    state: String,
    country: String,          // Indexed for search
    zipCode: String,
    coordinates: { lat: Number, lng: Number }
  },
  images: [String],           // URLs
  amenities: [String],        // ["WiFi", "Pool", "Spa"]
  policies: {
    checkInTime: String,      // Default: "15:00"
    checkOutTime: String,     // Default: "11:00"
    cancellationPolicy: {
      freeCancellationDays: Number,   // Default: 3
      refundPercentage: Number        // Default: 100
    }
  },
  rating: {
    average: Number,          // 0-5, auto-calculated
    count: Number             // Review count
  },
  rooms: [ObjectId],          // Ref: Room
  extras: [ObjectId],         // Ref: Extra
  isActive: Boolean           // Soft delete
}
```

### Room Model
```javascript
{
  hotel: ObjectId,            // Ref: Hotel
  name: String,
  type: ['single', 'double', 'suite', 'deluxe', 'penthouse'],
  description: String,
  capacity: {
    adults: Number,           // Min: 1
    children: Number          // Default: 0
  },
  pricePerNight: Number,
  images: [String],
  amenities: [String],
  quantity: Number,           // Total rooms of this type
  isActive: Boolean
}
```

### Extra Model
```javascript
{
  hotel: ObjectId,            // Ref: Hotel
  name: String,
  description: String,
  price: Number,
  type: ['breakfast', 'parking', 'late-checkout', 'spa', 'other'],
  isActive: Boolean
}
```

## API Contract

### Hotels

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/hotels` | No | List with filters |
| GET | `/api/hotels/:id` | No | Get details |
| GET | `/api/hotels/:id/rooms` | No | Get rooms |
| GET | `/api/hotels/:id/availability` | No | Check availability |
| GET | `/api/hotels/:id/extras` | No | Get extras |
| POST | `/api/hotels` | Admin | Create hotel |
| PUT | `/api/hotels/:id` | Admin | Update hotel |
| DELETE | `/api/hotels/:id` | Admin | Soft delete |

### Rooms

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/rooms` | No | List rooms |
| GET | `/api/rooms/:id` | No | Get room |
| POST | `/api/rooms` | Admin | Create room |
| PUT | `/api/rooms/:id` | Admin | Update room |
| DELETE | `/api/rooms/:id` | Admin | Soft delete |

### Query Parameters: GET /api/hotels

| Parameter | Type | Description |
|-----------|------|-------------|
| search | string | Text search (name, city, country) |
| city | string | Filter by city |
| minPrice | number | Minimum price |
| maxPrice | number | Maximum price |
| amenities | string | Comma-separated list |
| page | number | Page number |
| limit | number | Results per page |

### Query Parameters: GET /api/hotels/:id/availability

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| checkIn | ISO8601 | Yes | Check-in date |
| checkOut | ISO8601 | Yes | Check-out date |
| guests | number | No | Filter by capacity |

## Availability Algorithm

```javascript
// For each room type:
const bookedCount = await Booking.countDocuments({
  room: room._id,
  status: { $in: ['confirmed', 'checked-in'] },
  $or: [
    { checkIn: { $lt: checkOut }, checkOut: { $gt: checkIn } }
  ]
});

const available = room.quantity - bookedCount;
```

## Indexes

```javascript
// Hotel
hotelSchema.index({ name: 'text', 'address.city': 'text', 'address.country': 'text' });
hotelSchema.index({ 'address.city': 1 });
hotelSchema.index({ isActive: 1 });

// Room
roomSchema.index({ hotel: 1, isActive: 1 });
roomSchema.index({ type: 1 });
roomSchema.index({ pricePerNight: 1 });
```

## Definition of Done

- [ ] Hotels list with pagination
- [ ] Search works (name, city, country)
- [ ] Filters work (price, amenities)
- [ ] Room availability calculates correctly
- [ ] Extras display for hotel
- [ ] Admin can create/update/delete
- [ ] Soft delete preserves booking history
