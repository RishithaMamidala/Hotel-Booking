const express = require('express');
const { body } = require('express-validator');
const {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
} = require('../controllers/roomController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// @route   GET /api/rooms
// @desc    Get all rooms
router.get('/', getAllRooms);

// @route   GET /api/rooms/:id
// @desc    Get single room
router.get('/:id', getRoomById);

// @route   POST /api/rooms
// @desc    Create room (admin)
router.post('/',
  isAuthenticated,
  isAdmin,
  [
    body('hotel').notEmpty().withMessage('Hotel ID is required'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('type').isIn(['single', 'double', 'suite', 'deluxe', 'penthouse']).withMessage('Invalid room type'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('capacity.adults').isInt({ min: 1 }).withMessage('Adults capacity must be at least 1'),
    body('pricePerNight').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  ],
  validate,
  createRoom
);

// @route   PUT /api/rooms/:id
// @desc    Update room (admin)
router.put('/:id', isAuthenticated, isAdmin, updateRoom);

// @route   DELETE /api/rooms/:id
// @desc    Delete room (admin)
router.delete('/:id', isAuthenticated, isAdmin, deleteRoom);

module.exports = router;
