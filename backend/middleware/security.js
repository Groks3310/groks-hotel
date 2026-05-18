const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')

// ── 1. HELMET — Secure HTTP headers ─────────────────
// Protects against clickjacking, XSS, MIME sniffing etc.
const helmetConfig = helmet({
  contentSecurityPolicy: false, // disabled to allow frontend assets
  crossOriginEmbedderPolicy: false,
})

// ── 2. RATE LIMITING ─────────────────────────────────

// General API rate limit — 100 requests per 10 minutes per IP
const apiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 10 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Auth rate limit — 10 attempts per 15 minutes (stops brute force login)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // only count failed requests
})

// Payment rate limit — 20 per hour (prevents payment abuse)
const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: 'Too many payment requests. Please try again after an hour.',
  },
})

// Chat rate limit — 30 messages per minute
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: {
    success: false,
    message: 'Too many chat messages. Please slow down.',
  },
})

// ── 3. MONGO SANITIZE ────────────────────────────────
// Prevents NoSQL injection attacks e.g. { "$gt": "" }
const mongoSanitizeConfig = mongoSanitize({
  replaceWith: '_',
})

// ── 4. XSS CLEAN ─────────────────────────────────────
// Strips malicious HTML/JS from request body
const xssClean = xss()

// ── 5. HPP — HTTP Parameter Pollution ────────────────
// Prevents duplicate query parameters attacks
const hppConfig = hpp({
  whitelist: ['price', 'capacity', 'category'], // allow duplicates for filters
})

module.exports = {
  helmetConfig,
  apiLimiter,
  authLimiter,
  paymentLimiter,
  chatLimiter,
  mongoSanitizeConfig,
  xssClean,
  hppConfig,
}