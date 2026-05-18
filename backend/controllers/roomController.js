const Room = require('../models/Room');
const Booking = require('../models/Booking');

// Get all rooms with filtering
exports.getRooms = async (req, res, next) => {
  try {
    const { category, minPrice, maxPrice, capacity, available, featured } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (minPrice || maxPrice) filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
    if (capacity) filter['capacity.adults'] = { $gte: Number(capacity) };
    if (available !== undefined) filter.isAvailable = available === 'true';
    if (featured === 'true') filter.featured = true;

    const rooms = await Room.find(filter).sort({ featured: -1, createdAt: -1 });
    res.json({ success: true, count: rooms.length, rooms });
  } catch (err) {
    next(err);
  }
};

// Get single room
exports.getRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    res.json({ success: true, room });
  } catch (err) {
    next(err);
  }
};

// Check room availability for dates
exports.checkAvailability = async (req, res, next) => {
  try {
    const { roomId, checkIn, checkOut } = req.query;
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    const conflicting = await Booking.findOne({
      room: roomId,
      bookingStatus: { $in: ['pending', 'confirmed'] },
      $or: [
        { checkIn: { $lt: checkOutDate }, checkOut: { $gt: checkInDate } },
      ],
    });

    res.json({ success: true, available: !conflicting });
  } catch (err) {
    next(err);
  }
};

// Create room (admin)
exports.createRoom = async (req, res, next) => {
  try {
    const images = req.files
      ? req.files.map((f) => ({ url: `/uploads/${f.filename}`, alt: f.originalname }))
      : req.body.images || [];
    const room = await Room.create({ ...req.body, images });
    res.status(201).json({ success: true, room });
  } catch (err) {
    next(err);
  }
};

// Update room (admin)
exports.updateRoom = async (req, res, next) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    res.json({ success: true, room });
  } catch (err) {
    next(err);
  }
};

// Delete room (admin)
exports.deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    res.json({ success: true, message: 'Room deleted successfully' });
  } catch (err) {
    next(err);
  }
};