const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      zipCode: { type: String, required: true },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    images: [{
      type: String,
    }],
    amenities: [{
      type: String,
    }],
    policies: {
      checkInTime: {
        type: String,
        default: '15:00',
      },
      checkOutTime: {
        type: String,
        default: '11:00',
      },
      cancellationPolicy: {
        freeCancellationDays: {
          type: Number,
          default: 3,
        },
        refundPercentage: {
          type: Number,
          default: 100,
        },
      },
    },
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    rooms: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
    }],
    extras: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Extra',
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Text index for search
hotelSchema.index({ name: 'text', 'address.city': 'text', 'address.country': 'text' });
hotelSchema.index({ 'address.city': 1 });
hotelSchema.index({ isActive: 1 });

module.exports = mongoose.model('Hotel', hotelSchema);
