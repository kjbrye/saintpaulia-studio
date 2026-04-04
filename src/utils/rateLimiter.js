/**
 * Token-bucket rate limiter for API calls.
 *
 * Allows bursts up to `maxTokens` and refills at `refillRate` tokens/second.
 * When the bucket is empty, requests are delayed until a token is available.
 */
export function createRateLimiter({ maxTokens = 30, refillRate = 10 } = {}) {
  let tokens = maxTokens;
  let lastRefill = Date.now();

  function refill() {
    const now = Date.now();
    const elapsed = (now - lastRefill) / 1000;
    tokens = Math.min(maxTokens, tokens + elapsed * refillRate);
    lastRefill = now;
  }

  function waitForToken() {
    refill();
    if (tokens >= 1) {
      tokens -= 1;
      return Promise.resolve();
    }
    const waitMs = ((1 - tokens) / refillRate) * 1000;
    tokens = 0;
    return new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  return { waitForToken };
}

/**
 * Wraps the global fetch with rate limiting.
 * Only limits requests to the Supabase API URL.
 */
export function createRateLimitedFetch(supabaseUrl) {
  const limiter = createRateLimiter({ maxTokens: 30, refillRate: 10 });

  return async (input, init) => {
    const url = typeof input === 'string' ? input : input.url;
    if (url.startsWith(supabaseUrl)) {
      await limiter.waitForToken();
    }
    return fetch(input, init);
  };
}
