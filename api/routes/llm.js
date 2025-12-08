/**
 * Server-side LLM Proxy Endpoint
 *
 * This endpoint securely proxies LLM requests from the frontend.
 * The actual LLM API key is stored server-side (not exposed to clients).
 *
 * Deployment: Deploy as a serverless function (Vercel, Netlify) or Node.js API
 *
 * Environment Variables (server-side only):
 * - CLAUDE_API_KEY: Your Claude API key (secret)
 * - CLAUDE_MODEL: Claude model to use (e.g., "claude-haiku-4.5")
 * - INTERNAL_API_KEY: Shared token between frontend and this proxy (for authentication)
 *
 * Rate Limiting:
 * - 10 requests per minute per IP address
 * - Returns 429 Too Many Requests when exceeded
 *
 * Example usage from client:
 * ```
 * const response = await fetch('/api/llm', {
 *   method: 'POST',
 *   headers: {
 *     'Content-Type': 'application/json',
 *     'x-internal-api-key': INTERNAL_API_KEY // frontend shared token
 *   },
 *   body: JSON.stringify({ prompt: 'What is...' })
 * });
 * ```
 */

import { applyRateLimit, RATE_LIMIT_PRESETS } from '../lib/rateLimit.js';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Apply rate limiting (10 requests/minute for LLM)
  if (applyRateLimit(req, res, { ...RATE_LIMIT_PRESETS.llm, keyPrefix: 'llm' })) {
    return; // Response already sent by applyRateLimit
  }

  // Check internal API key for authentication
  const internalKey = req.headers['x-internal-api-key'];
  const expectedKey = process.env.INTERNAL_API_KEY;

  if (!expectedKey || internalKey !== expectedKey) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Extract request body
  const { prompt, response_json_schema = null } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  // Check if Claude API is configured
  const claudeKey = process.env.CLAUDE_API_KEY;
  const claudeModel = process.env.CLAUDE_MODEL || 'claude-haiku-4.5';

  if (!claudeKey) {
    console.error('CLAUDE_API_KEY not configured in server environment');
    return res.status(500).json({ error: 'LLM service not configured' });
  }

  try {
    // Build system prompt
    const systemPrompt = `You are a helpful AI assistant for Saintpaulia Studio, an app for African violet collectors.
Respond helpfully and accurately about plant care, propagation, and cultivation.${
      response_json_schema
        ? `\n\nIMPORTANT: You MUST respond with valid JSON matching this schema:\n${JSON.stringify(
            response_json_schema,
            null,
            2
          )}`
        : ''
    }`;

    // Call Claude API (server-side, secret is protected)
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': claudeKey, // PROTECTED: Only sent from server
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: claudeModel,
        max_tokens: 1024,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Claude API error: ${response.status} ${errorText}`);
      return res.status(response.status).json({
        error: `Claude API error: ${response.status}`,
        details: errorText,
      });
    }

    const data = await response.json();
    const responseText = data.content?.[0]?.type === 'text' ? data.content[0].text : '';

    // Parse JSON if schema was requested
    if (response_json_schema) {
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        const parsedData = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
        return res.status(200).json({
          data: parsedData,
          model: claudeModel,
          usage: data.usage,
        });
      } catch (parseError) {
        console.error('Failed to parse Claude JSON response:', parseError);
        return res.status(200).json({
          data: { error: 'Invalid JSON in response' },
          raw_response: responseText,
        });
      }
    } else {
      return res.status(200).json({
        response: responseText,
        model: claudeModel,
        usage: data.usage,
      });
    }
  } catch (error) {
    console.error('LLM proxy error:', error);
    return res.status(500).json({
      error: 'LLM proxy failed',
      message: error.message,
    });
  }
}
