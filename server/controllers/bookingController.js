const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Hotel = require('../models/Hotel');
const User = require('../models/User');
const Extra = require('../models/Extra');
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

    // FIX 11: Validate guest capacity against room limits
    if (guests && guests.adults > room.capacity.adults) {
      return res.status(400).json({
        success: false,
        message: `Room capacity exceeded. Max ${room.capacity.adults} adults.`,
      });
    }

    // Validate extras against DB and use DB prices (before transaction — read-only)
    let resolvedExtras = [];
    if (extras && extras.length > 0) {
      const hotelExtras = await Extra.find({ hotel: hotelId, isActive: true });
      const extrasMap = new Map(hotelExtras.map(e => [e._id.toString(), e]));

      for (const item of extras) {
        const extraId = item.extraId?.toString();
        if (!extraId || !extrasMap.has(extraId)) {
          return res.status(400).json({
            success: false,
            message: `Extra with ID ${extraId} not found for this hotel`,
          });
        }
        const dbExtra = extrasMap.get(extraId);
        resolvedExtras.push({
          name: dbExtra.name,
          price: dbExtra.price, // use DB price, never client-supplied
          quantity: item.quantity || 1,
        });
      }
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = calculateNights(checkIn, checkOut);
    const pricing = calculatePricing(room.pricePerNight, nights, resolvedExtras);

    // Atomically check availability and create booking in a single transaction.
    // withTransaction retries automatically on transient write conflicts.
    let booking;
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        const overlappingBookings = await Booking.countDocuments({
          room: roomId,
          status: { $in: ['confirmed', 'checked-in'] },
          $or: [
            { checkIn: { $lt: checkOutDate, $gte: checkInDate } },
            { checkOut: { $gt: checkInDate, $lte: checkOutDate } },
            { checkIn: { $lte: checkInDate }, checkOut: { $gte: checkOutDate } },
          ],
        }).session(session);

        if (overlappingBookings >= room.quantity) {
          const err = new Error('Room not available for selected dates');
          err.statusCode = 400;
          throw err;
        }

        // create() with a session requires an array as the first argument
        const [created] = await Booking.create([{
          user: req.user._id,
          hotel: hotelId,
          room: roomId,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          guests,
          extras: resolvedExtras,
          pricing,
          specialRequests,
          status: 'pending',
        }], { session });

        booking = created;
      });
    } finally {
      session.endSession();
    }

    // Link booking to user outside the transaction — non-critical, eventual consistency is fine
    await User.findByIdAndUpdate(req.user._id, {
      $push: { bookings: booking._id },
    });

    res.status(201).json({ success: true, booking });
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ success: false, message: error.message });
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

    // Update booking (set _previousStatus for state machine validation)
    booking._previousStatus = booking.status;
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

    // Send cancellation email (don't block on email failure)
    sendCancellationConfirmation(booking, booking.user, booking.hotel, refundAmount)
      .catch(err => console.error('Failed to send cancellation email:', err.message));

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

    booking._previousStatus = booking.status;
    booking.status = 'checked-out';
    await booking.save();

    res.json({ success: true, message: 'Checkout processed successfully', booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Confirm booking (after payment)
const confirmBooking = async (bookingId, paymentIntentId) => {
  // outcome is set inside the transaction callback and read outside
  let outcome = null;

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const booking = await Booking.findById(bookingId)
        .populate('user')
        .populate('hotel')
        .populate('room')
        .session(session);

      if (!booking) {
        outcome = { success: false, message: 'Booking not found' };
        return; // nothing written — transaction commits as a no-op
      }

      // Already confirmed (e.g. webhook + verify both fired): idempotent success
      if (booking.status === 'confirmed') {
        outcome = { success: true, booking };
        return;
      }

      // Atomically re-check availability before confirming.
      // Both the count and the save run inside the same transaction, so no
      // concurrent confirmBooking call can slip through between the two.
      const overlappingConfirmed = await Booking.countDocuments({
        room: booking.room._id,
        status: { $in: ['confirmed', 'checked-in'] },
        _id: { $ne: booking._id },
        $or: [
          { checkIn: { $lt: booking.checkOut, $gte: booking.checkIn } },
          { checkOut: { $gt: booking.checkIn, $lte: booking.checkOut } },
          { checkIn: { $lte: booking.checkIn }, checkOut: { $gte: booking.checkOut } },
        ],
      }).session(session);

      if (overlappingConfirmed >= booking.room.quantity) {
        // Room was taken while payment was in flight — cancel and commit
        booking._previousStatus = booking.status;
        booking.status = 'cancelled';
        booking.cancellation = {
          cancelledAt: new Date(),
          reason: 'Room became unavailable while payment was processing',
          refundAmount: 0,
        };
        await booking.save({ session });
        outcome = { success: false, message: 'Room is no longer available. Your payment will be refunded.' };
        return; // commit the cancellation
      }

      booking._previousStatus = booking.status;
      booking.status = 'confirmed';
      booking.payment.status = 'paid';
      booking.payment.stripePaymentId = paymentIntentId;
      booking.payment.paidAt = new Date();
      await booking.save({ session });

      outcome = { success: true, booking };
    });
  } catch (error) {
    return { success: false, message: error.message };
  } finally {
    session.endSession();
  }

  // Send email outside the transaction — never blocks the commit
  if (outcome?.success && outcome.booking) {
    const { booking } = outcome;
    sendBookingConfirmation(booking, booking.user, booking.hotel, booking.room)
      .catch(err => console.error('Failed to send confirmation email:', err.message));
  }

  return outcome;
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
