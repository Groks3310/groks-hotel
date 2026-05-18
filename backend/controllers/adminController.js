const User = require('../models/User');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Review = require('../models/Review');

// Dashboard stats
exports.getDashboardStats = async (req, res, next) => {
  try {
    const [totalUsers, totalRooms, totalBookings, allBookings] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Room.countDocuments(),
      Booking.countDocuments(),
      Booking.find().select('totalPrice paymentStatus bookingStatus createdAt'),
    ]);

    const totalRevenue = allBookings
      .filter(b => b.paymentStatus === 'paid')
      .reduce((sum, b) => sum + b.totalPrice, 0);

    const pendingBookings = allBookings.filter(b => b.bookingStatus === 'pending').length;
    const confirmedBookings = allBookings.filter(b => b.bookingStatus === 'confirmed').length;
    const cancelledBookings = allBookings.filter(b => b.bookingStatus === 'cancelled').length;

    // Monthly revenue (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyRevenue = await Booking.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, revenue: { $sum: '$totalPrice' }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Recent bookings
    const recentBookings = await Booking.find()
      .populate('user', 'name email')
      .populate('room', 'title category')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      stats: {
        totalUsers, totalRooms, totalBookings, totalRevenue,
        pendingBookings, confirmedBookings, cancelledBookings,
        monthlyRevenue, recentBookings,
      },
    });
  } catch (err) { next(err); }
};

// Get all users
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (err) { next(err); }
};

// Update user role
exports.updateUserRole = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) { next(err); }
};

// Delete user
exports.deleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (err) { next(err); }
};