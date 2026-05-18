// routes/bookings.js
const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings, getBooking, cancelBooking, getAllBookings, updateBookingStatus } = require('../controllers/bookingController')
const { protect, adminOnly } = require('../middleware/auth');
const Booking = require('../models/Booking')

// Delete booking (admin only)
const deleteBooking = async (req, res, next) => {
  try {
    console.log('DELETE booking:', req.params.id, 'by user:', req.user?._id)
    const booking = await Booking.findByIdAndDelete(req.params.id)
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' })
    const io = req.app.get('io')
    if (io) io.emit('bookingStatusUpdate', { bookingId: req.params.id, status: 'deleted' })
    res.json({ success: true, message: 'Booking deleted successfully' })
  } catch (err) {
    console.error('Delete booking error:', err.message)
    next(err)
  }
}

router.post('/', protect, createBooking);
router.get('/my', protect, getMyBookings);
router.get('/all', protect, adminOnly, getAllBookings);
router.get('/:id', protect, getBooking);
router.put('/:id/cancel', protect, cancelBooking);
router.put('/:id/status', protect, adminOnly, updateBookingStatus);
router.delete('/:id', protect, adminOnly, deleteBooking);

module.exports = router;