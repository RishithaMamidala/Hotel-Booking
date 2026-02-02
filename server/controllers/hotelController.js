const Hotel = require('../models/Hotel');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const Extra = require('../models/Extra');

// Get all hotels with filters
const getAllHotels = async (req, res) => {
  try {
    const {
      city,
      country,
      minPrice,
      maxPrice,
      amenities,
      rating,
      search,
      checkIn,
      checkOut,
      guests,
      page = 1,
      limit = 10,
    } = req.query;

    const query = { isActive: true };

    // Location filters
    if (city) query['address.city'] = new RegExp(city, 'i');
    if (country) query['address.country'] = new RegExp(country, 'i');

    // Rating filter
    if (rating) query['rating.average'] = { $gte: parseFloat(rating) };

    // Amenities filter
    if (amenities) {
      const amenityList = amenities.split(',');
      query.amenities = { $all: amenityList };
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let hotels = await Hotel.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ 'rating.average': -1 });

    // Price filter requires checking rooms
    if (minPrice || maxPrice) {
      const hotelIds = hotels.map(h => h._id);
      const priceQuery = { hotel: { $in: hotelIds }, isActive: true };

      if (minPrice) priceQuery.pricePerNight = { $gte: parseFloat(minPrice) };
      if (maxPrice) {
        priceQuery.pricePerNight = priceQuery.pricePerNight || {};
        priceQuery.pricePerNight.$lte = parseFloat(maxPrice);
      }

      const roomsWithPrice = await Room.find(priceQuery).distinct('hotel');
      hotels = hotels.filter(h => roomsWithPrice.some(id => id.equals(h._id)));
    }

    // Filter by room availability if dates are provided
    if (checkIn && checkOut) {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      const guestCount = guests ? parseInt(guests) : null;

      const hotelIds = hotels.map(h => h._id);

      // Get all rooms for these hotels
      const allRooms = await Room.find({
        hotel: { $in: hotelIds },
        isActive: true,
      });

      // Get overlapping bookings for all hotels
      const overlappingBookings = await Booking.find({
        hotel: { $in: hotelIds },
        status: { $in: ['confirmed', 'checked-in'] },
        $or: [
          { checkIn: { $lt: checkOutDate, $gte: checkInDate } },
          { checkOut: { $gt: checkInDate, $lte: checkOutDate } },
          { checkIn: { $lte: checkInDate }, checkOut: { $gte: checkOutDate } },
        ],
      });

      // Calculate availability per hotel
      const hotelsWithAvailability = hotels.filter(hotel => {
        const hotelRooms = allRooms.filter(
          r => r.hotel.toString() === hotel._id.toString()
        );

        // Check if any room has availability
        return hotelRooms.some(room => {
          const bookedCount = overlappingBookings.filter(
            b =>
              b.hotel.toString() === hotel._id.toString() &&
              b.room.toString() === room._id.toString()
          ).length;

          const available = room.quantity - bookedCount;

          // Check capacity if guests specified
          let meetsCapacity = true;
          if (guestCount) {
            meetsCapacity = room.capacity.adults + room.capacity.children >= guestCount;
          }

          return available > 0 && meetsCapacity;
        });
      });

      hotels = hotelsWithAvailability;
    }

    const total = await Hotel.countDocuments(query);

    res.json({
      success: true,
      hotels,
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

// Get single hotel
const getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id)
      .populate('rooms')
      .populate('extras');

    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    res.json({ success: true, hotel });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create hotel (admin)
const createHotel = async (req, res) => {
  try {
    const hotel = await Hotel.create(req.body);
    res.status(201).json({ success: true, hotel });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update hotel (admin)
const updateHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    res.json({ success: true, hotel });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete hotel (admin)
const deleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    res.json({ success: true, message: 'Hotel deactivated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get hotel rooms
const getHotelRooms = async (req, res) => {
  try {
    const rooms = await Room.find({
      hotel: req.params.id,
      isActive: true,
    });

    res.json({ success: true, rooms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Check availability
const checkAvailability = async (req, res) => {
  try {
    const { checkIn, checkOut, guests } = req.query;

    if (!checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Check-in and check-out dates are required',
      });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // Get all rooms for this hotel
    const rooms = await Room.find({
      hotel: req.params.id,
      isActive: true,
    });

    // Get overlapping bookings
    const overlappingBookings = await Booking.find({
      hotel: req.params.id,
      status: { $in: ['confirmed', 'checked-in'] },
      $or: [
        { checkIn: { $lt: checkOutDate, $gte: checkInDate } },
        { checkOut: { $gt: checkInDate, $lte: checkOutDate } },
        { checkIn: { $lte: checkInDate }, checkOut: { $gte: checkOutDate } },
      ],
    });

    // Calculate availability for each room type
    const availability = rooms.map(room => {
      const bookedCount = overlappingBookings.filter(
        b => b.room.toString() === room._id.toString()
      ).length;

      const available = room.quantity - bookedCount;

      // Check capacity if guests specified
      let meetsCapacity = true;
      if (guests) {
        const guestCount = parseInt(guests);
        meetsCapacity = room.capacity.adults + room.capacity.children >= guestCount;
      }

      return {
        room: {
          _id: room._id,
          name: room.name,
          type: room.type,
          pricePerNight: room.pricePerNight,
          capacity: room.capacity,
          amenities: room.amenities,
          images: room.images,
        },
        available: available > 0 && meetsCapacity ? available : 0,
        totalQuantity: room.quantity,
      };
    });

    res.json({ success: true, availability });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get hotel extras
const getHotelExtras = async (req, res) => {
  try {
    const extras = await Extra.find({
      hotel: req.params.id,
      isActive: true,
    });

    res.json({ success: true, extras });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel,
  getHotelRooms,
  checkAvailability,
  getHotelExtras,
};
