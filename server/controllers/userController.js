const User = require('../models/User');
const Booking = require('../models/Booking');
const Review = require('../models/Review');

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('-googleId')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments();

    res.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-googleId');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { name, avatar } = req.body;

    // Users can only update their own profile unless admin
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (avatar) updateData.avatar = avatar;

    // Only admin can change roles
    if (req.user.role === 'admin' && req.body.role) {
      updateData.role = req.body.role;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-googleId');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete user (admin only)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user bookings
const getUserBookings = async (req, res) => {
  try {
    // Users can only view their own bookings unless admin
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const bookings = await Booking.find({ user: req.params.id })
      .populate('hotel', 'name address images')
      .populate('room', 'name type')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Get reviews for all checked-out bookings
    const bookingIds = bookings
      .filter(b => b.status === 'checked-out')
      .map(b => b._id);

    const reviews = await Review.find({ booking: { $in: bookingIds } }).select('booking');
    const reviewedBookingIds = new Set(reviews.map(r => r.booking.toString()));

    // Add hasReview flag to each booking
    const bookingsWithReviewStatus = bookings.map(booking => ({
      ...booking.toObject(),
      hasReview: reviewedBookingIds.has(booking._id.toString()),
    }));

    const total = await Booking.countDocuments({ user: req.params.id });

    res.json({
      success: true,
      bookings: bookingsWithReviewStatus,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserBookings,
};
