// routes/auth.js
const express = require('express');
const router = express.Router();
const { register, login, logout, getMe, updateProfile, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// ── THE BAGGAGE SCANNER (IMAGE FILE VALIDATOR) ───────
const imageFilter = (req, file, cb) => {
  // 1. Define allowed formats
  const allowedExtensions = /jpeg|jpg|png|webp/;

  // 2. Validate the file extension name
  const isExtValid = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  
  // 3. Double-check the internal file signature (MIME type)
  const isMimeValid = allowedExtensions.test(file.mimetype);

  if (isExtValid && isMimeValid) {
    return cb(null, true); // Safe file, let it pass through!
  }

  // Reject file cleanly with a security error
  cb(new Error('Security Error: Only valid image files (.jpg, .jpeg, .png, .webp) are allowed!'), false);
};

// Configure disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `avatar-${Date.now()}${path.extname(file.originalname)}`),
});

// Apply storage configurations, the image filter, and a strict 5MB limit
const upload = multer({ 
  storage, 
  fileFilter: imageFilter, // <-- Activates your scanner!
  limits: { fileSize: 5 * 1024 * 1024 } 
});

// ── ROUTES ───────────────────────────────────────────
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getMe);

// Profile update route now protected with your strict file upload rules
router.put('/profile', protect, upload.single('avatar'), updateProfile);

router.put('/password', protect, changePassword);

module.exports = router;