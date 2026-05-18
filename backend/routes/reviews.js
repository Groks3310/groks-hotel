const express = require('express');
const router = express.Router();
const { getRoomReviews, createReview, deleteReview, getAllReviews } = require('../controllers/reviewController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/room/:roomId', getRoomReviews);
router.post('/', protect, createReview);
router.delete('/:id', protect, deleteReview);
router.get('/all', protect, adminOnly, getAllReviews);

module.exports = router;