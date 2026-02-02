const Room = require('../models/Room');
const Hotel = require('../models/Hotel');

// Get all rooms
const getAllRooms = async (req, res) => {
  try {
    const { hotel, type, minPrice, maxPrice, page = 1, limit = 10 } = req.query;

    const query = { isActive: true };

    if (hotel) query.hotel = hotel;
    if (type) query.type = type;
    if (minPrice) query.pricePerNight = { $gte: parseFloat(minPrice) };
    if (maxPrice) {
      query.pricePerNight = query.pricePerNight || {};
      query.pricePerNight.$lte = parseFloat(maxPrice);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const rooms = await Room.find(query)
      .populate('hotel', 'name address')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ pricePerNight: 1 });

    const total = await Room.countDocuments(query);

    res.json({
      success: true,
      rooms,
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

// Get single room
const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('hotel');

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    res.json({ success: true, room });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create room (admin)
const createRoom = async (req, res) => {
  try {
    // Verify hotel exists
    const hotel = await Hotel.findById(req.body.hotel);
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    const room = await Room.create(req.body);

    // Add room to hotel's rooms array
    hotel.rooms.push(room._id);
    await hotel.save();

    res.status(201).json({ success: true, room });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update room (admin)
const updateRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    res.json({ success: true, room });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete room (admin)
const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    res.json({ success: true, message: 'Room deactivated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
};
