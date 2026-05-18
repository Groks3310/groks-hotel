const express = require('express');
const router = express.Router();
const { getRooms, getRoom, createRoom, updateRoom, deleteRoom, checkAvailability } = require('../controllers/roomController');
const { protect, adminOnly } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `room-${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

router.get('/', getRooms);
router.get('/availability', checkAvailability);
router.get('/:id', getRoom);
router.post('/', protect, adminOnly, upload.array('images', 10), createRoom);
router.put('/:id', protect, adminOnly, updateRoom);
router.delete('/:id', protect, adminOnly, deleteRoom);

module.exports = router;