const User = require('../models/User');
const Hotel = require('../models/Hotel');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const PDFDocument = require('pdfkit');

// Get dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalHotels,
      totalBookings,
      totalReviews,
      recentBookings,
      bookingsByStatus,
      revenueStats,
    ] = await Promise.all([
      User.countDocuments(),
      Hotel.countDocuments({ isActive: true }),
      Booking.countDocuments(),
      Review.countDocuments(),
      Booking.find()
        .populate('user', 'name email')
        .populate('hotel', 'name')
        .sort({ createdAt: -1 })
        .limit(5),
      Booking.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Booking.aggregate([
        { $match: { 'payment.status': 'paid' } },
        { $group: { _id: null, total: { $sum: '$pricing.grandTotal' } } },
      ]),
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalHotels,
        totalBookings,
        totalReviews,
        totalRevenue: revenueStats[0]?.total || 0,
        bookingsByStatus: bookingsByStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
      },
      recentBookings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get analytics
const getAnalytics = async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Revenue by day
    const revenueByDay = await Booking.aggregate([
      {
        $match: {
          'payment.status': 'paid',
          'payment.paidAt': { $gte: startDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$payment.paidAt' } },
          revenue: { $sum: '$pricing.grandTotal' },
          bookings: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Bookings by hotel
    const bookingsByHotel = await Booking.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$hotel', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'hotels',
          localField: '_id',
          foreignField: '_id',
          as: 'hotel',
        },
      },
      { $unwind: '$hotel' },
      { $project: { name: '$hotel.name', count: 1 } },
    ]);

    // Occupancy rate by hotel
    const occupancyData = await Booking.aggregate([
      {
        $match: {
          status: { $in: ['confirmed', 'checked-in', 'checked-out'] },
          checkIn: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: '$hotel',
          totalNights: {
            $sum: {
              $divide: [{ $subtract: ['$checkOut', '$checkIn'] }, 86400000],
            },
          },
        },
      },
      {
        $lookup: {
          from: 'hotels',
          localField: '_id',
          foreignField: '_id',
          as: 'hotel',
        },
      },
      { $unwind: '$hotel' },
      {
        $lookup: {
          from: 'rooms',
          localField: '_id',
          foreignField: 'hotel',
          as: 'rooms',
        },
      },
      {
        $project: {
          name: '$hotel.name',
          totalNights: 1,
          totalCapacity: {
            $multiply: [{ $sum: '$rooms.quantity' }, days],
          },
        },
      },
    ]);

    res.json({
      success: true,
      analytics: {
        revenueByDay,
        bookingsByHotel,
        occupancyData,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Generate PDF report
const generateReport = async (req, res) => {
  try {
    const { startDate, endDate, type = 'bookings' } = req.query;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const doc = new PDFDocument();
    const chunks = [];

    doc.on('data', chunks.push.bind(chunks));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(chunks);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=report-${type}-${Date.now()}.pdf`);
      res.send(pdfBuffer);
    });

    // Header
    doc.fontSize(24).text('Hotel Booking Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Period: ${start.toLocaleDateString()} - ${end.toLocaleDateString()}`);
    doc.moveDown();

    if (type === 'bookings') {
      const bookings = await Booking.find({
        createdAt: { $gte: start, $lte: end },
      })
        .populate('hotel', 'name')
        .populate('user', 'name')
        .sort({ createdAt: -1 });

      doc.fontSize(16).text('Bookings Summary', { underline: true });
      doc.moveDown();

      const totalRevenue = bookings
        .filter(b => b.payment.status === 'paid')
        .reduce((sum, b) => sum + b.pricing.grandTotal, 0);

      doc.fontSize(12);
      doc.text(`Total Bookings: ${bookings.length}`);
      doc.text(`Total Revenue: $${totalRevenue.toFixed(2)}`);
      doc.moveDown();

      // Status breakdown
      const statusCounts = bookings.reduce((acc, b) => {
        acc[b.status] = (acc[b.status] || 0) + 1;
        return acc;
      }, {});

      doc.text('By Status:');
      Object.entries(statusCounts).forEach(([status, count]) => {
        doc.text(`  ${status}: ${count}`);
      });
      doc.moveDown();

      // Recent bookings table
      doc.fontSize(14).text('Recent Bookings:', { underline: true });
      doc.moveDown();

      bookings.slice(0, 20).forEach((booking, index) => {
        doc.fontSize(10);
        doc.text(`${index + 1}. ${booking.bookingId} - ${booking.hotel?.name || 'N/A'}`);
        doc.text(`   Guest: ${booking.user?.name || 'N/A'} | Status: ${booking.status} | Total: $${booking.pricing.grandTotal.toFixed(2)}`);
        doc.moveDown(0.5);
      });
    } else if (type === 'revenue') {
      const revenueData = await Booking.aggregate([
        {
          $match: {
            'payment.status': 'paid',
            'payment.paidAt': { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$payment.paidAt' } },
            revenue: { $sum: '$pricing.grandTotal' },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      doc.fontSize(16).text('Revenue Report', { underline: true });
      doc.moveDown();

      const totalRevenue = revenueData.reduce((sum, d) => sum + d.revenue, 0);
      const totalBookings = revenueData.reduce((sum, d) => sum + d.count, 0);

      doc.fontSize(12);
      doc.text(`Total Revenue: $${totalRevenue.toFixed(2)}`);
      doc.text(`Total Paid Bookings: ${totalBookings}`);
      doc.text(`Average per Booking: $${totalBookings > 0 ? (totalRevenue / totalBookings).toFixed(2) : 0}`);
      doc.moveDown();

      doc.fontSize(14).text('Daily Breakdown:', { underline: true });
      doc.moveDown();

      revenueData.forEach(day => {
        doc.fontSize(10);
        doc.text(`${day._id}: $${day.revenue.toFixed(2)} (${day.count} bookings)`);
      });
    }

    doc.end();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get notifications (system alerts)
const getNotifications = async (req, res) => {
  try {
    const notifications = [];

    // Check for pending bookings older than 24 hours
    const pendingBookings = await Booking.countDocuments({
      status: 'pending',
      createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });
    if (pendingBookings > 0) {
      notifications.push({
        type: 'warning',
        message: `${pendingBookings} booking(s) have been pending for more than 24 hours`,
      });
    }

    // Check for upcoming check-ins today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayCheckIns = await Booking.countDocuments({
      status: 'confirmed',
      checkIn: { $gte: today, $lt: tomorrow },
    });
    if (todayCheckIns > 0) {
      notifications.push({
        type: 'info',
        message: `${todayCheckIns} guest(s) checking in today`,
      });
    }

    // Check for low-rated hotels
    const lowRatedHotels = await Hotel.countDocuments({
      'rating.average': { $lt: 3 },
      'rating.count': { $gte: 5 },
    });
    if (lowRatedHotels > 0) {
      notifications.push({
        type: 'alert',
        message: `${lowRatedHotels} hotel(s) have ratings below 3 stars`,
      });
    }

    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getAnalytics,
  generateReport,
  getNotifications,
};
