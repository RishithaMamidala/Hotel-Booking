const express = require('express');
const { body } = require('express-validator');
const {
  getAllHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel,
  getHotelRooms,
  checkAvailability,
  getHotelExtras,
} = require('../controllers/hotelController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// @route   GET /api/hotels
// @desc    Get all hotels with filters
router.get('/', getAllHotels);

// @route   GET /api/hotels/:id
// @desc    Get single hotel
router.get('/:id', getHotelById);

// @route   POST /api/hotels
// @desc    Create hotel (admin)
router.post('/',
  isAuthenticated,
  isAdmin,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('address.street').trim().notEmpty().withMessage('Street is required'),
    body('address.city').trim().notEmpty().withMessage('City is required'),
    body('address.state').trim().notEmpty().withMessage('State is required'),
    body('address.country').trim().notEmpty().withMessage('Country is required'),
    body('address.zipCode').trim().notEmpty().withMessage('Zip code is required'),
  ],
  validate,
  createHotel
);

// @route   PUT /api/hotels/:id
// @desc    Update hotel (admin)
router.put('/:id', isAuthenticated, isAdmin, updateHotel);

// @route   DELETE /api/hotels/:id
// @desc    Delete hotel (admin)
router.delete('/:id', isAuthenticated, isAdmin, deleteHotel);

// @route   GET /api/hotels/:id/rooms
// @desc    Get hotel rooms
router.get('/:id/rooms', getHotelRooms);

// @route   GET /api/hotels/:id/availability
// @desc    Check hotel availability
router.get('/:id/availability', checkAvailability);

// @route   GET /api/hotels/:id/extras
// @desc    Get hotel extras
router.get('/:id/extras', getHotelExtras);

module.exports = router;
