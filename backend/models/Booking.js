const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true,
  },
  checkIn: {
    type: Date,
    required: [true, 'Check-in date is required'],
  },
  checkOut: {
    type: Date,
    required: [true, 'Check-out date is required'],
  },
  guests: {
    adults: { type: Number, default: 1, min: 1 },
    children: { type: Number, default: 0 },
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  nights: {
    type: Number,
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
  },
  bookingStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no-show'],
    default: 'pending',
  },
  paymentReference: {
    type: String,
    default: '',
  },
  specialRequests: {
    type: String,
    default: '',
  },
  bookingCode: {
    type: String,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Generate unique booking code
bookingSchema.pre('save', function (next) {
  if (!this.bookingCode) {
    this.bookingCode = 'GH-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);