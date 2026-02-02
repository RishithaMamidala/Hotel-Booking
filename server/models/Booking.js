const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      unique: true,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: true,
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    checkIn: {
      type: Date,
      required: true,
    },
    checkOut: {
      type: Date,
      required: true,
    },
    guests: {
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
    extras: [{
      name: { type: String },
      price: { type: Number },
      quantity: { type: Number },
    }],
    pricing: {
      roomTotal: { type: Number, required: true },
      extrasTotal: { type: Number, default: 0 },
      taxes: { type: Number, default: 0 },
      grandTotal: { type: Number, required: true },
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled'],
      default: 'pending',
    },
    payment: {
      stripePaymentId: { type: String },
      status: {
        type: String,
        enum: ['pending', 'paid', 'refunded', 'partial-refund'],
        default: 'pending',
      },
      paidAt: { type: Date },
    },
    cancellation: {
      cancelledAt: { type: Date },
      reason: { type: String },
      refundAmount: { type: Number },
    },
    specialRequests: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Generate unique booking ID before saving
bookingSchema.pre('validate', async function (next) {
  if (!this.bookingId) {
    const count = await mongoose.model('Booking').countDocuments();
    this.bookingId = `BK-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ hotel: 1, checkIn: 1, checkOut: 1 });
bookingSchema.index({ status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
