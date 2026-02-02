const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['single', 'double', 'suite', 'deluxe', 'penthouse'],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    capacity: {
      adults: {
        type: Number,
        required: true,
        min: 1,
      },
      children: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    pricePerNight: {
      type: Number,
      required: true,
      min: 0,
    },
    images: [{
      type: String,
    }],
    amenities: [{
      type: String,
    }],
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

roomSchema.index({ hotel: 1, isActive: 1 });
roomSchema.index({ type: 1 });
roomSchema.index({ pricePerNight: 1 });

module.exports = mongoose.model('Room', roomSchema);
