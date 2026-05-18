const Review = require('../models/Review');
const Booking = require('../models/Booking');

// Get reviews for a room
exports.getRoomReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ room: req.params.roomId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: reviews.length, reviews });
  } catch (err) { next(err); }
};

// Create review
exports.createReview = async (req, res, next) => {
  try {
    const { roomId, rating, comment, categories, bookingId } = req.body;

    // Verify user stayed in this room
    if (bookingId) {
      const booking = await Booking.findById(bookingId);
      if (!booking || booking.user.toString() !== req.user._id.toString())
        return res.status(403).json({ success: false, message: 'You can only review rooms you have booked' });
    }

    const existing = await Review.findOne({ user: req.user._id, room: roomId });
    if (existing) return res.status(400).json({ success: false, message: 'You have already reviewed this room' });

    const review = await Review.create({
      user: req.user._id, room: roomId, rating, comment, categories,
      booking: bookingId || undefined,
    });
    await review.populate('user', 'name avatar');
    res.status(201).json({ success: true, review });
  } catch (err) { next(err); }
};

// Delete review (admin or owner)
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Not authorized' });
    await review.deleteOne();
    res.json({ success: true, message: 'Review deleted' });
  } catch (err) { next(err); }
};

// Admin: get all reviews
exports.getAllReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'name email')
      .populate('room', 'title')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: reviews.length, reviews });
  } catch (err) { next(err); }
};