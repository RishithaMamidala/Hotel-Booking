const express = require('express');
const {
  getDashboardStats,
  getAnalytics,
  generateReport,
  getNotifications,
} = require('../controllers/adminController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(isAuthenticated, isAdmin);

// @route   GET /api/admin/dashboard
// @desc    Get dashboard stats
router.get('/dashboard', getDashboardStats);

// @route   GET /api/admin/analytics
// @desc    Get analytics data
router.get('/analytics', getAnalytics);

// @route   GET /api/admin/reports
// @desc    Generate PDF report
router.get('/reports', generateReport);

// @route   GET /api/admin/notifications
// @desc    Get system notifications
router.get('/notifications', getNotifications);

module.exports = router;
