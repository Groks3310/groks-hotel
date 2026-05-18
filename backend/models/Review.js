const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
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
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    trim: true,
    maxlength: [500, 'Review cannot exceed 500 characters'],
  },
  categories: {
    cleanliness: { type: Number, min: 1, max: 5 },
    service: { type: Number, min: 1, max: 5 },
    comfort: { type: Number, min: 1, max: 5 },
    location: { type: Number, min: 1, max: 5 },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// One review per booking
reviewSchema.index({ booking: 1 }, { unique: true, sparse: true });

// Update room rating after review save
reviewSchema.post('save', async function () {
  const Room = mongoose.model('Room');
  const stats = await mongoose.model('Review').aggregate([
    { $match: { room: this.room } },
    { $group: { _id: '$room', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  if (stats.length > 0) {
    await Room.findByIdAndUpdate(this.room, {
      'rating.average': Math.round(stats[0].avgRating * 10) / 10,
      'rating.count': stats[0].count,
    });
  }
});

module.exports = mongoose.model('Review', reviewSchema);