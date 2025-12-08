/**
 * Simple in-memory rate limiter for serverless functions
 *
 * This provides basic protection against abuse. For production at scale,
 * consider using Redis or a dedicated rate limiting service (e.g., Upstash).
 *
 * Note: In serverless environments, each instance has its own memory,
 * so this provides per-instance limiting. For stricter global limits,
 * use a shared store like Redis.
 */

// In-memory store for rate limiting
// Format: { [key]: { count: number, resetTime: number } }
const rateLimitStore = new Map();

// Clean up expired entries periodically (every 5 minutes)
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;

  lastCleanup = now;
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Get client IP from request headers
 * Handles various proxy configurations (Vercel, Cloudflare, nginx, etc.)
 */
function getClientIp(req) {
  // Check common proxy headers
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) {
    // x-forwarded-for can be a comma-separated list; take the first (original client)
    return forwardedFor.split(',')[0].trim();
  }

  // Vercel-specific
  const vercelForwardedFor = req.headers['x-vercel-forwarded-for'];
  if (vercelForwardedFor) {
    return vercelForwardedFor.split(',')[0].trim();
  }

  // Cloudflare
  const cfConnectingIp = req.headers['cf-connecting-ip'];
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  // Real IP (nginx)
  const realIp = req.headers['x-real-ip'];
  if (realIp) {
    return realIp;
  }

  // Fallback to socket address
  return req.socket?.remoteAddress || req.connection?.remoteAddress || 'unknown';
}

/**
 * Rate limit configuration presets
 */
export const RATE_LIMIT_PRESETS = {
  // LLM calls are expensive - strict limits
  llm: {
    windowMs: 60 * 1000,      // 1 minute window
    maxRequests: 10,          // 10 requests per minute per IP
    message: 'Too many LLM requests. Please wait before trying again.',
  },
  // hCaptcha verification - moderate limits
  hcaptcha: {
    windowMs: 60 * 1000,      // 1 minute window
    maxRequests: 20,          // 20 requests per minute per IP
    message: 'Too many verification attempts. Please wait before trying again.',
  },
  // Generic API - default limits
  default: {
    windowMs: 60 * 1000,      // 1 minute window
    maxRequests: 60,          // 60 requests per minute per IP
    message: 'Too many requests. Please slow down.',
  },
};

/**
 * Check if request is rate limited
 *
 * @param {Object} req - Request object
 * @param {Object} options - Rate limit options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.maxRequests - Maximum requests allowed in window
 * @param {string} options.keyPrefix - Optional prefix for the rate limit key
 * @returns {{ limited: boolean, remaining: number, resetIn: number }}
 */
export function checkRateLimit(req, options = {}) {
  const {
    windowMs = 60 * 1000,
    maxRequests = 60,
    keyPrefix = 'rl',
  } = options;

  // Run cleanup periodically
  cleanup();

  const ip = getClientIp(req);
  const key = `${keyPrefix}:${ip}`;
  const now = Date.now();

  let record = rateLimitStore.get(key);

  // If no record or window expired, create new record
  if (!record || now > record.resetTime) {
    record = {
      count: 1,
      resetTime: now + windowMs,
    };
    rateLimitStore.set(key, record);

    return {
      limited: false,
      remaining: maxRequests - 1,
      resetIn: Math.ceil(windowMs / 1000),
    };
  }

  // Increment count
  record.count += 1;

  // Check if over limit
  const remaining = Math.max(0, maxRequests - record.count);
  const resetIn = Math.ceil((record.resetTime - now) / 1000);

  if (record.count > maxRequests) {
    return {
      limited: true,
      remaining: 0,
      resetIn,
    };
  }

  return {
    limited: false,
    remaining,
    resetIn,
  };
}

/**
 * Apply rate limiting to a request/response
 * Returns true if request should be blocked, false if allowed
 *
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Object} options - Rate limit options (use RATE_LIMIT_PRESETS)
 * @returns {boolean} - true if blocked, false if allowed
 */
export function applyRateLimit(req, res, options = RATE_LIMIT_PRESETS.default) {
  const { windowMs, maxRequests, message } = { ...RATE_LIMIT_PRESETS.default, ...options };

  const result = checkRateLimit(req, {
    windowMs,
    maxRequests,
    keyPrefix: options.keyPrefix || 'api',
  });

  // Set rate limit headers
  res.setHeader('X-RateLimit-Limit', maxRequests);
  res.setHeader('X-RateLimit-Remaining', result.remaining);
  res.setHeader('X-RateLimit-Reset', result.resetIn);

  if (result.limited) {
    res.setHeader('Retry-After', result.resetIn);
    res.status(429).json({
      error: 'Rate limit exceeded',
      message: message || 'Too many requests. Please try again later.',
      retryAfter: result.resetIn,
    });
    return true;
  }

  return false;
}
