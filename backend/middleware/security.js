const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')

// ── 1. HELMET — Secure HTTP headers ─────────────────
const helmetConfig = helmet({
  contentSecurityPolicy: false, 
  crossOriginEmbedderPolicy: false,
})

// ── 2. RATE LIMITING ─────────────────────────────────

// General API rate limit
const apiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 10 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false }, // <-- Added to stop Render crash
})

// Auth rate limit
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, 
  validate: { xForwardedForHeader: false }, // <-- Added to stop Render crash
})

// Payment rate limit
const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: 'Too many payment requests. Please try again after an hour.',
  },
  validate: { xForwardedForHeader: false }, // <-- Added to stop Render crash
})

// Chat rate limit
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: {
    success: false,
    message: 'Too many chat messages. Please slow down.',
  },
  validate: { xForwardedForHeader: false }, // <-- Added to stop Render crash
})

// ── 3. MONGO SANITIZE ────────────────────────────────
const mongoSanitizeConfig = mongoSanitize({
  replaceWith: '_',
})

// ── 4. XSS CLEAN ─────────────────────────────────────
const xssClean = xss()

// ── 5. HPP — HTTP Parameter Pollution ────────────────
const hppConfig = hpp({
  whitelist: ['price', 'capacity', 'category'], 
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