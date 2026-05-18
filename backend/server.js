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
} = require('./middleware/security'); 

// Connect Database
connectDB();

const app = express();
app.set('trust proxy', 1);
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      const isLocal = origin.includes('localhost') || origin.includes('127.0.0.1');
      const isVercel = origin.includes('vercel.app');
      if (isLocal || isVercel) {
        return callback(null, true);
      } else {
        return callback(new Error('CORS Policy Violation for Socket.io'), false);
      }
    },
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

// ── DYNAMIC CORS MIDDLEWARE (The Smart Guest List) ───
app.use(cors({
  origin: function (origin, callback) {
    // 1. Allow requests with no origin (like internal server checks or Postman)
    if (!origin) return callback(null, true);
    
    // 2. Trust local development environments
    const isLocal = origin.includes('localhost') || origin.includes('127.0.0.1');
    
    // 3. Trust ANY live deployment or deployment preview links coming from Vercel
    const isVercel = origin.includes('vercel.app');

    if (isLocal || isVercel) {
      return callback(null, true); 
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
app.use(helmetConfig);        
app.use(mongoSanitizeConfig); 
app.use(xssClean);            
app.use(hppConfig);           
app.use('/api', apiLimiter);  

// ── ROUTES WITH SPECIFIC SECURITY LIMITERS ───────────
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/payments', paymentLimiter, require('./routes/payments'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/admin', require('./routes/admin'));
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