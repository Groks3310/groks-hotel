const dns = require('node:dns');
dns.setServers(['8.8.8.8', '1.1.1.1']); 

require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

// ── IMPORT SECURITY CONFIGURATION ────────────────────
const {
  helmetConfig,
  apiLimiter,
  authLimiter,
  paymentLimiter,
  chatLimiter,
  mongoSanitizeConfig,
  xssClean,
  hppConfig,
} = require('./middleware/security'); // Clean path pointing to your security.js file

// Connect Database
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Make io accessible in controllers
app.set('io', io);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  socket.on('joinRoom', (roomId) => {
    socket.join(`room:${roomId}`);
    console.log(`Socket ${socket.id} joined room:${roomId}`);
  });

  socket.on('leaveRoom', (roomId) => {
    socket.leave(`room:${roomId}`);
  });

  socket.on('joinAdmin', () => {
    socket.join('admin');
    console.log(`Admin socket joined: ${socket.id}`);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// ── SECURED CORS MIDDLEWARE (The Guest List) ─────────
const allowedOrigins = [
  process.env.CLIENT_URL,      // Your live deployed website URL (saved inside your .env file later)
  'http://localhost:5173',     // Your local Vite frontend port
  'http://localhost:5174'      // Your local backend/fallback port from your network log
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like your frontend Axios client initialization, Postman, or mobile apps)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true); // Origin is trusted, let them through!
    } else {
      return callback(new Error('CORS Policy Violation: Access denied for this origin.'), false);
    }
  },
  credentials: true, // Enables secure cookie tracking between frontend and backend
}));

// Standard Body Parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── GLOBAL SECURITY MIDDLEWARE ───────────────────────
app.use(helmetConfig);            // Sets defensive HTTP headers
app.use(mongoSanitizeConfig);     // Sanitizes data to prevent NoSQL injection
app.use(xssClean);                // Scrubs malicious script tags from requests
app.use(hppConfig);               // Protects against HTTP Parameter Pollution
app.use('/api', apiLimiter);      // General rate limit: 100 requests per 10 mins per IP

// ── ROUTES WITH SPECIFIC SECURITY LIMITERS ───────────

// Auth route protected with brute-force rate limiter
app.use('/api/auth', authLimiter, require('./routes/auth'));

app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/bookings', require('./routes/bookings'));

// Payments route protected from transaction spamming
app.use('/api/payments', paymentLimiter, require('./routes/payments'));

app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/admin', require('./routes/admin'));

// AI Chatbot endpoint restricted to prevent API quota/resource burning
app.use('/api/chat', chatLimiter, require('./routes/chat'));

app.use('/api/receipt', require('./routes/receipt'));
app.use('/api/seed', require('./routes/seed'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

module.exports = { app, io };