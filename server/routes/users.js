const express = require('express');
const { body } = require('express-validator');
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserBookings,
} = require('../controllers/userController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (admin only)
router.get('/', isAuthenticated, isAdmin, getAllUsers);

// @route   GET /api/users/:id
// @desc    Get user by ID
router.get('/:id', isAuthenticated, getUserById);

// @route   PUT /api/users/:id
// @desc    Update user
router.put('/:id',
  isAuthenticated,
  [
    body('name').optional().trim().isLength({ min: 1 }).withMessage('Name cannot be empty'),
    body('role').optional().isIn(['guest', 'user', 'admin']).withMessage('Invalid role'),
  ],
  validate,
  updateUser
);

// @route   DELETE /api/users/:id
// @desc    Delete user (admin only)
router.delete('/:id', isAuthenticated, isAdmin, deleteUser);

// @route   GET /api/users/:id/bookings
// @desc    Get user bookings
router.get('/:id/bookings', isAuthenticated, getUserBookings);

module.exports = router;
