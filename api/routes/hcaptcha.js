/**
 * Server-side hCaptcha Verification Endpoint
 *
 * This endpoint securely verifies hCaptcha tokens from the frontend.
 * The actual hCaptcha secret is stored server-side (not exposed to clients).
 *
 * Deployment: Deploy as a serverless function (Vercel, Netlify) or Node.js API
 *
 * Environment Variables (server-side only):
 * - HCAPTCHA_SECRET: Your hCaptcha secret key (secret)
 * - INTERNAL_API_KEY: Shared token between frontend and this proxy (for authentication)
 *
 * Rate Limiting:
 * - 20 requests per minute per IP address
 * - Returns 429 Too Many Requests when exceeded
 *
 * Example usage from client:
 * ```
 * const response = await fetch('/api/verify-hcaptcha', {
 *   method: 'POST',
 *   headers: {
 *     'Content-Type': 'application/json',
 *     'x-internal-api-key': INTERNAL_API_KEY // frontend shared token
 *   },
 *   body: JSON.stringify({ token: 'hcaptcha-response-token' })
 * });
 * ```
 */

import { applyRateLimit, RATE_LIMIT_PRESETS } from '../lib/rateLimit.js';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Apply rate limiting (20 requests/minute for hCaptcha)
  if (applyRateLimit(req, res, { ...RATE_LIMIT_PRESETS.hcaptcha, keyPrefix: 'hcaptcha' })) {
    return; // Response already sent by applyRateLimit
  }

  // Check internal API key for authentication
  const internalKey = req.headers['x-internal-api-key'];
  const expectedKey = process.env.INTERNAL_API_KEY;

  if (!expectedKey || internalKey !== expectedKey) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Extract request body
  const { token, remoteip = null } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Missing hCaptcha token' });
  }

  // Check if hCaptcha secret is configured
  const hcaptchaSecret = process.env.HCAPTCHA_SECRET;

  if (!hcaptchaSecret) {
    console.error('HCAPTCHA_SECRET not configured in server environment');
    return res.status(500).json({ error: 'hCaptcha service not configured' });
  }

  try {
    // Build form parameters for hCaptcha verification
    const params = new URLSearchParams();
    params.append('response', token);
    params.append('secret', hcaptchaSecret); // PROTECTED: Only sent from server

    if (remoteip) {
      params.append('remoteip', remoteip);
    }

    // Call hCaptcha API (server-side, secret is protected)
    const response = await fetch('https://hcaptcha.com/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      console.error(`hCaptcha API error: ${response.status}`);
      return res.status(response.status).json({
        error: `hCaptcha API error: ${response.status}`,
      });
    }

    const result = await response.json();

    return res.status(200).json({
      success: result.success === true,
      challenge_ts: result.challenge_ts,
      hostname: result.hostname,
      error_codes: result['error-codes'] || null,
      // Optional: add rate limiting, scoring, etc. here
    });
  } catch (error) {
    console.error('hCaptcha verification error:', error);
    return res.status(500).json({
      error: 'hCaptcha verification failed',
      message: error.message,
    });
  }
}
