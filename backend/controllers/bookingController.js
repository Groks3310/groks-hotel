const Booking = require('../models/Booking')
const Room = require('../models/Room')
const User = require('../models/User')
const { sendBookingConfirmation, sendAdminBookingAlert, sendCancellationEmail } = require('../utils/emailService')

// Create booking
exports.createBooking = async (req, res, next) => {
  try {
    const { room: roomId, checkIn, checkOut, guests, specialRequests } = req.body
    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)

    if (checkInDate >= checkOutDate)
      return res.status(400).json({ success: false, message: 'Check-out must be after check-in' })

    const conflict = await Booking.findOne({
      room: roomId,
      bookingStatus: { $in: ['pending', 'confirmed'] },
      $or: [{ checkIn: { $lt: checkOutDate }, checkOut: { $gt: checkInDate } }],
    })
    if (conflict) return res.status(400).json({ success: false, message: 'Room is not available for selected dates' })

    const room = await Room.findById(roomId)
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' })

    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24))
    const totalPrice = nights * room.price

    const booking = await Booking.create({
      user: req.user._id, room: roomId,
      checkIn: checkInDate, checkOut: checkOutDate,
      guests, nights, totalPrice, specialRequests,
    })

    const populated = await booking.populate([
      { path: 'user', select: 'name email phone' },
      { path: 'room', select: 'title category price images' },
    ])

    // Real-time
    const io = req.app.get('io')
    if (io) {
      io.emit('newBooking', { bookingId: booking._id, roomId, bookingCode: booking.bookingCode, message: `Room ${room.title} booked` })
      io.emit('roomAvailabilityUpdate', { roomId, available: false })
    }

    // Emails (non-blocking)
    const user = await User.findById(req.user._id)
    sendBookingConfirmation(booking, user, room).catch(e => console.error('Email error:', e.message))
    sendAdminBookingAlert(booking, user, room).catch(e => console.error('Admin email error:', e.message))

    res.status(201).json({ success: true, booking: populated })
  } catch (err) { next(err) }
}

// Get user bookings
exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('room', 'title category images price')
      .sort({ createdAt: -1 })
    res.json({ success: true, bookings })
  } catch (err) { next(err) }
}

// Get single booking
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('room', 'title category images price amenities')
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' })
    if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Not authorized' })
    res.json({ success: true, booking })
  } catch (err) { next(err) }
}

// Cancel booking
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('room', 'title category')
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' })
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Not authorized' })
    if (booking.bookingStatus === 'cancelled')
      return res.status(400).json({ success: false, message: 'Already cancelled' })

    booking.bookingStatus = 'cancelled'
    await booking.save()

    const io = req.app.get('io')
    if (io) {
      io.emit('bookingStatusUpdate', { bookingId: booking._id, status: 'cancelled' })
      io.emit('roomAvailabilityUpdate', { roomId: booking.room, available: true })
    }

    // Send cancellation email
    const user = await User.findById(req.user._id)
    sendCancellationEmail(booking, user, booking.room).catch(e => console.error('Email error:', e.message))

    res.json({ success: true, message: 'Booking cancelled', booking })
  } catch (err) { next(err) }
}

// Admin: get all bookings
exports.getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email')
      .populate('room', 'title category price')
      .sort({ createdAt: -1 })
    const totalRevenue = bookings.filter(b => b.paymentStatus === 'paid').reduce((sum, b) => sum + b.totalPrice, 0)
    res.json({ success: true, count: bookings.length, totalRevenue, bookings })
  } catch (err) { next(err) }
}

// Admin: update booking status
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { bookingStatus } = req.body
    const booking = await Booking.findByIdAndUpdate(req.params.id, { bookingStatus }, { new: true })
      .populate('user', 'name email').populate('room', 'title')
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' })
    const io = req.app.get('io')
    if (io) io.emit('bookingStatusUpdate', { bookingId: booking._id, status: bookingStatus })
    res.json({ success: true, booking })
  } catch (err) { next(err) }
}