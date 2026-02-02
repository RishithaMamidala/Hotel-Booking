const express = require('express');
const passport = require('passport');
const { getCurrentUser, logout } = require('../controllers/authController');

const router = express.Router();

// @route   GET /api/auth/google
// @desc    Initiate Google OAuth
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
}));

// @route   GET /api/auth/google/callback
// @desc    Google OAuth callback
router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=auth_failed`,
  }),
  (req, res) => {
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/`);
  }
);

// @route   GET /api/auth/me
// @desc    Get current user
router.get('/me', getCurrentUser);

// @route   POST /api/auth/logout
// @desc    Logout user
router.post('/logout', logout);

module.exports = router;
