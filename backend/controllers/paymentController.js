const axios = require('axios')
const Booking = require('../models/Booking')
const User = require('../models/User')
const { sendPaymentSuccess } = require('../utils/emailService')

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY

// Initialize payment
exports.initializePayment = async (req, res, next) => {
  try {
    const { bookingId } = req.body
    const booking = await Booking.findById(bookingId).populate('user', 'name email').populate('room', 'title')
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' })
    if (booking.user._id.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized' })

    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: booking.user.email,
        amount: booking.totalPrice * 100,
        reference: `GH-PAY-${booking.bookingCode}-${Date.now()}`,
        metadata: {
          bookingId: booking._id.toString(),
          bookingCode: booking.bookingCode,
          roomTitle: booking.room.title,
          custom_fields: [
            { display_name: 'Booking Code', variable_name: 'booking_code', value: booking.bookingCode },
            { display_name: 'Room', variable_name: 'room', value: booking.room.title },
          ],
        },
        channels: ['card', 'bank', 'ussd', 'mobile_money', 'bank_transfer'],
        callback_url: `${process.env.CLIENT_URL}/payment/success`,
      },
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}`, 'Content-Type': 'application/json' } }
    )
    res.json({ success: true, data: response.data.data })
  } catch (err) { next(err) }
}

// Verify payment
exports.verifyPayment = async (req, res, next) => {
  try {
    const { reference } = req.params
    const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
    })

    const { status, metadata, amount } = response.data.data
    if (status !== 'success')
      return res.status(400).json({ success: false, message: 'Payment not successful' })

    const booking = await Booking.findById(metadata.bookingId)
      .populate('user', 'name email phone')
      .populate('room', 'title category price')
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' })

    if (booking.paymentStatus !== 'paid') {
      booking.paymentStatus = 'paid'
      booking.bookingStatus = 'confirmed'
      booking.paymentReference = reference
      await booking.save()

      // Real-time
      const io = req.app.get('io')
      if (io) {
        io.emit('paymentConfirmed', { bookingId: booking._id, bookingCode: booking.bookingCode })
        io.emit('bookingStatusUpdate', { bookingId: booking._id, status: 'confirmed' })
      }

      // Send payment success email
      sendPaymentSuccess(booking, booking.user, booking.room)
        .catch(e => console.error('Payment email error:', e.message))
    }

    res.json({ success: true, message: 'Payment verified', booking })
  } catch (err) { next(err) }
}

// Paystack webhook
exports.paystackWebhook = async (req, res, next) => {
  try {
    const crypto = require('crypto')
    const hash = crypto.createHmac('sha512', PAYSTACK_SECRET).update(JSON.stringify(req.body)).digest('hex')
    if (hash !== req.headers['x-paystack-signature'])
      return res.status(400).json({ message: 'Invalid signature' })

    const { event, data } = req.body
    if (event === 'charge.success') {
      const booking = await Booking.findById(data.metadata?.bookingId)
        .populate('user', 'name email')
        .populate('room', 'title category price')
      if (booking && booking.paymentStatus !== 'paid') {
        booking.paymentStatus = 'paid'
        booking.bookingStatus = 'confirmed'
        booking.paymentReference = data.reference
        await booking.save()
        sendPaymentSuccess(booking, booking.user, booking.room)
          .catch(e => console.error('Webhook email error:', e.message))
      }
    }
    res.sendStatus(200)
  } catch (err) { next(err) }
}