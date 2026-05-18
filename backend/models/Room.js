const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Room title is required'],
    trim: true,
  },
  category: {
    type: String,
    enum: ['Deluxe Room', 'Executive Suite', 'Presidential Suite', 'Family Room'],
    required: true,
  },
  description: {
    type: String,
    required: [true, 'Room description is required'],
  },
  images: [
    {
      url: { type: String, required: true },
      alt: { type: String, default: '' },
    },
  ],
  price: {
    type: Number,
    required: [true, 'Price per night is required'],
    min: [0, 'Price cannot be negative'],
  },
  amenities: [
    {
      type: String,
    },
  ],
  capacity: {
    adults: { type: Number, default: 2 },
    children: { type: Number, default: 0 },
  },
  size: {
    type: Number, // in sqm
    default: 0,
  },
  floor: {
    type: Number,
    default: 1,
  },
  roomNumber: {
    type: String,
    unique: true,
    required: true,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
  },
  featured: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Room', roomSchema);