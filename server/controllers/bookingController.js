const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Hotel = require('../models/Hotel');
const User = require('../models/User');
const { calculateNights, calculatePricing, calculateRefund, isCancellationAllowed } = require('../utils/helpers');
const { sendBookingConfirmation, sendCancellationConfirmation } = require('../services/email');
const { createRefund } = require('../services/stripe');

// Get all bookings (admin)
const getAllBookings = async (req, res) => {
  try {
    const { status, hotel, page = 1, limit = 10 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (hotel) query.hotel = hotel;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const bookings = await Booking.find(query)
      .populate('user', 'name email')
      .populate('hotel', 'name address')
      .populate('room', 'name type')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single booking
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email')
      .populate('hotel')
      .populate('room');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check authorization
    if (req.user.role !== 'admin' && booking.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create booking
const createBooking = async (req, res) => {
  try {
    const { hotelId, roomId, checkIn, checkOut, guests, extras, specialRequests } = req.body;

    // Verify room exists and is available
    const room = await Room.findById(roomId);
    if (!room || !room.isActive) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    const hotel = await Hotel.findById(hotelId);
    if (!hotel || !hotel.isActive) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    // Check availability
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    const overlappingBookings = await Booking.countDocuments({
      room: roomId,
      status: { $in: ['confirmed', 'checked-in'] },
      $or: [
        { checkIn: { $lt: checkOutDate, $gte: checkInDate } },
        { checkOut: { $gt: checkInDate, $lte: checkOutDate } },
        { checkIn: { $lte: checkInDate }, checkOut: { $gte: checkOutDate } },
      ],
    });

    if (overlappingBookings >= room.quantity) {
      return res.status(400).json({
        success: false,
        message: 'Room not available for selected dates',
      });
    }

    // Calculate pricing
    const nights = calculateNights(checkIn, checkOut);
    const pricing = calculatePricing(room.pricePerNight, nights, extras || []);

    // Create booking
    const booking = await Booking.create({
      user: req.user._id,
      hotel: hotelId,
      room: roomId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests,
      extras: extras || [],
      pricing,
      specialRequests,
      status: 'pending',
    });

    // Add booking to user's bookings
    await User.findByIdAndUpdate(req.user._id, {
      $push: { bookings: booking._id },
    });

    res.status(201).json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update booking
const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check authorization
    if (req.user.role !== 'admin' && booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Only allow certain updates based on status
    const allowedUpdates = ['specialRequests', 'guests'];
    if (req.user.role === 'admin') {
      allowedUpdates.push('status', 'payment');
    }

    const updates = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    )
      .populate('user', 'name email')
      .populate('hotel')
      .populate('room');

    res.json({ success: true, booking: updatedBooking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cancel booking
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('hotel')
      .populate('user');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check authorization
    if (req.user.role !== 'admin' && booking.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Check if cancellation is allowed based on status
    if (['cancelled', 'checked-out'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel this booking',
      });
    }

    // Check if cancellation is at least 24 hours before check-in
    if (!isCancellationAllowed(booking.checkIn)) {
      return res.status(400).json({
        success: false,
        message: 'Cancellations must be made at least 24 hours before check-in time',
      });
    }

    // Calculate refund
    const refundAmount = calculateRefund(
      booking.pricing.grandTotal,
      booking.checkIn,
      booking.hotel.policies.cancellationPolicy
    );

    // Process refund if payment was made
    if (booking.payment.status === 'paid' && booking.payment.stripePaymentId && refundAmount > 0) {
      await createRefund(booking.payment.stripePaymentId, refundAmount);
    }

    // Update booking
    booking.status = 'cancelled';
    booking.cancellation = {
      cancelledAt: new Date(),
      reason: req.body.reason || 'User requested cancellation',
      refundAmount,
    };
    if (refundAmount > 0) {
      booking.payment.status = refundAmount === booking.pricing.grandTotal ? 'refunded' : 'partial-refund';
    }
    await booking.save();

    // Send cancellation email
    await sendCancellationConfirmation(booking, booking.user, booking.hotel, refundAmount);

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      refundAmount,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Process checkout
const processCheckout = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.status !== 'checked-in') {
      return res.status(400).json({
        success: false,
        message: 'Booking must be checked-in before checkout',
      });
    }

    booking.status = 'checked-out';
    await booking.save();

    res.json({ success: true, message: 'Checkout processed successfully', booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Confirm booking (after payment)
const confirmBooking = async (bookingId, paymentIntentId) => {
  try {
    const booking = await Booking.findById(bookingId)
      .populate('user')
      .populate('hotel')
      .populate('room');

    if (!booking) {
      return { success: false, message: 'Booking not found' };
    }

    booking.status = 'confirmed';
    booking.payment.status = 'paid';
    booking.payment.stripePaymentId = paymentIntentId;
    booking.payment.paidAt = new Date();
    await booking.save();

    // Send confirmation email
    await sendBookingConfirmation(booking, booking.user, booking.hotel, booking.room);

    return { success: true, booking };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

module.exports = {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBooking,
  cancelBooking,
  processCheckout,
  confirmBooking,
};
