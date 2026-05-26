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

// ── IMPORT SECURITY CONFIGURATION ──
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

// ── 1. PROXY SETTING (Must run before any rate-limiters) ──
app.set('trust proxy', 1);

// ── 2. STANDARD BODY PARSERS (Must run before routes and sanitizers) ──
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// ── FIXED ABSOLUTE PATH STATIC ASSET ROUTER ──
app.use('/uploads/:filename', (req, res, next) => {
  // path.resolve starts directly at the root folder 'groks-hotel-backend'
  // and looks for the 'uploads' folder no matter how the app is started on Render.
  const filePath = path.resolve('uploads', req.params.filename);

  // Set explicit cross-origin permissions
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

  // If the file physically exists on Render's disk, stream it
  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }

  // If the file is missing from Render's disk, redirect to the default image instead of throwing a 404
  res.redirect('https://cdn-icons-png.flaticon.com/512/149/149071.png');
});

// Fallback base configuration for general directory access
app.use('/uploads', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.resolve('uploads')));

const server = http.createServer(app);

// ── 3. SOCKET.IO SETUP ───────────────────────────────
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

// Ensure uploads directory exists at root level
const uploadsDir = path.resolve('uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// ── 4. DYNAMIC CORS MIDDLEWARE (The Smart Guest List) ───
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    const isLocal = origin.includes('localhost') || origin.includes('127.0.0.1');
    const isVercel = origin.includes('vercel.app');

    if (isLocal || isVercel) {
      return callback(null, true); 
    } else {
      return callback(new Error('CORS Policy Violation: Access denied for this origin.'), false);
    }
  },
  credentials: true, 
}));

// ── 5. GLOBAL SECURITY MIDDLEWARE ────────────────────────
// Force browser headers to cooperate with cross-origin environments
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "credentialless");
  next();
});

// Using your pre-configured helmet setup from security.js
app.use(helmetConfig);        

app.use(mongoSanitizeConfig); 
app.use(xssClean);            
app.use(hppConfig);           
app.use('/api', apiLimiter);  

// ── 6. ROUTES WITH SPECIFIC SECURITY LIMITERS ───────────
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